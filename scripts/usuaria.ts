/**
 * Alta y cambio de clave de las usuarias de Areal.
 *
 *   npm run usuaria -- alta  alguien@escuela.edu.ar "Nombre Apellido" "una clave larga"
 *   npm run usuaria -- clave alguien@escuela.edu.ar "otra clave"
 *   npm run usuaria -- baja  alguien@escuela.edu.ar
 *   npm run usuaria -- lista
 *
 * No hay registro abierto: las usuarias se crean acá, a mano.
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { randomBytes, scryptSync } from 'node:crypto';
import * as s from '../src/lib/server/db/schema';

const TENANT = '00000000-0000-4000-8000-000000000001';
const MINIMO = 10;

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql, { schema: s });

function hashear(clave: string): string {
	const sal = randomBytes(16);
	const derivada = scryptSync(clave.normalize('NFKC'), sal, 64, { N: 16384, r: 8, p: 1 });
	return `scrypt$${sal.toString('hex')}$${derivada.toString('hex')}`;
}

const [accion, email, ...resto] = process.argv.slice(2);
const correo = (email ?? '').trim().toLowerCase();

try {
	if (accion === 'lista') {
		const filas = await db.select().from(s.usuario);
		if (!filas.length) console.log('No hay usuarias cargadas.');
		for (const u of filas) {
			console.log(
				`${u.activa ? '·' : '✕'} ${u.email.padEnd(30)} ${u.nombre.padEnd(26)} ` +
					`${u.ultimoIngreso ? 'último ingreso ' + u.ultimoIngreso.toLocaleDateString('es-AR') : 'nunca entró'}`
			);
		}
	} else if (accion === 'alta') {
		const nombre = resto[0];
		const clave = resto[1];
		if (!correo || !nombre || !clave) throw new Error('Faltan datos: alta <correo> <nombre> <clave>');
		if (clave.length < MINIMO) throw new Error(`La clave tiene que tener al menos ${MINIMO} caracteres.`);
		// La primera usuaria administra: si no, nadie podría dar de alta a las demás.
		const hay = await db.select({ id: s.usuario.id }).from(s.usuario).limit(1);
		const admin = hay.length === 0 || resto.includes('--admin');
		await db.insert(s.usuario).values({
			tenantId: TENANT, email: correo, nombre, clave: hashear(clave), admin
		});
		console.log(`Alta lista: ${nombre} <${correo}>${admin ? ' · administra' : ''}`);
	} else if (accion === 'clave') {
		const clave = resto[0];
		if (!correo || !clave) throw new Error('Faltan datos: clave <correo> <clave nueva>');
		if (clave.length < MINIMO) throw new Error(`La clave tiene que tener al menos ${MINIMO} caracteres.`);
		const r = await db.update(s.usuario).set({ clave: hashear(clave) })
			.where(eq(s.usuario.email, correo)).returning();
		if (!r.length) throw new Error(`No existe ${correo}.`);
		// Al cambiar la clave se cierran las sesiones abiertas de esa persona.
		await db.delete(s.sesion).where(eq(s.sesion.usuarioId, r[0].id));
		console.log(`Clave cambiada para ${correo}. Las sesiones abiertas se cerraron.`);
	} else if (accion === 'baja') {
		if (!correo) throw new Error('Falta el correo.');
		const r = await db.update(s.usuario).set({ activa: false })
			.where(eq(s.usuario.email, correo)).returning();
		if (!r.length) throw new Error(`No existe ${correo}.`);
		await db.delete(s.sesion).where(eq(s.sesion.usuarioId, r[0].id));
		console.log(`${correo} ya no entra.`);
	} else {
		console.log('Usos: alta <correo> <nombre> <clave> · clave <correo> <clave> · baja <correo> · lista');
	}
} catch (e) {
	console.error(e instanceof Error ? e.message : e);
	process.exitCode = 1;
} finally {
	await sql.end();
}
