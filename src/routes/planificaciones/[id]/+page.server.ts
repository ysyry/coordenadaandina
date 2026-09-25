import { db, schema as s } from '$lib/server/db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { clasesReales, diasSinClase } from '$lib/clases';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';


export const load: PageServerLoad = async ({ params }) => {
	const [plan] = await db.select().from(s.planMateria)
		.where(and(eq(s.planMateria.id, params.id), eq(s.planMateria.tenantId, TENANT)));
	if (!plan) error(404, 'No existe esa planificación');

	const [curso] = await db.select().from(s.curso).where(eq(s.curso.id, plan.cursoId));

	const bloques = await db
		.select({ dia: s.bloque.dia, desde: s.bloque.desde, hasta: s.bloque.hasta, docente: s.docente.nombre })
		.from(s.bloque)
		.leftJoin(s.docente, eq(s.docente.id, s.bloque.docenteId))
		.where(and(eq(s.bloque.cursoId, plan.cursoId), eq(s.bloque.espacio, plan.espacio)));

	const eventos = await db
		.select({ fecha: s.evento.fecha, hasta: s.evento.hasta,
			afectaClases: s.evento.afectaClases, cursoId: s.evento.cursoId })
		.from(s.evento).where(eq(s.evento.tenantId, TENANT));

	const clases = clasesReales(bloques.map((b) => b.dia), plan.cuatrimestre,
		diasSinClase(eventos, plan.cursoId));

	const unidades = await db.select().from(s.unidad)
		.where(eq(s.unidad.planId, plan.id)).orderBy(asc(s.unidad.orden));

	const ids = unidades.map((u) => u.id);
	const enlaces = ids.length
		? await db.select().from(s.unidadNudo).where(inArray(s.unidadNudo.unidadId, ids))
		: [];

	// El catálogo de este cuatrimestre: lo que la norma prescribe acá.
	const catalogo = await db
		.select({
			id: s.nudo.id, codigo: s.nudo.codigo, nombre: s.nudo.nombre,
			disciplina: s.nudo.disciplina, orden: s.nudo.orden,
			titulo: s.nudoCuatrimestre.titulo, saberes: s.nudoCuatrimestre.saberes
		})
		.from(s.nudoCuatrimestre)
		.innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
		.where(eq(s.nudoCuatrimestre.cuatrimestre, plan.cuatrimestre))
		.orderBy(asc(s.nudo.disciplina), asc(s.nudo.orden));

	const epas = await db.select({ id: s.epa.id, nombre: s.epa.nombre, cuatrimestre: s.epa.cuatrimestre })
		.from(s.epa)
		.where(and(eq(s.epa.tenantId, TENANT), eq(s.epa.cursoId, plan.cursoId)));

	return {
		plan,
		curso: { anio: curso.anioEscolar, etiqueta: curso.etiqueta ?? `${curso.anioEscolar}º año` },
		docentes: [...new Set(bloques.map((b) => b.docente).filter(Boolean))] as string[],
		encuentros: bloques.length,
		clases,
		catalogo,
		epas,
		unidades: unidades.map((u) => ({
			...u,
			nudos: enlaces.filter((e) => e.unidadId === u.id).map((e) => e.nudoId)
		}))
	};
};

async function sincronizarNudos(unidadId: string, nudos: string[]) {
	await db.delete(s.unidadNudo).where(eq(s.unidadNudo.unidadId, unidadId));
	if (nudos.length) {
		await db.insert(s.unidadNudo).values(nudos.map((nudoId) => ({ unidadId, nudoId })));
	}
}

export const actions: Actions = {
	guardarPlan: async ({ request, params }) => {
		const f = await request.formData();
		await db.update(s.planMateria).set({
			proposito: String(f.get('proposito') ?? ''),
			criterios: String(f.get('criterios') ?? ''),
			acreditacion: String(f.get('acreditacion') ?? ''),
			notas: String(f.get('notas') ?? ''),
			estado: String(f.get('estado') ?? 'borrador')
		}).where(and(eq(s.planMateria.id, params.id), eq(s.planMateria.tenantId, TENANT)));
		return { ok: true };
	},

	nuevaUnidad: async ({ request, params }) => {
		const f = await request.formData();
		const titulo = String(f.get('titulo') ?? '').trim();
		if (!titulo) return fail(400, { error: 'La unidad necesita un título.' });
		const [{ max }] = await db
			.select({ max: sql<number>`coalesce(max(${s.unidad.orden}), 0)` })
			.from(s.unidad).where(eq(s.unidad.planId, params.id));
		const [nueva] = await db.insert(s.unidad).values({
			tenantId: TENANT, planId: params.id, titulo,
			orden: Number(max) + 10,
			clases: Number(f.get('clases') ?? 0) || 0,
			busca: String(f.get('busca') ?? '')
		}).returning({ id: s.unidad.id });
		await sincronizarNudos(nueva.id, f.getAll('nudo').map(String));
		return { ok: true };
	},

	guardarUnidad: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		const titulo = String(f.get('titulo') ?? '').trim();
		if (!id || !titulo) return fail(400, { error: 'Falta el título.' });
		const epaId = String(f.get('epaId') ?? '');
		await db.update(s.unidad).set({
			titulo,
			busca: String(f.get('busca') ?? ''),
			clases: Number(f.get('clases') ?? 0) || 0,
			producto: String(f.get('producto') ?? ''),
			criterios: String(f.get('criterios') ?? ''),
			epaId: epaId || null
		}).where(and(eq(s.unidad.id, id), eq(s.unidad.tenantId, TENANT)));
		await sincronizarNudos(id, f.getAll('nudo').map(String));
		return { ok: true };
	},

	borrarUnidad: async ({ request }) => {
		const f = await request.formData();
		await db.delete(s.unidad)
			.where(and(eq(s.unidad.id, String(f.get('id') ?? '')), eq(s.unidad.tenantId, TENANT)));
		return { ok: true };
	},

	mover: async ({ request, params }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		const dir = Number(f.get('dir') ?? 0);
		const lista = await db.select().from(s.unidad)
			.where(eq(s.unidad.planId, params.id)).orderBy(asc(s.unidad.orden));
		const i = lista.findIndex((u) => u.id === id);
		const j = i + dir;
		if (i < 0 || j < 0 || j >= lista.length) return { ok: true };
		await db.update(s.unidad).set({ orden: lista[j].orden }).where(eq(s.unidad.id, lista[i].id));
		await db.update(s.unidad).set({ orden: lista[i].orden }).where(eq(s.unidad.id, lista[j].id));
		return { ok: true };
	}
};
