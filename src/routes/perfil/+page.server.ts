import { db, schema as s } from '$lib/server/db';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { hashear, verificar } from '$lib/server/sesion';
import { dictados, nombreDictado } from '$lib/server/modelo';
import { TENANT } from '$lib/server/tenant';
import type { Actions, PageServerLoad } from './$types';

const MINIMO = 10;
const ROLES = ['titular', 'suplente', 'dupla'];

/** Acepta lo que escribe una persona apurada, no lo que dice la RFC. */
const correoValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/**
 * Un dictado declarado necesita un puesto al que colgar la ocupación.
 * Se reusa el del mismo espacio si ya existe; si no, se crea uno con el
 * nombre del espacio. Nunca con el nombre de la persona: los puestos son
 * roles, no personas.
 */
async function puestoDelEspacio(espacioEscuelaId: string, nombre: string) {
	const [hay] = await db.select({ puestoId: s.dictado.puestoId })
		.from(s.dictado)
		.where(and(eq(s.dictado.espacioEscuelaId, espacioEscuelaId), isNotNull(s.dictado.puestoId)))
		.limit(1);
	if (hay?.puestoId) return hay.puestoId;

	const [nuevo] = await db.insert(s.docente)
		.values({ tenantId: TENANT, nombre: `${nombre} · sin asignar`,
			email: `${espacioEscuelaId}@areal.local` })
		.returning({ id: s.docente.id });
	return nuevo.id;
}

export const load: PageServerLoad = async ({ locals }) => {
	const yo = locals.usuario;
	if (!yo) error(401, 'Hay que entrar.');

	const [avisos, ocupaciones, todos, espacios] = await Promise.all([
		db.select({ id: s.usuarioAviso.id, email: s.usuarioAviso.email })
			.from(s.usuarioAviso)
			.where(eq(s.usuarioAviso.usuarioId, yo.id))
			.orderBy(asc(s.usuarioAviso.creado)),
		db.select().from(s.ocupacion).where(eq(s.ocupacion.usuarioId, yo.id)),
		dictados(TENANT),
		db.select({ id: s.espacioEscuela.id, nombre: s.espacioEscuela.nombre,
			rama: s.espacioEscuela.rama, anios: s.espacioEscuela.anios })
			.from(s.espacioEscuela)
			.where(eq(s.espacioEscuela.tenantId, TENANT))
			.orderBy(asc(s.espacioEscuela.nombre))
	]);

	// Ocupar un puesto entero trae todos sus dictados: eso no se desmarca de a uno.
	const puestosEnteros = ocupaciones.filter((o) => !o.dictadoId).map((o) => o.puestoId);
	const sueltos = new Map(
		ocupaciones.filter((o) => o.dictadoId).map((o) => [o.dictadoId!, o.rol])
	);

	const mios = todos.map((d) => ({
		id: d.id,
		anio: d.anio,
		nombre: nombreDictado(d),
		// La rama sólo se nombra si agrega algo: «Diseño · rama Diseño» no agrega.
		espacio: d.rama && d.rama !== d.espacio ? `${d.espacio} · rama ${d.rama}` : d.espacio,
		porPuesto: !!(d.puestoId && puestosEnteros.includes(d.puestoId)),
		rol: sueltos.get(d.id) ?? null
	}));

	const cursos = await db.select({ id: s.curso.id, anio: s.curso.anioEscolar })
		.from(s.curso).where(eq(s.curso.tenantId, TENANT)).orderBy(asc(s.curso.anioEscolar));

	return {
		yo: { nombre: yo.nombre, email: yo.email, admin: yo.admin },
		avisos,
		dictados: mios,
		espacios,
		cursos,
		roles: ROLES
	};
};

