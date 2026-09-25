/**
 * Completa la estructura que hace que todo se pueda cruzar (ver MODELO.md).
 *
 *   npm run db:estructura
 *
 * No borra nada y se puede correr las veces que haga falta: busca por código y
 * sólo agrega lo que falta o actualiza lo que cambió. Va después de `db:seed`.
 *
 *  1. Norma    · ciclo de cada diseño, espacios curriculares, nudo → espacio, conceptos del marco
 *  2. Escuela  · orientación, ciclo lectivo y períodos, espacios con sus ramas, dictados desde el
 *                horario, ocupaciones desde las cuentas, cruces de la escuela
 *  3. Trabajo  · los temas de marzo como unidades de cada plan
 *  4. Encuesta · Bases del área, sembrada una sola vez (después se edita en la app)
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import * as s from '../src/lib/server/db/schema';
import { PERSPECTIVAS, VINCULOS_AREA, OBJETIVOS_AREA, OBJETIVOS_DISCIPLINA, CATEGORIAS_ORIENTADO } from '../src/lib/marco';
import { PRACTICAS, FORMATOS } from '../src/lib/catalogo/neuquen';
import { CICLO } from '../src/lib/cuatrimestres';
import { TEMAS_MARZO, MAPAS } from './datos/temas-marzo-2026';
import * as BASES from './datos/bases-2026';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql, { schema: s });

const log = (...x: unknown[]) => console.log(' ', ...x);

/* ───────────────────────── 1 · Norma ───────────────────────── */

async function norma() {
	console.log('1 · Norma');
	const disenos = await db.select().from(s.diseno);
	for (const d of disenos) {
		const ciclo = /1578|1044|orientado/i.test(`${d.resolucion} ${d.nombre}`) ? 'orientado' : 'basico';
		if (d.ciclo !== ciclo) await db.update(s.diseno).set({ ciclo }).where(eq(s.diseno.id, d.id));
	}

	const areas = await db
		.select({ id: s.area.id, ciclo: s.diseno.ciclo, disenoId: s.diseno.id })
		.from(s.area).innerJoin(s.diseno, eq(s.diseno.id, s.area.disenoId));

	const ESPACIOS: Record<string, { codigo: string; nombre: string; disciplina: string; anios: number[] }[]> = {
		basico: [
			{ codigo: 'MAT', nombre: 'Matemática', disciplina: 'matematica', anios: [1, 2, 3] },
			{ codigo: 'INF', nombre: 'Informática', disciplina: 'informatica', anios: [1, 2, 3] }
		],
		orientado: [
			{ codigo: 'MAT', nombre: 'Matemática', disciplina: 'matematica', anios: [4, 5] },
			{ codigo: 'INF', nombre: 'Informática', disciplina: 'informatica', anios: [4, 5] },
			{ codigo: 'EPA-MI', nombre: 'EPA Matemática e Informática', disciplina: 'epa', anios: [4, 5] }
		]
	};

	for (const a of areas) {
		let orden = 0;
		for (const e of ESPACIOS[a.ciclo]) {
			const [ya] = await db.select().from(s.espacioCurricular)
				.where(and(eq(s.espacioCurricular.areaId, a.id), eq(s.espacioCurricular.codigo, e.codigo)));
			const valores = { areaId: a.id, ...e, orden: orden++ };
			const id = ya
				? (await db.update(s.espacioCurricular).set(valores).where(eq(s.espacioCurricular.id, ya.id)).returning())[0].id
				: (await db.insert(s.espacioCurricular).values(valores).returning())[0].id;
			const n = await db.update(s.nudo).set({ espacioId: id })
				.where(and(eq(s.nudo.areaId, a.id), eq(s.nudo.disciplina, e.disciplina))).returning({ id: s.nudo.id });
			log(`${a.ciclo.padEnd(9)} ${e.codigo.padEnd(7)} ${n.length} nudos`);
		}
	}

	const d1463 = disenos.find((d) => /1381/.test(d.resolucion))?.id ?? null;
	const dOrient = disenos.find((d) => /1578/.test(d.resolucion))?.id ?? null;

	const conceptos: Omit<typeof s.concepto.$inferInsert, 'tenantId'>[] = [
		...PERSPECTIVAS.map((p, i) => ({ tipo: 'perspectiva', codigo: p.clave, nombre: p.rot, resumen: p.pie, texto: p.texto, disenoId: d1463, orden: i })),
		...VINCULOS_AREA.map((v, i) => ({ tipo: 'vinculo_area', codigo: v.clave, nombre: v.rot, resumen: v.resumen, texto: v.texto, disenoId: d1463, orden: i })),
		...OBJETIVOS_AREA.map((o, i) => ({ tipo: 'objetivo_area', codigo: `oa${o.n}`, nombre: o.texto, resumen: o.mira, disenoId: d1463, orden: i })),
		...Object.entries(OBJETIVOS_DISCIPLINA).flatMap(([disciplina, lista]) =>
			lista.map((texto, i) => ({ tipo: 'objetivo_disciplina', codigo: `${disciplina.slice(0, 3)}${i + 1}`, nombre: texto, disciplina, disenoId: d1463, orden: i }))),
		...PRACTICAS.map((p, i) => ({ tipo: 'practica', codigo: p, nombre: p, disenoId: d1463, orden: i })),
		...FORMATOS.map((p, i) => ({ tipo: 'formato_pedagogico', codigo: p.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase(), nombre: p, disenoId: d1463, orden: i })),
		...CATEGORIAS_ORIENTADO.map((c, i) => ({ tipo: 'categoria', codigo: c.normalize('NFD').replace(/[^\w]+/g, '-').toLowerCase(), nombre: c, disenoId: dOrient, orden: i }))
	];
	for (const c of conceptos) await concepto(null, c);
	log(`${conceptos.length} conceptos de la norma`);
}

