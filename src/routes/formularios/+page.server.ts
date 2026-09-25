import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { db, schema as s } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const yo = locals.usuario!;

	const usuarias = await db
		.select({ id: s.usuario.id, nombre: s.usuario.nombre })
		.from(s.usuario)
		.where(and(eq(s.usuario.activa, true), eq(s.usuario.tenantId, yo.tenantId)))
		.orderBy(asc(s.usuario.nombre));

	const todas = await db
		.select({
			id: s.encuesta.id, titulo: s.encuesta.titulo, motivacion: s.encuesta.motivacion,
			estado: s.encuesta.estado, autoraId: s.encuesta.autoraId, autora: s.usuario.nombre
		})
		.from(s.encuesta)
		.leftJoin(s.usuario, eq(s.usuario.id, s.encuesta.autoraId))
		.where(eq(s.encuesta.tenantId, yo.tenantId))
		.orderBy(desc(s.encuesta.creado));

	// Un borrador lo ve sólo quien lo arma, y quien administra.
	const visibles = todas.filter((e) => e.estado !== 'borrador' || e.autoraId === yo.id || yo.admin);
	const ids = visibles.map((e) => e.id);

	const preguntas = ids.length
		? await db.select({ id: s.pregunta.id, encuestaId: s.pregunta.encuestaId }).from(s.pregunta).where(inArray(s.pregunta.encuestaId, ids))
		: [];
	const respuestas = preguntas.length
		? await db.selectDistinct({ preguntaId: s.respuesta.preguntaId, usuarioId: s.respuesta.usuarioId })
				.from(s.respuesta).where(inArray(s.respuesta.preguntaId, preguntas.map((p) => p.id)))
		: [];

	const encuestas = visibles.map((e) => {
		const suyas = new Set(preguntas.filter((p) => p.encuestaId === e.id).map((p) => p.id));
		const hechas = new Map<string, number>();
		for (const r of respuestas) if (suyas.has(r.preguntaId)) hechas.set(r.usuarioId, (hechas.get(r.usuarioId) ?? 0) + 1);
		return {
			id: e.id, titulo: e.titulo, motivacion: e.motivacion, estado: e.estado,
			autora: e.autora, total: suyas.size,
			puedeEditar: e.autoraId === yo.id || yo.admin,
			empezado: (hechas.get(yo.id) ?? 0) > 0,
			quienes: usuarias.map((u) => ({ nombre: u.nombre, soyYo: u.id === yo.id, hechas: hechas.get(u.id) ?? 0 }))
		};
	});

	return { encuestas };
};

export const actions: Actions = {
	nueva: async ({ request, locals }) => {
		const yo = locals.usuario!;
		const titulo = String((await request.formData()).get('titulo') ?? '').trim();
		if (!titulo) return fail(400, { error: 'Poné un nombre para la encuesta.' });
		const [e] = await db.insert(s.encuesta)
			.values({ tenantId: yo.tenantId, autoraId: yo.id, titulo })
			.returning({ id: s.encuesta.id });
		redirect(303, `/formularios/${e.id}/editar`);
	}
};
