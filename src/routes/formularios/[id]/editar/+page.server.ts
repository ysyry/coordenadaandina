import { and, asc, eq, inArray, count, max } from 'drizzle-orm';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { db, schema as s } from '$lib/server/db';
import { encuestaVisible, estructura } from '$lib/server/encuestas';
import { tiposDeConcepto } from '$lib/server/modelo';
import { TIPOS, POR, ALCANCE, ESTADOS } from '$lib/formularios/encuesta';
import type { PageServerLoad } from './$types';

type Yo = NonNullable<App.Locals['usuario']>;

async function editable(id: string, yo: Yo) {
	const r = await encuestaVisible(id, yo);
	if (!r.puedeEditar) error(403, 'Esta encuesta la edita quien la armó.');
	return r.encuesta;
}

const texto = (d: FormData, k: string) => String(d.get(k) ?? '').trim();
const unoDe = <T extends readonly { id: string }[]>(lista: T, v: string, def: string) =>
	lista.some((x) => x.id === v) ? v : def;

export const load: PageServerLoad = async ({ params, locals }) => {
	const yo = locals.usuario!;
	const e = await editable(params.id, yo);
	const { secciones, preguntas } = await estructura(e.id);
	const conRespuestas = preguntas.length
		? await db.select({ preguntaId: s.respuesta.preguntaId, n: count() }).from(s.respuesta)
				.where(inArray(s.respuesta.preguntaId, preguntas.map((p) => p.id))).groupBy(s.respuesta.preguntaId)
		: [];
	return {
		encuesta: { id: e.id, titulo: e.titulo, motivacion: e.motivacion, estado: e.estado },
		secciones,
		preguntas: preguntas.map((p) => ({ ...p, respuestas: conRespuestas.find((r) => r.preguntaId === p.id)?.n ?? 0 })),
		conceptos: await tiposDeConcepto(yo.tenantId)
	};
};

export const actions: Actions = {
	datos: async ({ params, request, locals }) => {
		const e = await editable(params.id!, locals.usuario!);
		const d = await request.formData();
		const titulo = texto(d, 'titulo');
		if (!titulo) return fail(400, { error: 'La encuesta necesita un nombre.' });
		const estado = texto(d, 'estado');
		await db.update(s.encuesta).set({
			titulo, motivacion: texto(d, 'motivacion'),
			estado: estado in ESTADOS ? estado : e.estado, actualizado: new Date()
		}).where(eq(s.encuesta.id, e.id));
		return { hecho: 'datos' };
	},

	seccion: async ({ params, request, locals }) => {
		const e = await editable(params.id!, locals.usuario!);
		const d = await request.formData();
		const id = texto(d, 'id');
		const valores = { titulo: texto(d, 'titulo') || 'Sin título', apunta: texto(d, 'apunta'), saber: texto(d, 'saber') };
		if (id) await db.update(s.encuestaSeccion).set(valores).where(and(eq(s.encuestaSeccion.id, id), eq(s.encuestaSeccion.encuestaId, e.id)));
		else {
			const [{ m }] = await db.select({ m: max(s.encuestaSeccion.orden) }).from(s.encuestaSeccion).where(eq(s.encuestaSeccion.encuestaId, e.id));
			await db.insert(s.encuestaSeccion).values({ encuestaId: e.id, orden: (m ?? -1) + 1, ...valores });
		}
		return { hecho: 'seccion' };
	},

	borrarSeccion: async ({ params, request, locals }) => {
		const e = await editable(params.id!, locals.usuario!);
		const id = texto(await request.formData(), 'id');
		await db.delete(s.encuestaSeccion).where(and(eq(s.encuestaSeccion.id, id), eq(s.encuestaSeccion.encuestaId, e.id)));
		return { hecho: 'seccion' };
	},

	pregunta: async ({ params, request, locals }) => {
		const e = await editable(params.id!, locals.usuario!);
		const d = await request.formData();
		const id = texto(d, 'id');
		const tipo = unoDe(TIPOS, texto(d, 'tipo'), 'parrafo');
		const opcionesDe = texto(d, 'opcionesDe') || 'manual';
		const seccionId = texto(d, 'seccionId') || null;
		const valores = {
			texto: texto(d, 'texto') || 'Pregunta sin texto',
			ayuda: texto(d, 'ayuda'),
			tipo,
			obligatoria: d.get('obligatoria') === 'sí',
			clase: ['objetivo', 'subjetivo'].includes(texto(d, 'clase')) ? texto(d, 'clase') : null,
			por: unoDe(POR, texto(d, 'por'), 'nada'),
			alcance: unoDe(ALCANCE, texto(d, 'alcance'), 'mios'),
			opcionesDe: /^(manual|usuaria|puesto|nudo|concepto:[a-z_]+)$/.test(opcionesDe) ? opcionesDe : 'manual',
			opciones: texto(d, 'opciones').split('\n').map((x) => x.trim()).filter(Boolean).join('\n'),
			conOtra: d.get('conOtra') === 'sí',
			muestra: /^concepto:[a-z_]+$/.test(texto(d, 'muestra')) ? texto(d, 'muestra') : null,
			seccionId
		};
		if (id) await db.update(s.pregunta).set(valores).where(and(eq(s.pregunta.id, id), eq(s.pregunta.encuestaId, e.id)));
		else {
			const [{ m }] = await db.select({ m: max(s.pregunta.orden) }).from(s.pregunta).where(eq(s.pregunta.encuestaId, e.id));
			await db.insert(s.pregunta).values({ encuestaId: e.id, orden: (m ?? -1) + 1, ...valores });
		}
		return { hecho: 'pregunta' };
	},

	borrarPregunta: async ({ params, request, locals }) => {
		const e = await editable(params.id!, locals.usuario!);
		const id = texto(await request.formData(), 'id');
		await db.delete(s.pregunta).where(and(eq(s.pregunta.id, id), eq(s.pregunta.encuestaId, e.id)));
		return { hecho: 'pregunta' };
	},

	/** Sube o baja una pregunta, cambiando el orden con su vecina. */
	mover: async ({ params, request, locals }) => {
		const e = await editable(params.id!, locals.usuario!);
		const d = await request.formData();
		const id = texto(d, 'id'), dir = texto(d, 'dir') === 'arriba' ? -1 : 1;
		const lista = await db.select({ id: s.pregunta.id, orden: s.pregunta.orden }).from(s.pregunta)
			.where(eq(s.pregunta.encuestaId, e.id)).orderBy(asc(s.pregunta.orden));
		const i = lista.findIndex((p) => p.id === id), j = i + dir;
		if (i < 0 || j < 0 || j >= lista.length) return { hecho: 'pregunta' };
		// Se renumera todo, así el orden nunca queda con huecos ni empates.
		[lista[i], lista[j]] = [lista[j], lista[i]];
		for (const [k, p] of lista.entries()) await db.update(s.pregunta).set({ orden: k }).where(eq(s.pregunta.id, p.id));
		return { hecho: 'pregunta' };
	},

	borrar: async ({ params, locals }) => {
		const e = await editable(params.id!, locals.usuario!);
		if (e.clave) return fail(400, { error: 'Esta encuesta es del área: se puede cerrar, pero no borrar.' });
		await db.delete(s.encuesta).where(eq(s.encuesta.id, e.id));
		redirect(303, '/formularios');
	}
};
