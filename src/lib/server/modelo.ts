/**
 * Las consultas que cruzan el modelo: qué da cada una, sobre qué cosas se
 * repite una pregunta y de dónde salen sus opciones. Ver MODELO.md.
 */
import { and, asc, eq, inArray, isNull, or, lte, gte } from 'drizzle-orm';
import { db, schema as s } from '$lib/server/db';

export type Entidad = { tipo: string; id: string; rotulo: string; grupo?: string; detalle?: string; contenidos?: string; fuente?: string };
export type Opcion = { id: string; rotulo: string; detalle?: string };

export type Dictado = {
	id: string; cursoId: string; anio: number; espacio: string; rama: string | null;
	codigo: string; disciplina: string; areaId: string; puestoId: string | null;
};

export const nombreDictado = (d: { anio: number; espacio: string; rama: string | null; codigo: string }) =>
	`${d.codigo === 'MAT' ? 'Matemática' : d.rama ? `Informática rama ${d.rama}` : d.codigo === 'EPA-MI' ? 'EPA' : 'Informática'} · ${d.anio}º año`;

const columnasDictado = {
	id: s.dictado.id, cursoId: s.dictado.cursoId, anio: s.curso.anioEscolar,
	espacio: s.espacioEscuela.nombre, rama: s.espacioEscuela.rama,
	codigo: s.espacioCurricular.codigo, disciplina: s.espacioCurricular.disciplina,
	areaId: s.espacioCurricular.areaId, puestoId: s.dictado.puestoId
};

export async function dictados(tenantId: string): Promise<Dictado[]> {
	return db.select(columnasDictado).from(s.dictado)
		.innerJoin(s.curso, eq(s.curso.id, s.dictado.cursoId))
		.innerJoin(s.espacioEscuela, eq(s.espacioEscuela.id, s.dictado.espacioEscuelaId))
		.innerJoin(s.espacioCurricular, eq(s.espacioCurricular.id, s.espacioEscuela.espacioCurricularId))
		.where(eq(s.dictado.tenantId, tenantId))
		.orderBy(asc(s.curso.anioEscolar), asc(s.espacioCurricular.orden), asc(s.espacioEscuela.nombre));
}

/** Los dictados de una persona: los de sus puestos enteros más los que ocupa uno por uno. */
export async function misDictados(usuarioId: string, tenantId: string): Promise<Dictado[]> {
	const ocup = await db.select().from(s.ocupacion).where(eq(s.ocupacion.usuarioId, usuarioId));
	if (!ocup.length) return [];
	const puestos = ocup.filter((o) => !o.dictadoId).map((o) => o.puestoId);
	const sueltos = ocup.filter((o) => o.dictadoId).map((o) => o.dictadoId!);
	const todos = await dictados(tenantId);
	return todos.filter((d) => (d.puestoId && puestos.includes(d.puestoId)) || sueltos.includes(d.id));
}

/** El período que corre hoy; entre dos, el que viene; después del último, el último. */
export async function periodoActual(tenantId: string, hoy = new Date().toISOString().slice(0, 10)) {
	const filas = await db.select({ n: s.periodo.n, nombre: s.periodo.nombre, desde: s.periodo.desde, hasta: s.periodo.hasta, anio: s.cicloLectivo.anio })
		.from(s.periodo).innerJoin(s.cicloLectivo, eq(s.cicloLectivo.id, s.periodo.cicloLectivoId))
		.where(and(eq(s.cicloLectivo.tenantId, tenantId), eq(s.periodo.tipo, 'cuatrimestre')))
		.orderBy(asc(s.periodo.desde));
	return filas.find((p) => p.desde <= hoy && hoy <= p.hasta) ?? filas.find((p) => p.desde > hoy) ?? filas.at(-1) ?? null;
}

/** Cuatrimestre corrido (1..10) de un año escolar en un período: 3º año, 2do cuatrimestre → 6. */
export const corrido = (anio: number, n: number) => (anio - 1) * 2 + n;

/**
 * Sobre qué cosas se repite una pregunta. Con alcance 'mios' se limita a los
 * dictados de la persona; con 'todos', a los de toda la escuela.
 */
