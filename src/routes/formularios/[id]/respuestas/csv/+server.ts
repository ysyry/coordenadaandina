import { error } from '@sveltejs/kit';
import { encuestaVisible } from '$lib/server/encuestas';
import { todas } from '$lib/server/respuestas';
import type { RequestHandler } from './$types';

const celda = (x: unknown) => `"${String(x ?? '').replace(/"/g, '""')}"`;

/** Una fila por respuesta, con los ids del modelo para poder cruzarla en una planilla. */
export const GET: RequestHandler = async ({ params, locals }) => {
	const yo = locals.usuario;
	if (!yo) error(401, 'Hay que entrar.');
	const { encuesta, puedeEditar } = await encuestaVisible(params.id, yo);
	if (!puedeEditar) error(403, 'Las respuestas las ve quien armó la encuesta.');
	const t = await todas(encuesta.id, yo.tenantId);
	const seccion = (id: string | null) => t.secciones.find((x) => x.id === id)?.titulo ?? '';
	const cab = ['seccion', 'n', 'pregunta', 'usuaria', 'sobre_tipo', 'sobre', 'sobre_grupo', 'valor', 'otra', 'refs', 'sobre_id', 'actualizado'];
	const lineas = t.respuestas.map((r) => {
		const i = t.preguntas.findIndex((p) => p.id === r.preguntaId);
		const p = t.preguntas[i];
		return [seccion(p.seccionId), i + 1, p.texto, r.usuaria, r.sobreTipo, r.sobre, r.sobreGrupo, r.valor.replace(/\n/g, ' | '), r.otro, r.refs.join(' '), r.sobreId, r.actualizado];
	}).sort((a, b) => Number(a[1]) - Number(b[1]));
	const csv = [cab, ...lineas].map((l) => l.map(celda).join(',')).join('\n');
	const archivo = encuesta.titulo.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase();
	return new Response('﻿' + csv, {
		headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${archivo}.csv"` }
	});
};
