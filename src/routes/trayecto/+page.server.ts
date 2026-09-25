import { and, asc, eq, inArray } from 'drizzle-orm';
import { db, schema as s } from '$lib/server/db';
import { dictados, nombreDictado } from '$lib/server/modelo';
import type { PageServerLoad } from './$types';

/**
 * Lo esperable, lo planificado y lo dado, para un año y un espacio.
 *  - esperable: los tramos del diseño (nudo × cuatrimestre)
 *  - planificado: las unidades de los planes de ese año que tocan esos nudos
 *  - dado: lo que se contestó sobre cada unidad, más las clases registradas
 */
export const load: PageServerLoad = async ({ url, locals }) => {
	const yo = locals.usuario!;
	const anio = Math.min(5, Math.max(1, Number(url.searchParams.get('anio')) || 1));
	const codigo = ['MAT', 'INF', 'EPA-MI'].includes(url.searchParams.get('espacio') ?? '') ? url.searchParams.get('espacio')! : 'MAT';

	const tramos = await db
		.select({
			id: s.nudoCuatrimestre.id, c: s.nudoCuatrimestre.cuatrimestre, titulo: s.nudoCuatrimestre.titulo,
			saberes: s.nudoCuatrimestre.saberes, repite: s.nudoCuatrimestre.repiteAnterior,
			nudoId: s.nudo.id, codigo: s.nudo.codigo, nudo: s.nudo.nombre
		})
		.from(s.nudoCuatrimestre)
		.innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
		.innerJoin(s.espacioCurricular, eq(s.espacioCurricular.id, s.nudo.espacioId))
		.where(and(eq(s.nudoCuatrimestre.anioEscolar, anio), eq(s.espacioCurricular.codigo, codigo)))
		.orderBy(asc(s.nudoCuatrimestre.cuatrimestre), asc(s.nudo.orden));

	// Los dictados de ese año y ese espacio, y sus planes.
	const ds = (await dictados(yo.tenantId)).filter((d) => d.anio === anio && d.codigo === codigo);
	const planes = ds.length
		? await db.select({ id: s.planMateria.id, c: s.planMateria.cuatrimestre, dictadoId: s.planMateria.dictadoId })
				.from(s.planMateria).where(inArray(s.planMateria.dictadoId, ds.map((d) => d.id)))
		: [];
	const unidades = planes.length
		? await db.select({ id: s.unidad.id, titulo: s.unidad.titulo, orden: s.unidad.orden, planId: s.unidad.planId, clases: s.unidad.clases })
				.from(s.unidad).where(inArray(s.unidad.planId, planes.map((p) => p.id))).orderBy(asc(s.unidad.orden))
		: [];
	const un = unidades.length
		? await db.select().from(s.unidadNudo).where(inArray(s.unidadNudo.unidadId, unidades.map((u) => u.id)))
		: [];

	// Lo dado: las respuestas sobre cada unidad, de cualquier encuesta, y las clases registradas.
	const respuestas = unidades.length
		? await db.select({ sobreId: s.respuesta.sobreId, valor: s.respuesta.valor, otro: s.respuesta.otro, pregunta: s.pregunta.texto, tipo: s.pregunta.tipo, orden: s.pregunta.orden, usuaria: s.usuario.nombre })
				.from(s.respuesta)
				.innerJoin(s.pregunta, eq(s.pregunta.id, s.respuesta.preguntaId))
				.innerJoin(s.usuario, eq(s.usuario.id, s.respuesta.usuarioId))
				.where(and(eq(s.respuesta.sobreTipo, 'unidad'), inArray(s.respuesta.sobreId, unidades.map((u) => u.id))))
				.orderBy(asc(s.pregunta.orden))
		: [];
	const clases = unidades.length
		? await db.select({ unidadId: s.claseDada.unidadId, seDio: s.claseDada.seDio }).from(s.claseDada)
				.where(inArray(s.claseDada.unidadId, unidades.map((u) => u.id)))
		: [];

	const armarUnidad = (u: (typeof unidades)[number]) => {
		const plan = planes.find((p) => p.id === u.planId)!;
		const d = ds.find((x) => x.id === plan.dictadoId)!;
		return {
			id: u.id, titulo: u.titulo, c: plan.c, dictado: nombreDictado(d),
			dado: respuestas.filter((r) => r.sobreId === u.id).map((r) => ({
				pregunta: r.pregunta, valor: r.tipo === 'si' ? 'sí' : [r.valor, r.otro].filter(Boolean).join(' · '), usuaria: r.usuaria
			})),
			clases: clases.filter((c) => c.unidadId === u.id && c.seDio).length
		};
	};

	const filas = tramos.map((t) => {
		const us = unidades.filter((u) => {
			const plan = planes.find((p) => p.id === u.planId)!;
			return plan.c === t.c && un.some((x) => x.unidadId === u.id && x.nudoId === t.nudoId);
		});
		return { ...t, unidades: us.map(armarUnidad) };
	});
	const enTramo = new Set(filas.flatMap((f) => f.unidades.map((u) => u.id)));
	const sueltas = unidades.filter((u) => !enTramo.has(u.id)).map(armarUnidad);

	return {
		anio, codigo,
		dictados: ds.map(nombreDictado),
		filas, sueltas,
		resumen: {
			esperables: filas.length,
			planificados: filas.filter((f) => f.unidades.length).length,
			conDato: filas.filter((f) => f.unidades.some((u) => u.dado.length || u.clases)).length
		}
	};
};