export async function entidades(por: string, alcance: string, usuarioId: string, tenantId: string): Promise<Entidad[]> {
	if (por === 'nada') return [];
	const base = alcance === 'todos' ? await dictados(tenantId) : await misDictados(usuarioId, tenantId);

	if (por === 'dictado') return base.map((d) => ({ tipo: 'dictado', id: d.id, rotulo: nombreDictado(d) }));

	if (por === 'anio') {
		const anios = [...new Set(base.map((d) => d.anio))].sort();
		return anios.map((a) => ({ tipo: 'anio', id: String(a), rotulo: `${a}º año` }));
	}

	if (por === 'unidad') {
		if (!base.length) return [];
		const filas = await db.select({ id: s.unidad.id, titulo: s.unidad.titulo, contenidos: s.unidad.contenidos, fuente: s.unidad.fuente, orden: s.unidad.orden, cuatri: s.planMateria.cuatrimestre, dictadoId: s.planMateria.dictadoId })
			.from(s.unidad).innerJoin(s.planMateria, eq(s.planMateria.id, s.unidad.planId))
			.where(inArray(s.planMateria.dictadoId, base.map((d) => d.id)))
			.orderBy(asc(s.planMateria.cuatrimestre), asc(s.unidad.orden));
		const orden = new Map(base.map((d, i) => [d.id, i]));
		return filas
			.sort((a, b) => orden.get(a.dictadoId!)! - orden.get(b.dictadoId!)! || a.cuatri - b.cuatri || a.orden - b.orden)
			.map((u) => {
				const d = base.find((x) => x.id === u.dictadoId)!;
				return {
					tipo: 'unidad', id: u.id, rotulo: u.titulo, grupo: nombreDictado(d),
					detalle: `${u.cuatri % 2 ? '1er' : '2do'} cuatrimestre`, contenidos: u.contenidos, fuente: u.fuente
				};
			});
	}

	if (por === 'vinculo' || por === 'tramo') {
		const p = await periodoActual(tenantId);
		const cuatris = [...new Set(base.map((d) => corrido(d.anio, p?.n ?? 1)))];
		const disciplinas = new Set(base.map((d) => d.disciplina));
		if (!cuatris.length) return [];

		if (por === 'tramo') {
			const filas = await db.select({ id: s.nudoCuatrimestre.id, c: s.nudoCuatrimestre.cuatrimestre, anio: s.nudoCuatrimestre.anioEscolar, titulo: s.nudoCuatrimestre.titulo, codigo: s.nudo.codigo, nombre: s.nudo.nombre, disciplina: s.nudo.disciplina })
				.from(s.nudoCuatrimestre).innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
				.where(inArray(s.nudoCuatrimestre.cuatrimestre, cuatris))
				.orderBy(asc(s.nudoCuatrimestre.cuatrimestre), asc(s.nudo.orden));
			return filas.filter((t) => disciplinas.has(t.disciplina)).map((t) => ({
				tipo: 'tramo', id: t.id, rotulo: `${t.codigo} · ${t.titulo ?? t.nombre}`, grupo: `${t.anio}º año`
			}));
		}

		const a = s.nudo, filas = await db.select({ id: s.vinculo.id, c: s.vinculo.cuatrimestre, titulo: s.vinculo.titulo, resumen: s.vinculo.resumen, nudoA: s.vinculo.nudoA, nudoB: s.vinculo.nudoB })
			.from(s.vinculo)
			.where(and(inArray(s.vinculo.cuatrimestre, cuatris), or(eq(s.vinculo.tenantId, tenantId), isNull(s.vinculo.tenantId))))
			.orderBy(asc(s.vinculo.cuatrimestre));
		const nudos = await db.select({ id: a.id, codigo: a.codigo, nombre: a.nombre }).from(a);
		const n = (id: string) => nudos.find((x) => x.id === id);
		return filas.map((v) => ({
			tipo: 'vinculo', id: v.id, rotulo: v.titulo,
			grupo: `${Math.ceil(v.c / 2)}º año`,
			detalle: `${n(v.nudoA)?.nombre} · ${n(v.nudoB)?.nombre}`
		}));
	}
	return [];
}

