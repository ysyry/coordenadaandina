import { db, schema as s } from '$lib/server/db';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';


export const load: PageServerLoad = async () => {
	const [ae] = await db.select().from(s.areaEscuela)
		.where(eq(s.areaEscuela.tenantId, TENANT)).limit(1);
	const cursos = await db.select().from(s.curso)
		.where(eq(s.curso.tenantId, TENANT)).orderBy(asc(s.curso.anioEscolar));
	const nudos = await db.select().from(s.nudo).orderBy(asc(s.nudo.orden));
	const cod = new Map(nudos.map((n) => [n.id, n]));

	const epas = await db.select().from(s.epa)
		.where(eq(s.epa.tenantId, TENANT)).orderBy(asc(s.epa.creado));
	const lazos = epas.length
		? await db.select().from(s.epaNudo).where(inArray(s.epaNudo.epaId, epas.map((e) => e.id)))
		: [];

	/** El EPA como espacio curricular propio del Ciclo Orientado: sus tres nudos. */
	const nudosEpa = await db
		.select({
			codigo: s.nudo.codigo, nombre: s.nudo.nombre,
			cuatrimestre: s.nudoCuatrimestre.cuatrimestre, anio: s.nudoCuatrimestre.anioEscolar,
			titulo: s.nudoCuatrimestre.titulo, saberes: s.nudoCuatrimestre.saberes
		})
		.from(s.nudoCuatrimestre)
		.innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
		.where(eq(s.nudo.disciplina, 'epa'))
		.orderBy(asc(s.nudoCuatrimestre.cuatrimestre));

	/** Los cruces prescriptos del Ciclo Básico: materia prima para armar EPA. */
	const vs = await db.select().from(s.vinculo).orderBy(asc(s.vinculo.cuatrimestre));

	return {
		areaEscuelaId: ae.id,
		cursos: cursos.map((c) => ({ id: c.id, etiqueta: c.etiqueta })),
		nudos: nudos.map((n) => ({ id: n.id, codigo: n.codigo, nombre: n.nombre, disciplina: n.disciplina })),
		nudosEpa,
		cruces: vs.map((v) => ({
			c: v.cuatrimestre, a: cod.get(v.nudoA)?.codigo ?? '?', b: cod.get(v.nudoB)?.codigo ?? '?',
			titulo: v.titulo, resumen: v.resumen, escrito: !!v.falsoAmigo
		})),
		epas: epas.map((e) => {
			const suyos = lazos.filter((l) => l.epaId === e.id)
				.map((l) => cod.get(l.nudoId)).filter(Boolean);
			const disciplinas = new Set(suyos.map((n) => n!.disciplina));
			return {
				...e,
				curso: cursos.find((c) => c.id === e.cursoId)?.etiqueta ?? 'Interárea',
				nudos: suyos.map((n) => ({ codigo: n!.codigo, disciplina: n!.disciplina })),
				cruza: disciplinas.size > 1
			};
		})
	};
};

export const actions: Actions = {
	crear: async ({ request }) => {
		const f = await request.formData();
		const nombre = String(f.get('nombre') ?? '').trim();
		if (!nombre) return fail(400, { error: 'Falta el nombre.' });
		const [ae] = await db.select().from(s.areaEscuela)
			.where(eq(s.areaEscuela.tenantId, TENANT)).limit(1);
		const cursoId = String(f.get('cursoId') ?? '');
		const [nuevo] = await db.insert(s.epa).values({
			tenantId: TENANT, areaEscuelaId: ae.id, nombre,
			cursoId: cursoId || null,
			cuatrimestre: Number(f.get('cuatrimestre')) || null,
			anioCalendario: 2026,
			proposito: String(f.get('problema') ?? ''),
			docentes: String(f.get('conQuien') ?? ''),
			estado: String(f.get('estado') ?? 'idea')
		}).returning();
		const elegidos = f.getAll('nudos').map(String).filter(Boolean);
		for (const id of elegidos) await db.insert(s.epaNudo).values({ epaId: nuevo.id, nudoId: id });
		return { ok: true };
	},
	borrar: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		if (id) await db.delete(s.epa).where(and(eq(s.epa.id, id), eq(s.epa.tenantId, TENANT)));
		return { ok: true };
	}
};