/** Busca por (tenant, tipo, código): en Postgres dos NULL no chocan en un índice único. */
async function concepto(tenantId: string | null, c: Omit<typeof s.concepto.$inferInsert, 'tenantId'>) {
	const [ya] = await db.select({ id: s.concepto.id }).from(s.concepto).where(and(
		tenantId ? eq(s.concepto.tenantId, tenantId) : isNull(s.concepto.tenantId),
		eq(s.concepto.tipo, c.tipo), eq(s.concepto.codigo, c.codigo)
	));
	if (ya) {
		await db.update(s.concepto).set(c).where(eq(s.concepto.id, ya.id));
		return ya.id;
	}
	return (await db.insert(s.concepto).values({ ...c, tenantId }).returning())[0].id;
}

/* ───────────────────────── 2 · Escuela ───────────────────────── */

/** Cómo el horario nombra cada espacio, y a qué espacio curricular corresponde. */
function espacioDelHorario(espacio: string, anio: number): { codigo: string; rama: string | null } {
	if (espacio === 'Matemática') return { codigo: 'MAT', rama: null };
	if (espacio === 'Programación' || espacio === 'Diseño') return { codigo: 'INF', rama: espacio };
	return { codigo: 'INF', rama: null };
}

async function escuela() {
	console.log('\n2 · Escuela');
	const escuelas = await db.select().from(s.escuela);
	for (const esc of escuelas) {
		const tenant = esc.tenantId;
		await db.update(s.escuela).set({
			orientacion: esc.orientacion || 'Turismo',
			localidad: esc.localidad || 'Villa La Angostura'
		}).where(eq(s.escuela.id, esc.id));

		// Ciclo lectivo y períodos, desde la constante que hasta hoy los fijaba.
		let [cl] = await db.select().from(s.cicloLectivo)
			.where(and(eq(s.cicloLectivo.escuelaId, esc.id), eq(s.cicloLectivo.anio, CICLO.anio)));
		if (!cl) [cl] = await db.insert(s.cicloLectivo).values({ tenantId: tenant, escuelaId: esc.id, anio: CICLO.anio }).returning();
		for (const p of CICLO.cuatrimestres) {
			await db.insert(s.periodo)
				.values({ cicloLectivoId: cl.id, tipo: 'cuatrimestre', n: p.n, nombre: p.nombre, desde: p.desde, hasta: p.hasta })
				.onConflictDoUpdate({ target: [s.periodo.cicloLectivoId, s.periodo.tipo, s.periodo.n], set: { nombre: p.nombre, desde: p.desde, hasta: p.hasta } });
		}

		await db.update(s.curso).set({ anioCalendario: CICLO.anio })
			.where(and(eq(s.curso.escuelaId, esc.id), isNull(s.curso.anioCalendario)));

		// Los espacios curriculares disponibles, por ciclo.
		const ecs = await db
			.select({ id: s.espacioCurricular.id, codigo: s.espacioCurricular.codigo, anios: s.espacioCurricular.anios })
			.from(s.espacioCurricular);
		const ecDe = (codigo: string, anio: number) => ecs.find((e) => e.codigo === codigo && e.anios.includes(anio));

		// Espacios de la escuela y dictados, desde el horario.
		const bloques = await db
			.select({ id: s.bloque.id, espacio: s.bloque.espacio, cursoId: s.bloque.cursoId, docenteId: s.bloque.docenteId, anio: s.curso.anioEscolar })
			.from(s.bloque).innerJoin(s.curso, eq(s.curso.id, s.bloque.cursoId))
			.where(eq(s.curso.escuelaId, esc.id));

		const eeIds = new Map<string, string>();
		for (const b of bloques) {
			const { codigo, rama } = espacioDelHorario(b.espacio, b.anio);
			const ec = ecDe(codigo, b.anio);
			if (!ec) { log(`! sin espacio curricular para ${b.espacio} en ${b.anio}º`); continue; }
			const clave = `${ec.id}|${b.espacio}`;
			if (!eeIds.has(clave)) {
				const [ya] = await db.select().from(s.espacioEscuela).where(and(
					eq(s.espacioEscuela.escuelaId, esc.id), eq(s.espacioEscuela.espacioCurricularId, ec.id), eq(s.espacioEscuela.nombre, b.espacio)));
				const anios = [...new Set(bloques.filter((x) => x.espacio === b.espacio && ecDe(codigo, x.anio)?.id === ec.id).map((x) => x.anio))].sort();
				const id = ya
					? (await db.update(s.espacioEscuela).set({ anios, rama }).where(eq(s.espacioEscuela.id, ya.id)).returning())[0].id
					: (await db.insert(s.espacioEscuela).values({ tenantId: tenant, escuelaId: esc.id, espacioCurricularId: ec.id, nombre: b.espacio, rama, anios }).returning())[0].id;
				eeIds.set(clave, id);
			}
		}
		log(`${eeIds.size} espacios de la escuela`);

		const grupos = new Map<string, { cursoId: string; eeId: string; puestoId: string | null; bloques: string[] }>();
		for (const b of bloques) {
			const { codigo } = espacioDelHorario(b.espacio, b.anio);
			const ec = ecDe(codigo, b.anio);
			if (!ec) continue;
			const eeId = eeIds.get(`${ec.id}|${b.espacio}`)!;
			const k = `${b.cursoId}|${eeId}|${b.docenteId}`;
			const g = grupos.get(k) ?? { cursoId: b.cursoId, eeId, puestoId: b.docenteId, bloques: [] };
			g.bloques.push(b.id);
			grupos.set(k, g);
		}
		for (const g of grupos.values()) {
			const [ya] = await db.select().from(s.dictado).where(and(
				eq(s.dictado.cursoId, g.cursoId), eq(s.dictado.espacioEscuelaId, g.eeId),
				g.puestoId ? eq(s.dictado.puestoId, g.puestoId) : isNull(s.dictado.puestoId)));
			const id = ya
				? (await db.update(s.dictado).set({ encuentros: g.bloques.length }).where(eq(s.dictado.id, ya.id)).returning())[0].id
				: (await db.insert(s.dictado).values({ tenantId: tenant, cursoId: g.cursoId, espacioEscuelaId: g.eeId, puestoId: g.puestoId, encuentros: g.bloques.length, origen: 'horario' }).returning())[0].id;
			for (const bid of g.bloques) await db.update(s.bloque).set({ dictadoId: id }).where(eq(s.bloque.id, bid));
		}
		log(`${grupos.size} dictados desde el horario`);

		// Ocupaciones: las cuentas que ya estaban unidas a un puesto.
		const cuentas = await db.select().from(s.usuario).where(eq(s.usuario.tenantId, tenant));
		let nuevas = 0;
		for (const u of cuentas) {
			if (!u.docenteId) continue;
			const [ya] = await db.select().from(s.ocupacion)
				.where(and(eq(s.ocupacion.usuarioId, u.id), eq(s.ocupacion.puestoId, u.docenteId), isNull(s.ocupacion.dictadoId)));
			if (!ya) { await db.insert(s.ocupacion).values({ usuarioId: u.id, puestoId: u.docenteId }); nuevas++; }
		}
		log(`${nuevas} ocupaciones nuevas desde las cuentas`);

		// Los cruces son lectura de esta escuela.
		await db.update(s.vinculo).set({ tenantId: tenant }).where(isNull(s.vinculo.tenantId));

		// Conceptos propios de la escuela.
		for (const [i, [codigo, nombre]] of BASES.EJES_2026.entries())
			await concepto(tenant, { tipo: 'eje_institucional', codigo, nombre, orden: i, vigenteDesde: 2026, vigenteHasta: 2026 });
		for (const [i, [codigo, nombre, resumen]] of BASES.CRITERIOS_2026.entries())
			await concepto(tenant, { tipo: 'criterio_evaluacion', codigo, nombre, resumen, orden: i, vigenteDesde: 2026 });
		log(`${BASES.EJES_2026.length} ejes institucionales y ${BASES.CRITERIOS_2026.length} criterios de evaluación`);

		// Los criterios del área, con los tres campos que la Res. 1463/18 pide
		// explicitar por cada uno. Se crean vacíos a propósito: lo que falta tiene
		// que verse, no inventarse.
		const [ae] = await db.select().from(s.areaEscuela).where(eq(s.areaEscuela.tenantId, tenant)).limit(1);
		if (ae) {
			const criterios = await db.select().from(s.concepto)
				.where(and(eq(s.concepto.tenantId, tenant), eq(s.concepto.tipo, 'criterio_evaluacion')));
			let nuevosCrit = 0;
			for (const c of criterios) {
				const [ya] = await db.select({ id: s.criterioArea.id }).from(s.criterioArea)
					.where(and(eq(s.criterioArea.areaEscuelaId, ae.id), eq(s.criterioArea.conceptoId, c.id)));
				if (ya) continue;
				await db.insert(s.criterioArea).values({
					tenantId: tenant, areaEscuelaId: ae.id, conceptoId: c.id,
					nombre: c.nombre, orden: c.orden, vigenteDesde: 2026
				});
				nuevosCrit++;
			}
			if (nuevosCrit) log(`${nuevosCrit} criterios del área listos para completar`);
		}

		await trabajo(esc.id, tenant);
		await encuesta(tenant);
	}
}