/** Las opciones que salen del modelo. `spec`: concepto:<tipo> · usuaria · puesto · nudo. */
export async function opcionesDe(spec: string, tenantId: string): Promise<{ tipo: string; opciones: Opcion[] }> {
	if (spec.startsWith('concepto:')) {
		const tipo = spec.slice('concepto:'.length);
		const anio = new Date().getFullYear();
		const filas = await db.select().from(s.concepto)
			.where(and(eq(s.concepto.tipo, tipo), or(isNull(s.concepto.tenantId), eq(s.concepto.tenantId, tenantId)),
				or(isNull(s.concepto.vigenteDesde), lte(s.concepto.vigenteDesde, anio)),
				or(isNull(s.concepto.vigenteHasta), gte(s.concepto.vigenteHasta, anio))))
			.orderBy(asc(s.concepto.orden));
		return { tipo: 'concepto', opciones: filas.map((c) => ({ id: c.id, rotulo: c.nombre, detalle: c.resumen || undefined })) };
	}
	if (spec === 'usuaria') {
		const filas = await db.select({ id: s.usuario.id, nombre: s.usuario.nombre }).from(s.usuario)
			.where(and(eq(s.usuario.tenantId, tenantId), eq(s.usuario.activa, true))).orderBy(asc(s.usuario.nombre));
		return { tipo: 'usuaria', opciones: filas.map((u) => ({ id: u.id, rotulo: u.nombre })) };
	}
	if (spec === 'puesto') {
		const filas = await db.select({ id: s.docente.id, nombre: s.docente.nombre }).from(s.docente)
			.where(eq(s.docente.tenantId, tenantId)).orderBy(asc(s.docente.nombre));
		return { tipo: 'puesto', opciones: filas.map((u) => ({ id: u.id, rotulo: u.nombre })) };
	}
	if (spec === 'nudo') {
		const filas = await db.select({ id: s.nudo.id, codigo: s.nudo.codigo, nombre: s.nudo.nombre, ciclo: s.diseno.ciclo })
			.from(s.nudo).innerJoin(s.area, eq(s.area.id, s.nudo.areaId)).innerJoin(s.diseno, eq(s.diseno.id, s.area.disenoId))
			.orderBy(asc(s.diseno.ciclo), asc(s.nudo.orden));
		return { tipo: 'nudo', opciones: filas.map((n) => ({ id: n.id, rotulo: `${n.codigo} · ${n.nombre}`, detalle: n.ciclo === 'basico' ? 'Ciclo Básico' : 'Ciclo Orientado' })) };
	}
	return { tipo: 'manual', opciones: [] };
}

/** Los tipos de concepto que existen, para el constructor. */
export async function tiposDeConcepto(tenantId: string) {
	const filas = await db.selectDistinct({ tipo: s.concepto.tipo }).from(s.concepto)
		.where(or(isNull(s.concepto.tenantId), eq(s.concepto.tenantId, tenantId)));
	return filas.map((f) => f.tipo).sort();
}

/** Nombres legibles para una lista de «sobre qué» (tipo + id), resueltos de a un tipo por vez. */
export async function rotulos(pares: { tipo: string; id: string }[], tenantId: string) {
	const out = new Map<string, { rotulo: string; grupo: string }>();
	const ids = (t: string) => [...new Set(pares.filter((p) => p.tipo === t).map((p) => p.id))];
	const k = (t: string, id: string) => `${t}|${id}`;

	if (ids('dictado').length) {
		const todos = await dictados(tenantId);
		for (const d of todos) out.set(k('dictado', d.id), { rotulo: nombreDictado(d), grupo: `${d.anio}º año` });
	}
	if (ids('unidad').length) {
		const todos = await dictados(tenantId);
		const filas = await db.select({ id: s.unidad.id, titulo: s.unidad.titulo, dictadoId: s.planMateria.dictadoId })
			.from(s.unidad).innerJoin(s.planMateria, eq(s.planMateria.id, s.unidad.planId))
			.where(inArray(s.unidad.id, ids('unidad')));
		for (const u of filas) {
			const d = todos.find((x) => x.id === u.dictadoId);
			out.set(k('unidad', u.id), { rotulo: u.titulo, grupo: d ? nombreDictado(d) : '' });
		}
	}
	if (ids('vinculo').length) {
		const filas = await db.select({ id: s.vinculo.id, titulo: s.vinculo.titulo, c: s.vinculo.cuatrimestre })
			.from(s.vinculo).where(inArray(s.vinculo.id, ids('vinculo')));
		for (const v of filas) out.set(k('vinculo', v.id), { rotulo: v.titulo, grupo: `${Math.ceil(v.c / 2)}º año` });
	}
	if (ids('tramo').length) {
		const filas = await db.select({ id: s.nudoCuatrimestre.id, titulo: s.nudoCuatrimestre.titulo, anio: s.nudoCuatrimestre.anioEscolar, codigo: s.nudo.codigo })
			.from(s.nudoCuatrimestre).innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
			.where(inArray(s.nudoCuatrimestre.id, ids('tramo')));
		for (const t of filas) out.set(k('tramo', t.id), { rotulo: `${t.codigo} · ${t.titulo ?? ''}`, grupo: `${t.anio}º año` });
	}
	for (const a of ids('anio')) out.set(k('anio', a), { rotulo: `${a}º año`, grupo: '' });
	return (tipo: string, id: string) => out.get(k(tipo, id)) ?? { rotulo: tipo ? '(ya no existe)' : '', grupo: '' };
}
