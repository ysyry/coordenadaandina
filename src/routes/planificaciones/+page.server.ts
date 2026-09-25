import { db, schema as s } from '$lib/server/db';
import { asc, eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { clasesReales, cuatrisDe, diasSinClase } from '$lib/clases';
import { CICLO } from '$lib/cuatrimestres';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';


export const load: PageServerLoad = async () => {
	const cursos = await db.select().from(s.curso)
		.where(eq(s.curso.tenantId, TENANT)).orderBy(asc(s.curso.anioEscolar));

	// No hay tabla de materias: una materia es lo que el horario dice que se dicta.
	const bloques = await db
		.select({
			cursoId: s.bloque.cursoId, espacio: s.bloque.espacio,
			disciplina: s.bloque.disciplina, dia: s.bloque.dia,
			desde: s.bloque.desde, hasta: s.bloque.hasta, docente: s.docente.nombre
		})
		.from(s.bloque)
		.leftJoin(s.docente, eq(s.docente.id, s.bloque.docenteId))
		.where(eq(s.bloque.tenantId, TENANT));

	const eventos = await db
		.select({
			fecha: s.evento.fecha, hasta: s.evento.hasta,
			afectaClases: s.evento.afectaClases, cursoId: s.evento.cursoId
		})
		.from(s.evento).where(eq(s.evento.tenantId, TENANT));

	const planes = await db.select().from(s.planMateria)
		.where(eq(s.planMateria.tenantId, TENANT));
	const unidades = await db.select().from(s.unidad).where(eq(s.unidad.tenantId, TENANT));
	const epas = await db.select().from(s.epa).where(eq(s.epa.tenantId, TENANT));

	// ── La PCA: una por ciclo. Y los ocho componentes, para saber cuántos hay escritos.
	const pcas = await db.select().from(s.planificacion)
		.where(eq(s.planificacion.tenantId, TENANT));
	const componentes = await db.select().from(s.componente);

	// ── Qué unidad toca las dos disciplinas: eso es una propuesta articulada.
	const enlaces = await db
		.select({ unidadId: s.unidadNudo.unidadId, disciplina: s.nudo.disciplina })
		.from(s.unidadNudo)
		.innerJoin(s.nudo, eq(s.nudo.id, s.unidadNudo.nudoId));

	const [ae2] = await db.select().from(s.areaEscuela)
		.where(eq(s.areaEscuela.tenantId, TENANT)).limit(1);

	const items = await db.select().from(s.checklistItem);

	const minutos = (a: string, b: string) => {
		const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
		return m(b) - m(a);
	};

	const filas = cursos.map((c) => {
		const sinClase = diasSinClase(eventos, c.id);
		const suyos = bloques.filter((b) => b.cursoId === c.id);
		const nombres = [...new Set(suyos.map((b) => b.espacio))].sort();

		const materias = nombres.map((espacio) => {
			const mios = suyos.filter((b) => b.espacio === espacio);
			const dias = mios.map((b) => b.dia);
			return {
				espacio,
				disciplina: mios[0].disciplina,
				docentes: [...new Set(mios.map((b) => b.docente).filter(Boolean))] as string[],
				minutos: mios.reduce((a, b) => a + minutos(b.desde, b.hasta), 0),
				encuentros: mios.length,
				tramos: cuatrisDe(c.anioEscolar).map((cu) => {
					const plan = planes.find(
						(p) => p.cursoId === c.id && p.espacio === espacio &&
							p.cuatrimestre === cu && p.anioCalendario === CICLO.anio
					);
					const mias = plan ? unidades.filter((u) => u.planId === plan.id) : [];
					return {
						c: cu,
						planId: plan?.id ?? null,
						estado: plan?.estado ?? null,
						conCriterios: !!plan?.criterios.trim(),
						unidades: mias.length,
						planificadas: mias.reduce((a, u) => a + u.clases, 0),
						...clasesReales(dias, cu, sinClase)
					};
				})
			};
		});
		return {
			id: c.id, anio: c.anioEscolar, etiqueta: c.etiqueta ?? `${c.anioEscolar}º año`,
			materias,
			epas: epas.filter((e) => e.cursoId === c.id).map((e) => ({ id: e.id, nombre: e.nombre, c: e.cuatrimestre }))
		};
	});

	// ══════════ El estado de lo que hay que entregar ══════════
	// Nada de esto se tilda a mano: se calcula de lo que hay cargado.

	const pcaDe = (ciclo: string) => {
		const pca = pcas.find((p) => p.ciclo === ciclo && p.anioCalendario === CICLO.anio);
		if (!pca) return { hay: false, escritos: 0, situacion: false, nucleos: false };
		const mios = componentes.filter((c) => c.planificacionId === pca.id);
		return {
			hay: true,
			escritos: mios.filter((c) => c.contenido.trim() && c.numero !== 6).length,
			situacion: !!pca.situacionInicial.trim(),
			nucleos: !!mios.find((c) => c.numero === 2)?.contenido.trim()
		};
	};
	const basico = pcaDe('basico');
	const orientado = pcaDe('orientado');

	const CAMPOS_MAPA = [
		'proposito', 'nucleos', 'saberes', 'perspectivas', 'capacidades',
		'mapaProyecto', 'productoFinal', 'productosIntermedios', 'revisionCritica', 'criteriosInformes'
	] as const;
	const epaEstado = epas.map((e) => ({
		id: e.id,
		nombre: e.nombre,
		cuatrimestre: e.cuatrimestre,
		llenos: CAMPOS_MAPA.filter((k) => String(e[k] ?? '').trim()).length,
		total: CAMPOS_MAPA.length
	}));

	// Una unidad que toca nudos de las dos disciplinas es una propuesta articulada.
	const dosDisciplinas = new Set<string>();
	const porUnidad = new Map<string, Set<string>>();
	for (const e of enlaces) {
		let d = porUnidad.get(e.unidadId);
		if (!d) { d = new Set(); porUnidad.set(e.unidadId, d); }
		d.add(e.disciplina);
	}
	for (const [id, d] of porUnidad) if (d.has('matematica') && d.has('informatica')) dosDisciplinas.add(id);

	const cursoDe = new Map(cursos.map((c) => [c.id, c.anioEscolar]));
	const planDe = new Map(planes.map((p) => [p.id, p]));
	const articuladasBasico = new Set<number>();
	for (const u of unidades) {
		if (!dosDisciplinas.has(u.id)) continue;
		const plan = planDe.get(u.planId);
		if (!plan) continue;
		const anio = cursoDe.get(plan.cursoId);
		if (anio === 1 || anio === 2) articuladasBasico.add(plan.cuatrimestre);
	}

	const conCriterios = planes.filter((p) => p.criterios.trim()).length;
	const totalMaterias = filas.reduce((a, f) => a + f.materias.length, 0);

	return {
		filas,
		anio: CICLO.anio,
		entrega: {
			basico,
			orientado,
			reunion: !!(ae2?.reunionDia && ae2?.reunionDesde && ae2?.reunionFrecuencia),
			materias: { abiertas: planes.length, posibles: totalMaterias * 2, conCriterios },
			epas: epaEstado,
			articuladas: { hechas: articuladasBasico.size, pide: 4 },
			escuela: { marcados: items.filter((i) => i.marcado).length, total: items.length }
		}
	};
};

export const actions: Actions = {
	abrir: async ({ request }) => {
		const f = await request.formData();
		const cursoId = String(f.get('cursoId') ?? '');
		const espacio = String(f.get('espacio') ?? '');
		const disciplina = String(f.get('disciplina') ?? '');
		const cuatrimestre = Number(f.get('cuatrimestre') ?? 0);

		const [ya] = await db.insert(s.planMateria)
			.values({ tenantId: TENANT, cursoId, espacio, disciplina, cuatrimestre, anioCalendario: CICLO.anio })
			.onConflictDoUpdate({
				target: [s.planMateria.cursoId, s.planMateria.espacio,
					s.planMateria.cuatrimestre, s.planMateria.anioCalendario],
				set: { espacio }
			})
			.returning({ id: s.planMateria.id });

		redirect(303, `/planificaciones/${ya.id}`);
	}
};
