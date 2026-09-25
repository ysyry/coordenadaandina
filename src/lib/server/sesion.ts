import { randomBytes, scryptSync, createHash, timingSafeEqual } from 'node:crypto';
import { eq, lt, and } from 'drizzle-orm';
import { db, schema } from './db';

/** Nombre de la cookie de sesión. */
export const COOKIE = 'areal_sesion';

/** Cuánto dura una sesión sin volver a pedir la clave. */
const DIAS = 30;

/* ---------- claves ---------- */

const N = 16384, R = 8, P = 1, LARGO = 64;

/** Guarda `scrypt$sal$derivada`. La clave en limpio no se escribe en ningún lado. */
export function hashear(clave: string): string {
	const sal = randomBytes(16);
	const derivada = scryptSync(clave.normalize('NFKC'), sal, LARGO, { N, r: R, p: P });
	return `scrypt$${sal.toString('hex')}$${derivada.toString('hex')}`;
}

/** Compara sin filtrar por tiempo: una comparación común deja adivinar de a una letra. */
export function verificar(clave: string, guardado: string): boolean {
	const [algoritmo, salHex, esperadaHex] = guardado.split('$');
	if (algoritmo !== 'scrypt' || !salHex || !esperadaHex) return false;
	const esperada = Buffer.from(esperadaHex, 'hex');
	const derivada = scryptSync(clave.normalize('NFKC'), Buffer.from(salHex, 'hex'), esperada.length, {
		N, r: R, p: P
	});
	return timingSafeEqual(derivada, esperada);
}

/* ---------- sesiones ---------- */

const huellaDe = (token: string) => createHash('sha256').update(token).digest('hex');

/** Abre una sesión y devuelve el token que va a la cookie. */
export async function abrirSesion(usuarioId: string): Promise<{ token: string; expira: Date }> {
	const token = randomBytes(32).toString('base64url');
	const expira = new Date(Date.now() + DIAS * 24 * 60 * 60 * 1000);
	await db.insert(schema.sesion).values({ huella: huellaDe(token), usuarioId, expira });
	return { token, expira };
}

/** Devuelve quién es, o null si el token no sirve o venció. */
export async function quienEs(token: string | undefined) {
	if (!token) return null;

	const filas = await db
		.select({
			id: schema.usuario.id,
			nombre: schema.usuario.nombre,
			email: schema.usuario.email,
			tenantId: schema.usuario.tenantId,
			docenteId: schema.usuario.docenteId,
			admin: schema.usuario.admin,
			expira: schema.sesion.expira,
			activa: schema.usuario.activa
		})
		.from(schema.sesion)
		.innerJoin(schema.usuario, eq(schema.usuario.id, schema.sesion.usuarioId))
		.where(eq(schema.sesion.huella, huellaDe(token)))
		.limit(1);

	const fila = filas[0];
	if (!fila || !fila.activa || fila.expira.getTime() < Date.now()) return null;

	return {
		id: fila.id,
		nombre: fila.nombre,
		email: fila.email,
		tenantId: fila.tenantId,
		docenteId: fila.docenteId,
		admin: fila.admin
	};
}

/** Cierra esta sesión. Las demás de la misma persona siguen abiertas. */
export async function cerrarSesion(token: string | undefined) {
	if (!token) return;
	await db.delete(schema.sesion).where(eq(schema.sesion.huella, huellaDe(token)));
}

/** Limpia lo vencido. Se llama de vez en cuando, no en cada visita. */
export async function limpiarVencidas() {
	await db.delete(schema.sesion).where(lt(schema.sesion.expira, new Date()));
}

/** Busca una usuaria activa por su correo. */
export async function buscarUsuaria(email: string) {
	const filas = await db
		.select()
		.from(schema.usuario)
		.where(and(eq(schema.usuario.email, email.trim().toLowerCase()), eq(schema.usuario.activa, true)))
		.limit(1);
	return filas[0] ?? null;
}

/** ¿Hay alguna usuaria cargada? Si no hay, la app lo avisa en vez de dejar entrar. */
export async function hayUsuarias(): Promise<boolean> {
	const filas = await db.select({ id: schema.usuario.id }).from(schema.usuario).limit(1);
	return filas.length > 0;
}
