/**
 * Todas las respuestas de una encuesta, con nombres legibles: quién, sobre qué
 * y qué eligió. La usan la pantalla de respuestas y la descarga en CSV.
 */
import { asc, eq, inArray } from 'drizzle-orm';
import { db, schema as s } from '$lib/server/db';
import { rotulos } from '$lib/server/modelo';

export async function todas(encuestaId: string, tenantId: string) {
	const [secciones, preguntas] = await Promise.all([
		db.select().from(s.encuestaSeccion).where(eq(s.encuestaSeccion.encuestaId, encuestaId)).orderBy(asc(s.encuestaSeccion.orden)),
		db.select().from(s.pregunta).where(eq(s.pregunta.encuestaId, encuestaId)).orderBy(asc(s.pregunta.orden))
	]);
	const filas = preguntas.length
		? await db.select({
				id: s.respuesta.id, preguntaId: s.respuesta.preguntaId, usuarioId: s.respuesta.usuarioId,
				usuaria: s.usuario.nombre, sobreTipo: s.respuesta.sobreTipo, sobreId: s.respuesta.sobreId,
				valor: s.respuesta.valor, otro: s.respuesta.otro, actualizado: s.respuesta.actualizado
			})
			.from(s.respuesta).innerJoin(s.usuario, eq(s.usuario.id, s.respuesta.usuarioId))
			.where(inArray(s.respuesta.preguntaId, preguntas.map((p) => p.id)))
			.orderBy(asc(s.usuario.nombre))
		: [];
	const refs = filas.length
		? await db.select().from(s.respuestaRef).where(inArray(s.respuestaRef.respuestaId, filas.map((f) => f.id)))
		: [];
	const nombre = await rotulos(filas.map((f) => ({ tipo: f.sobreTipo, id: f.sobreId })), tenantId);

	const respuestas = filas.map((f) => {
		const r = nombre(f.sobreTipo, f.sobreId);
		return {
			...f,
			actualizado: f.actualizado.toISOString(),
			sobre: r.rotulo, sobreGrupo: r.grupo,
			elegidos: f.valor ? f.valor.split('\n') : [],
			refs: refs.filter((x) => x.respuestaId === f.id).map((x) => `${x.refTipo}:${x.refId}`)
		};
	});
	const personas = [...new Map(filas.map((f) => [f.usuarioId, f.usuaria])).values()];
	return { secciones, preguntas, respuestas, personas };
}
