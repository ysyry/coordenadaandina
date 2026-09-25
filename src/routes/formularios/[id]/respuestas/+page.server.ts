import { error } from '@sveltejs/kit';
import { encuestaVisible } from '$lib/server/encuestas';
import { todas } from '$lib/server/respuestas';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const yo = locals.usuario!;
	const { encuesta, puedeEditar } = await encuestaVisible(params.id, yo);
	if (!puedeEditar) error(403, 'Las respuestas las ve quien armó la encuesta.');
	const t = await todas(encuesta.id, yo.tenantId);
	return {
		encuesta: { id: encuesta.id, titulo: encuesta.titulo },
		secciones: t.secciones.map((x) => ({ id: x.id, titulo: x.titulo })),
		preguntas: t.preguntas.map((p) => ({ id: p.id, texto: p.texto, tipo: p.tipo, por: p.por, seccionId: p.seccionId })),
		respuestas: t.respuestas,
		personas: t.personas
	};
};