export const actions: Actions = {
	/** El nombre con el que firma lo que escribe. */
	nombre: async ({ request, locals }) => {
		const yo = locals.usuario;
		if (!yo) error(401, 'Hay que entrar.');
		const nombre = String((await request.formData()).get('nombre') ?? '').trim();
		if (nombre.length < 2) return fail(400, { error: 'Poné un nombre.' });
		await db.update(s.usuario).set({ nombre }).where(eq(s.usuario.id, yo.id));
		return { hecho: 'nombre' };
	},

	/** Cambiar la propia clave: pide la actual, para que no alcance con dejar la sesión abierta. */
	clave: async ({ request, locals }) => {
		const yo = locals.usuario;
		if (!yo) error(401, 'Hay que entrar.');
		const d = await request.formData();
		const actual = String(d.get('actual') ?? '');
		const nueva = String(d.get('nueva') ?? '');
		const repite = String(d.get('repite') ?? '');

		if (nueva.length < MINIMO)
			return fail(400, { error: `La clave nueva tiene que tener al menos ${MINIMO} caracteres.` });
		if (nueva !== repite) return fail(400, { error: 'Las dos claves nuevas no coinciden.' });

		const [fila] = await db.select({ clave: s.usuario.clave })
			.from(s.usuario).where(eq(s.usuario.id, yo.id));
		if (!fila || !verificar(actual, fila.clave))
			return fail(400, { error: 'La clave actual no es esa.' });

		await db.update(s.usuario).set({ clave: hashear(nueva) }).where(eq(s.usuario.id, yo.id));
		return { hecho: 'clave' };
	},

	avisoAlta: async ({ request, locals }) => {
		const yo = locals.usuario;
		if (!yo) error(401, 'Hay que entrar.');
		const email = String((await request.formData()).get('email') ?? '').trim().toLowerCase();
		if (!correoValido(email)) return fail(400, { error: 'Ese correo no parece un correo.' });
		await db.insert(s.usuarioAviso).values({ usuarioId: yo.id, email }).onConflictDoNothing();
		return { hecho: 'aviso' };
	},

	avisoBaja: async ({ request, locals }) => {
		const yo = locals.usuario;
		if (!yo) error(401, 'Hay que entrar.');
		const id = String((await request.formData()).get('id') ?? '');
		await db.delete(s.usuarioAviso)
			.where(and(eq(s.usuarioAviso.id, id), eq(s.usuarioAviso.usuarioId, yo.id)));
		return { hecho: 'aviso' };
	},

	/**
	 * Qué dictados da. Se reescriben sólo las ocupaciones de a un dictado:
	 * las de puesto entero las pone quien administra y no se tocan desde acá.
	 */
	dictados: async ({ request, locals }) => {
		const yo = locals.usuario;
		if (!yo) error(401, 'Hay que entrar.');
		const d = await request.formData();
		const elegidos = d.getAll('dictado').map(String);

		const todos = await dictados(TENANT);
		const validos = todos.filter((x) => elegidos.includes(x.id) && x.puestoId);

		await db.delete(s.ocupacion)
			.where(and(eq(s.ocupacion.usuarioId, yo.id), isNotNull(s.ocupacion.dictadoId)));
		if (validos.length)
			await db.insert(s.ocupacion).values(validos.map((x) => {
				const rol = String(d.get(`rol.${x.id}`) ?? 'titular');
				return {
					usuarioId: yo.id, puestoId: x.puestoId!, dictadoId: x.id,
					rol: ROLES.includes(rol) ? rol : 'titular'
				};
			}));
		return { hecho: 'dictados' };
	},

	/** Sumar algo que da y que el horario cargado no tiene. */
	declarar: async ({ request, locals }) => {
		const yo = locals.usuario;
		if (!yo) error(401, 'Hay que entrar.');
		const d = await request.formData();
		const cursoId = String(d.get('cursoId') ?? '');
		const espacioEscuelaId = String(d.get('espacioEscuelaId') ?? '');
		if (!cursoId || !espacioEscuelaId)
			return fail(400, { error: 'Elegí el año y el espacio.' });

		const [espacio] = await db.select({ nombre: s.espacioEscuela.nombre })
			.from(s.espacioEscuela).where(eq(s.espacioEscuela.id, espacioEscuelaId));
		if (!espacio) return fail(400, { error: 'Ese espacio no existe.' });

		const puestoId = await puestoDelEspacio(espacioEscuelaId, espacio.nombre);

		const [dic] = await db.insert(s.dictado)
			.values({ tenantId: TENANT, cursoId, espacioEscuelaId, puestoId, origen: 'declarado' })
			.onConflictDoNothing()
			.returning({ id: s.dictado.id });

		// Si ya existía ese dictado, se ocupa el que hay en vez de crear otro.
		const dictadoId = dic?.id ?? (await db.select({ id: s.dictado.id }).from(s.dictado)
			.where(and(eq(s.dictado.cursoId, cursoId),
				eq(s.dictado.espacioEscuelaId, espacioEscuelaId),
				eq(s.dictado.puestoId, puestoId))).limit(1))[0]?.id;
		if (!dictadoId) return fail(400, { error: 'No se pudo crear el dictado.' });

		const [yaEsta] = await db.select({ id: s.ocupacion.id }).from(s.ocupacion)
			.where(and(eq(s.ocupacion.usuarioId, yo.id), eq(s.ocupacion.dictadoId, dictadoId)));
		if (!yaEsta)
			await db.insert(s.ocupacion)
				.values({ usuarioId: yo.id, puestoId, dictadoId, rol: 'titular' });

		return { hecho: 'dictados' };
	}
};
