/**
 * Cargar una encuesta ya resuelta para una persona (sus dictados, sus temas, sus
 * cruces, las opciones del modelo) y guardar lo que contesta.
 */
import { and, asc, eq, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db, schema as s } from '$lib/server/db';
import { entidades, opcionesDe, type Entidad, type Opcion } from '$lib/server/modelo';
import { campo, campoOtro, conOpciones, leerCampo, OTRA, SEP } from '$lib/formularios/encuesta';

type Yo = NonNullable<App.Locals['usuario']>;

export async function encuestaVisible(id: string, yo: Yo) {
	if (!/^[0-9a-f-]{36}$/.test(id)) error(404, 'No existe esa encuesta.');
	const [e] = await db.select().from(s.encuesta).where(and(eq(s.encuesta.id, id), eq(s.encuesta.tenantId, yo.tenantId)));
	if (!e) error(404, 'No existe esa encuesta.');
	const puedeEditar = e.autoraId === yo.id || yo.admin;
	if (e.estado === 'borrador' && !puedeEditar) error(404, 'No existe esa encuesta.');
	return { encuesta: e, puedeEditar };
}

export async function estructura(encuestaId: string) {
	const [secciones, preguntas] = await Promise.all([
		db.select().from(s.encuestaSeccion).where(eq(s.encuestaSeccion.encuestaId, encuestaId)).orderBy(asc(s.encuestaSeccion.orden)),
		db.select().from(s.pregunta).where(eq(s.pregunta.encuestaId, encuestaId)).orderBy(asc(s.pregunta.orden))
	]);
	return { secciones, preguntas };
}

export type PreguntaArmada = typeof s.pregunta.$inferSelect & {
	n: number;
	entidades: Entidad[];
	opcionesLista: Opcion[];
	refTipo: string;           // 'manual' o el tipo de las opciones del modelo
	pegado: Opcion[];
};

/** Resuelve cada pregunta para una persona: sobre qué se repite y qué opciones tiene. */
export async function armar(preguntas: (typeof s.pregunta.$inferSelect)[], usuarioId: string, tenantId: string) {
	const cacheE = new Map<string, Entidad[]>();
	const cacheO = new Map<string, { tipo: string; opciones: Opcion[] }>();
	const out: PreguntaArmada[] = [];
	for (const [i, p] of preguntas.entries()) {
		const kE = `${p.por}|${p.alcance}`;
		if (!cacheE.has(kE)) cacheE.set(kE, await entidades(p.por, p.alcance, usuarioId, tenantId));
		let refTipo = 'manual', opcionesLista: Opcion[] = [];
		if (conOpciones(p.tipo)) {
			if (p.opcionesDe === 'manual') {
				opcionesLista = p.opciones.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => ({ id: x, rotulo: x }));
			} else {
				if (!cacheO.has(p.opcionesDe)) cacheO.set(p.opcionesDe, await opcionesDe(p.opcionesDe, tenantId));
				({ tipo: refTipo, opciones: opcionesLista } = cacheO.get(p.opcionesDe)!);
			}
		}
		let pegado: Opcion[] = [];
		if (p.muestra) {
			if (!cacheO.has(p.muestra)) cacheO.set(p.muestra, await opcionesDe(p.muestra, tenantId));
			pegado = cacheO.get(p.muestra)!.opciones;
		}
		out.push({ ...p, n: i + 1, entidades: cacheE.get(kE)!, opcionesLista, refTipo, pegado });
	}
	return out;
}

/** Todos los campos que puede mandar una pregunta armada. */
export function camposDe(p: PreguntaArmada): string[] {
	const sobres = p.por === 'nada' ? [['', '']] : p.entidades.map((e) => [e.tipo, e.id]);
	return sobres.flatMap(([t, id]) => [campo(p.id, t, id), ...(p.conOtra ? [campoOtro(p.id, t, id)] : [])]);
}

/**
 * Lo que una persona ya contestó, con el valor que el formulario necesita:
 * para opciones del modelo son los ids elegidos; para el resto, el texto.
 */
