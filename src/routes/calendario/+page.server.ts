import { db, schema as s } from '$lib/server/db';
import { and, asc, eq, gte, lte, isNull, or } from 'drizzle-orm';
import { CICLO, TIPOS } from '$lib/cuatrimestres';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';


/** Cuántos días de cada semana tiene clase este curso, según la grilla. */
function diasConClase(bloques: { dia: number }[]) {
	return [...new Set(bloques.map((b) => b.dia))].sort();
}

/** Un evento de varios días ocupa todas las fechas del rango, no sólo la primera. */
function fechasDe(e: { fecha: string; hasta: string | null }) {
	const salida: string[] = [];
	const d = new Date(e.fecha + 'T00:00:00');
	const fin = new Date((e.hasta ?? e.fecha) + 'T00:00:00');
	while (d <= fin) { salida.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
	return salida;
}

function contarClases(desde: string, hasta: string, dias: number[], perdidos: Set<string>) {
	let n = 0;
	const d = new Date(desde + 'T00:00:00');
	const fin = new Date(hasta + 'T00:00:00');
	while (d <= fin) {
		const iso = d.toISOString().slice(0, 10);
		if (dias.includes(d.getDay()) && !perdidos.has(iso)) n++;
		d.setDate(d.getDate() + 1);
	}
	return n;
}

export const load: PageServerLoad = async ({ url }) => {
	const hoy = new Date();
	const mes = Number(url.searchParams.get('mes') ?? hoy.getMonth() + 1);
	const anio = Number(url.searchParams.get('anio') ?? CICLO.anio);

	const [esc] = await db.select().from(s.escuela).where(eq(s.escuela.tenantId, TENANT)).limit(1);
	const cursos = await db.select().from(s.curso)
		.where(eq(s.curso.tenantId, TENANT)).orderBy(asc(s.curso.anioEscolar));
	const bloques = await db.select().from(s.bloque).where(eq(s.bloque.tenantId, TENANT));

	const eventos = await db.select().from(s.evento)
		.where(eq(s.evento.tenantId, TENANT)).orderBy(asc(s.evento.fecha));

	const perdidosEscuela = new Set(
		eventos.filter((e) => e.afectaClases && !e.cursoId).flatMap(fechasDe)
	);

	const docentes = await db.select().from(s.docente).where(eq(s.docente.tenantId, TENANT));
	const hoyIso = new Date().toISOString().slice(0, 10);

	// Una cuenta por cada par curso-docente: cada una tiene sus propios días.
	const cuenta = cursos.map((c) => {
		const suyos = bloques.filter((b) => b.cursoId === c.id);
		const perdidosCurso = new Set([
			...perdidosEscuela,
			...eventos.filter((e) => e.afectaClases && e.cursoId === c.id).flatMap(fechasDe)
		]);
		const porDocente = [...new Set(suyos.map((b) => b.docenteId))].map((docId) => {
			const dias = diasConClase(suyos.filter((b) => b.docenteId === docId));
			const filas = CICLO.cuatrimestres.map((q) => {
				const total = contarClases(q.desde, q.hasta, dias, new Set());
				const efectivas = contarClases(q.desde, q.hasta, dias, perdidosCurso);
				const restan = hoyIso > q.hasta ? 0
					: contarClases(hoyIso > q.desde ? hoyIso : q.desde, q.hasta, dias, perdidosCurso);
				return { n: q.n, nombre: q.nombre, total, efectivas, perdidas: total - efectivas, restan };
			});
			return {
				docente: docentes.find((d) => d.id === docId)?.nombre ?? '—',
				dias, filas
			};
		});
		return { curso: { id: c.id, etiqueta: c.etiqueta }, porDocente };
	});

	// La grilla del área, para pintarla en el calendario como clases ya cargadas.
	/** Nombre corto que distingue: si dos comparten el nombre de pila, se agrega la inicial del apellido. */
	function corto(nombre: string) {
		const pila = nombre.split(' ')[0];
		const hayOtra = docentes.filter((d) => d.nombre.split(' ')[0] === pila).length > 1;
		if (!hayOtra) return pila;
		const ape = nombre.split(' ').slice(1).join(' ');
		return ape ? `${pila} ${ape[0]}.` : pila;
	}

	const grilla = bloques.map((b) => {
		const quien = docentes.find((d) => d.id === b.docenteId)?.nombre ?? '—';
		return {
			id: b.id, dia: b.dia, desde: b.desde, hasta: b.hasta,
			espacio: b.espacio, disciplina: b.disciplina,
			docente: quien, corto: corto(quien),
			curso: cursos.find((c) => c.id === b.cursoId)?.etiqueta ?? '',
			cursoId: b.cursoId
		};
	}).sort((a, z) => a.dia - z.dia || a.desde.localeCompare(z.desde) ||
		a.espacio.localeCompare(z.espacio));

	// Qué meses tienen algo, para no dejar al usuario mirando una grilla vacía.
	const porMes: Record<string, number> = {};
	for (const e of eventos) for (const f of fechasDe(e)) {
		const k = f.slice(0, 7);
		porMes[k] = (porMes[k] ?? 0) + 1;
	}

	const hoy2 = new Date().toISOString().slice(0, 10);
	const proximos = eventos
		.filter((e) => (e.hasta ?? e.fecha) >= hoy2)
		.sort((a, b) => a.fecha.localeCompare(b.fecha))
		.slice(0, 8)
		.map((e) => ({
			id: e.id, fecha: e.fecha, hasta: e.hasta, tipo: e.tipo, titulo: e.titulo,
			afectaClases: e.afectaClases,
			curso: e.cursoId ? (cursos.find((c) => c.id === e.cursoId)?.etiqueta ?? '') : ''
		}));

	return {
		mes, anio, escuelaId: esc?.id ?? null,
		porMes, proximos,
		grilla,
		docentes: docentes.map((d) => d.nombre).sort(),
		cursos: cursos.map((c) => ({ id: c.id, anioEscolar: c.anioEscolar, etiqueta: c.etiqueta })),
		eventos: eventos.map((e) => ({
			id: e.id, fecha: e.fecha, hasta: e.hasta, tipo: e.tipo, titulo: e.titulo,
			nota: e.nota, cursoId: e.cursoId, afectaClases: e.afectaClases
		})),
		cuenta
	};
};

export const actions: Actions = {
	agregar: async ({ request }) => {
		const f = await request.formData();
		const fecha = String(f.get('fecha') ?? '');
		const titulo = String(f.get('titulo') ?? '').trim();
		const tipo = String(f.get('tipo') ?? 'actividad');
		if (!fecha || !titulo) return fail(400, { error: 'Falta la fecha o el título.' });

		const [esc] = await db.select().from(s.escuela).where(eq(s.escuela.tenantId, TENANT)).limit(1);
		const def = TIPOS.find((t) => t.id === tipo);
		const cursoId = String(f.get('cursoId') ?? '');

		await db.insert(s.evento).values({
			tenantId: TENANT, escuelaId: esc.id, fecha, tipo, titulo,
			nota: String(f.get('nota') ?? ''),
			cursoId: cursoId || null,
			afectaClases: f.get('afecta') != null ? true : (def?.afecta ?? false)
		});
		return { ok: true };
	},
	borrar: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		if (id) await db.delete(s.evento).where(and(eq(s.evento.id, id), eq(s.evento.tenantId, TENANT)));
		return { ok: true };
	}
};
