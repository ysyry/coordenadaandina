import { db, schema as s } from '$lib/server/db';
import { and, asc, eq, inArray, notInArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { MAPA, OBJETIVOS, EJES } from '$lib/pca';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';


export const load: PageServerLoad = async ({ params }) => {
	const [e] = await db.select().from(s.epa)
		.where(and(eq(s.epa.id, params.id), eq(s.epa.tenantId, TENANT))).limit(1);
	if (!e) throw error(404, 'No existe ese EPA');

	const cursos = await db.select().from(s.curso).where(eq(s.curso.tenantId, TENANT));
	const nudos = await db.select().from(s.nudo).orderBy(asc(s.nudo.orden));
	const lazos = await db.select().from(s.epaNudo).where(eq(s.epaNudo.epaId, e.id));
	const objs = await db.select().from(s.epaObjetivo).where(eq(s.epaObjetivo.epaId, e.id));

	const mios = lazos.map((l) => nudos.find((n) => n.id === l.nudoId)).filter(Boolean);
	const disciplinas = new Set(mios.map((n) => n!.disciplina));

	/** Los saberes de cada nudo en el cuatrimestre del EPA: el catálogo trabajando. */
	const saberes = mios.length && e.cuatrimestre
		? await db.select({
				codigo: s.nudo.codigo, nombre: s.nudo.nombre, disciplina: s.nudo.disciplina,
				titulo: s.nudoCuatrimestre.titulo, texto: s.nudoCuatrimestre.saberes
			})
			.from(s.nudoCuatrimestre)
			.innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
			.where(and(
				inArray(s.nudoCuatrimestre.nudoId, mios.map((n) => n!.id)),
				eq(s.nudoCuatrimestre.cuatrimestre, e.cuatrimestre)
			))
		: [];

	return {
		epa: e,
		curso: cursos.find((c) => c.id === e.cursoId)?.etiqueta ?? 'Interárea',
		cruza: disciplinas.size > 1,
		nudos: mios.map((n) => ({ id: n!.id, codigo: n!.codigo, nombre: n!.nombre, disciplina: n!.disciplina })),
		todos: nudos.map((n) => ({ id: n.id, codigo: n.codigo, nombre: n.nombre, disciplina: n.disciplina })),
		saberes,
		objetivos: OBJETIVOS.map((o) => ({ ...o, como: objs.find((x) => x.clave === o.clave)?.como ?? '' })),
		ejes: EJES.map((o) => ({ ...o, como: objs.find((x) => x.clave === o.clave)?.como ?? '' })),
		campos: MAPA
	};
};

export const actions: Actions = {
	campo: async ({ request, params }) => {
		const f = await request.formData();
		const k = String(f.get('k') ?? '');
		const v = String(f.get('v') ?? '');
		const permitidos = new Set<string>([...MAPA.map((m) => m.k), 'nombre', 'docentes', 'estado']);
		if (!permitidos.has(k)) return { ok: false };
		await db.update(s.epa).set({ [k]: v })
			.where(and(eq(s.epa.id, params.id), eq(s.epa.tenantId, TENANT)));
		return { ok: true };
	},
	objetivo: async ({ request, params }) => {
		const f = await request.formData();
		await db.update(s.epaObjetivo).set({ como: String(f.get('como') ?? '') })
			.where(and(eq(s.epaObjetivo.epaId, params.id),
				eq(s.epaObjetivo.clave, String(f.get('clave') ?? ''))));
		return { ok: true };
	},
	nudos: async ({ request, params }) => {
		const f = await request.formData();
		const ids = f.getAll('nudos').map(String).filter(Boolean);
		await db.delete(s.epaNudo).where(eq(s.epaNudo.epaId, params.id));
		for (const id of ids) await db.insert(s.epaNudo).values({ epaId: params.id, nudoId: id });
		return { ok: true };
	}
};