export async function respuestasDe(preguntaIds: string[], usuarioId: string) {
	if (!preguntaIds.length) return {} as Record<string, string>;
	const filas = await db.select().from(s.respuesta)
		.where(and(inArray(s.respuesta.preguntaId, preguntaIds), eq(s.respuesta.usuarioId, usuarioId)));
	const refs = filas.length
		? await db.select().from(s.respuestaRef).where(inArray(s.respuestaRef.respuestaId, filas.map((f) => f.id)))
		: [];
	const g: Record<string, string> = {};
	for (const f of filas) {
		const mias = refs.filter((r) => r.respuestaId === f.id);
		const elegido = mias.length ? mias.map((r) => r.refId).join(SEP) : f.valor;
		// «Otra» se marca como una opción más; su texto va en su propio campo.
		g[campo(f.preguntaId, f.sobreTipo, f.sobreId)] = f.otro ? [elegido, OTRA].filter(Boolean).join(SEP) : elegido;
		if (f.otro) g[campoOtro(f.preguntaId, f.sobreTipo, f.sobreId)] = f.otro;
	}
	return g;
}

/** Contestada: si se repite, con al menos una respuesta; si es obligatoria y se repite, todas. */
export function avance(preguntas: PreguntaArmada[], g: Record<string, string>) {
	const tiene = (k: string) => !!(g[k] ?? '').trim();
	const contestada = (p: PreguntaArmada) =>
		p.por === 'nada' ? tiene(campo(p.id)) : p.entidades.some((e) => tiene(campo(p.id, e.tipo, e.id)));
	const completa = (p: PreguntaArmada) =>
		p.por === 'nada' ? tiene(campo(p.id)) : p.entidades.every((e) => tiene(campo(p.id, e.tipo, e.id)));
	// Una pregunta que se repite sobre nada (no tiene dictados) no cuenta.
	const cuentan = preguntas.filter((p) => p.por === 'nada' || p.entidades.length);
	return {
		total: cuentan.length,
		hechas: cuentan.filter(contestada).length,
		faltan: cuentan.filter((p) => p.obligatoria && !completa(p)).map((p) => p.n)
	};
}

/** Guarda lo que llega de un bloque. Lo que no vino y estaba en la lista de campos, se borra. */
export async function guardar(datos: FormData, preguntas: PreguntaArmada[], usuarioId: string, tenantId: string) {
	const porId = new Map(preguntas.map((p) => [p.id, p]));
	const validos = new Set(preguntas.flatMap(camposDe));
	const campos = String(datos.get('_campos') ?? '').split(',').filter((c) => validos.has(c));

	// Se agrupan valor y «Otra» por (pregunta, sobre).
	const grupos = new Map<string, { preguntaId: string; sobreTipo: string; sobreId: string; valores: string[]; otro: string }>();
	for (const c of campos) {
		const l = leerCampo(c)!;
		const k = `${l.preguntaId}~${l.sobreTipo}~${l.sobreId}`;
		const g = grupos.get(k) ?? { preguntaId: l.preguntaId, sobreTipo: l.sobreTipo, sobreId: l.sobreId, valores: [], otro: '' };
		const vals = datos.getAll(c).map((x) => String(x).trim()).filter(Boolean);
		if (l.otro) g.otro = vals.join(' ');
		else g.valores = vals.filter((v) => v !== OTRA);
		grupos.set(k, g);
	}

	for (const g of grupos.values()) {
		const p = porId.get(g.preguntaId)!;
		const donde = and(eq(s.respuesta.preguntaId, g.preguntaId), eq(s.respuesta.usuarioId, usuarioId),
			eq(s.respuesta.sobreTipo, g.sobreTipo), eq(s.respuesta.sobreId, g.sobreId));

		if (!g.valores.length && !g.otro) {
			await db.delete(s.respuesta).where(donde);
			continue;
		}

		// Las opciones del modelo se guardan como referencia, y su nombre como texto legible.
		const delModelo = conOpciones(p.tipo) && p.refTipo !== 'manual';
		const elegidas = delModelo ? g.valores.filter((v) => p.opcionesLista.some((o) => o.id === v)) : [];
		const valor = delModelo
			? elegidas.map((id) => p.opcionesLista.find((o) => o.id === id)!.rotulo).join(SEP)
			: g.valores.join(SEP);

		const [fila] = await db.insert(s.respuesta)
			.values({ tenantId, preguntaId: g.preguntaId, usuarioId, sobreTipo: g.sobreTipo, sobreId: g.sobreId, valor, otro: g.otro })
			.onConflictDoUpdate({
				target: [s.respuesta.preguntaId, s.respuesta.usuarioId, s.respuesta.sobreTipo, s.respuesta.sobreId],
				set: { valor, otro: g.otro, actualizado: new Date() }
			})
			.returning({ id: s.respuesta.id });

		await db.delete(s.respuestaRef).where(eq(s.respuestaRef.respuestaId, fila.id));
		if (elegidas.length)
			await db.insert(s.respuestaRef).values(elegidas.map((refId) => ({ respuestaId: fila.id, refTipo: p.refTipo, refId })));
	}
}
