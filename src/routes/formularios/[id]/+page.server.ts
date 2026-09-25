import { fail, type Actions } from '@sveltejs/kit';
import { encuestaVisible, estructura, armar, respuestasDe, avance, camposDe, guardar } from '$lib/server/encuestas';
import { misDictados, nombreDictado } from '$lib/server/modelo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const yo = locals.usuario!;
	const { encuesta, puedeEditar } = await encuestaVisible(params.id, yo);
	const { secciones, preguntas } = await estructura(encuesta.id);
	const armadas = await armar(preguntas, yo.id, yo.tenantId);
	const guardado = await respuestasDe(preguntas.map((p) => p.id), yo.id);
	const dictados = await misDictados(yo.id, yo.tenantId);

	return {
		encuesta: { id: encuesta.id, titulo: encuesta.titulo, motivacion: encuesta.motivacion, estado: encuesta.estado },
		puedeEditar,
		secciones: secciones.map((sec) => ({ id: sec.id, titulo: sec.titulo, apunta: sec.apunta, saber: sec.saber })),
		preguntas: armadas.map((p) => ({ ...p, campos: camposDe(p) })),
		guardado,
		avance: avance(armadas, guardado),
		misDictados: dictados.map(nombreDictado)
	};
};

export const actions: Actions = {
	guardar: async ({ params, request, locals }) => {
		const yo = locals.usuario!;
		const { encuesta } = await encuestaVisible(params.id!, yo);
		if (encuesta.estado === 'cerrada') return fail(400, { error: 'La encuesta está cerrada.' });
		const datos = await request.formData();
		const bloque = String(datos.get('bloque') ?? '');
		const { preguntas } = await estructura(encuesta.id);
		const armadas = await armar(preguntas, yo.id, yo.tenantId);
		await guardar(datos, armadas, yo.id, yo.tenantId);
		return { guardado: bloque };
	}
};