/* ───────────────────────── 3 · Trabajo ───────────────────────── */

async function trabajo(escuelaId: string, tenant: string) {
	console.log('\n3 · Los temas de marzo como unidades');
	const dictados = await db
		.select({
			id: s.dictado.id, cursoId: s.dictado.cursoId, anio: s.curso.anioEscolar,
			espacio: s.espacioEscuela.nombre, rama: s.espacioEscuela.rama,
			codigo: s.espacioCurricular.codigo, areaId: s.espacioCurricular.areaId
		})
		.from(s.dictado)
		.innerJoin(s.curso, eq(s.curso.id, s.dictado.cursoId))
		.innerJoin(s.espacioEscuela, eq(s.espacioEscuela.id, s.dictado.espacioEscuelaId))
		.innerJoin(s.espacioCurricular, eq(s.espacioCurricular.id, s.espacioEscuela.espacioCurricularId))
		.where(eq(s.curso.escuelaId, escuelaId));
	const nudos = await db.select({ id: s.nudo.id, codigo: s.nudo.codigo, areaId: s.nudo.areaId }).from(s.nudo);

	let unidades = 0;
	for (const t of TEMAS_MARZO) {
		// En 3º y 4º Informática se dicta en dos ramas: cada tema dice de cuál es.
		const d = dictados.find((x) => x.anio === t.anio &&
			(t.materia === 'Matemática' ? x.codigo === 'MAT' : x.codigo === 'INF' && (x.rama ?? null) === (t.rama ?? null)));
		if (!d) { log(`! sin dictado para ${t.materia} de ${t.anio}º`); continue; }

		let [plan] = await db.select().from(s.planMateria).where(and(
			eq(s.planMateria.cursoId, d.cursoId), eq(s.planMateria.espacio, d.espacio),
			eq(s.planMateria.cuatrimestre, t.c), eq(s.planMateria.anioCalendario, 2026)));
		if (!plan) [plan] = await db.insert(s.planMateria).values({
			tenantId: tenant, cursoId: d.cursoId, dictadoId: d.id, espacio: d.espacio,
			disciplina: t.materia === 'Matemática' ? 'matematica' : 'informatica',
			cuatrimestre: t.c, anioCalendario: 2026, estado: 'en curso'
		}).returning();
		else if (!plan.dictadoId) await db.update(s.planMateria).set({ dictadoId: d.id }).where(eq(s.planMateria.id, plan.id));

		const orden = TEMAS_MARZO.filter((x) => x.anio === t.anio && x.materia === t.materia && x.rama === t.rama && x.c === t.c).indexOf(t);
		const texto = { orden, contenidos: t.contenidos, fuente: MAPAS[t.anio]?.url ?? '' };
		const [ya] = await db.select().from(s.unidad).where(and(eq(s.unidad.planId, plan.id), eq(s.unidad.titulo, t.tema)));
		if (ya) { await db.update(s.unidad).set(texto).where(eq(s.unidad.id, ya.id)); continue; }
		const [u] = await db.insert(s.unidad).values({ tenantId: tenant, planId: plan.id, titulo: t.tema, ...texto }).returning();
		for (const codigo of t.nudos) {
			const n = nudos.find((x) => x.codigo === codigo && x.areaId === d.areaId);
			if (n) await db.insert(s.unidadNudo).values({ unidadId: u.id, nudoId: n.id }).onConflictDoNothing();
		}
		unidades++;
	}
	log(`${unidades} unidades nuevas (de ${TEMAS_MARZO.length} temas)`);

	// Lo que ya no está en los mapas de área se saca, salvo que tenga respuestas o clases:
	// eso ya es historia del área y no se borra.
	const titulos = new Set(TEMAS_MARZO.map((t) => t.tema));
	const planes = await db.select({ id: s.planMateria.id }).from(s.planMateria)
		.where(and(eq(s.planMateria.tenantId, tenant), eq(s.planMateria.anioCalendario, 2026)));
	let quitadas = 0, quedan = 0;
	if (planes.length) {
		const viejas = (await db.select().from(s.unidad).where(inArray(s.unidad.planId, planes.map((p) => p.id))))
			.filter((u) => !titulos.has(u.titulo));
		for (const u of viejas) {
			const [r] = await db.select({ id: s.respuesta.id }).from(s.respuesta)
				.where(and(eq(s.respuesta.sobreTipo, 'unidad'), eq(s.respuesta.sobreId, u.id))).limit(1);
			const [c] = await db.select({ id: s.claseDada.id }).from(s.claseDada).where(eq(s.claseDada.unidadId, u.id)).limit(1);
			if (r || c) { quedan++; continue; }
			await db.delete(s.unidad).where(eq(s.unidad.id, u.id));
			quitadas++;
		}
	}
	// Los planes que quedaron vacíos (el tema se movió de cuatrimestre o de rama) se sacan.
	for (const p of planes) {
		const [u] = await db.select({ id: s.unidad.id }).from(s.unidad).where(eq(s.unidad.planId, p.id)).limit(1);
		if (!u) await db.delete(s.planMateria).where(eq(s.planMateria.id, p.id));
	}
	if (quitadas || quedan) log(`${quitadas} unidades que ya no están en los mapas, quitadas${quedan ? ` · ${quedan} quedan porque tienen respuestas` : ''}`);
}

/* ───────────────────────── 4 · Encuesta ───────────────────────── */

async function encuesta(tenant: string) {
	console.log('\n4 · Bases del área');
	const [ya] = await db.select().from(s.encuesta).where(and(eq(s.encuesta.tenantId, tenant), eq(s.encuesta.clave, BASES.CLAVE)));
	if (ya) { log('ya estaba: no se toca (se edita en la app)'); return; }

	const [e] = await db.insert(s.encuesta).values({
		tenantId: tenant, clave: BASES.CLAVE, titulo: BASES.TITULO, motivacion: BASES.MOTIVACION, estado: 'abierta'
	}).returning();
	let orden = 0, n = 0;
	for (const [i, sec] of BASES.SECCIONES.entries()) {
		const [fila] = await db.insert(s.encuestaSeccion)
			.values({ encuestaId: e.id, orden: i, titulo: sec.titulo, apunta: sec.apunta, saber: sec.saber }).returning();
		for (const p of sec.preguntas) {
			await db.insert(s.pregunta).values({
				encuestaId: e.id, seccionId: fila.id, orden: orden++, texto: p.texto, ayuda: p.ayuda ?? '',
				tipo: p.tipo, obligatoria: !!p.obligatoria, clase: p.clase ?? null,
				por: p.por ?? 'nada', alcance: p.alcance ?? 'mios', opcionesDe: p.opcionesDe ?? 'manual',
				opciones: (p.opciones ?? []).join('\n'), conOtra: !!p.conOtra, muestra: p.muestra ?? null
			});
			n++;
		}
	}
	log(`${BASES.SECCIONES.length} secciones y ${n} preguntas`);
}

async function main() {
	await norma();
	await escuela();
	console.log('\nListo.');
}

main().then(() => sql.end()).catch(async (e) => { console.error(e); await sql.end(); process.exit(1); });
