import { db, schema as s } from '$lib/server/db';
import { and, asc, eq } from 'drizzle-orm';
import { COMPONENTES } from '$lib/pca';
import { CICLO } from '$lib/cuatrimestres';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';


/** La PCA se elabora por ciclo. Si no existe la del ciclo pedido, se crea vacía. */
async function traerPlan(ciclo: string) {
	const [ae] = await db.select().from(s.areaEscuela)
		.where(eq(s.areaEscuela.tenantId, TENANT)).limit(1);

	const [ya] = await db.select().from(s.planificacion)
		.where(and(
			eq(s.planificacion.tenantId, TENANT),
			eq(s.planificacion.ciclo, ciclo),
			eq(s.planificacion.anioCalendario, CICLO.anio)
		)).limit(1);
	if (ya) return ya;

	const [nueva] = await db.insert(s.planificacion).values({
		tenantId: TENANT, areaEscuelaId: ae.id, ciclo, anioCalendario: CICLO.anio
	}).returning();
	return nueva;
}

export const load: PageServerLoad = async ({ url }) => {
	const ciclo = url.searchParams.get('ciclo') === 'orientado' ? 'orientado' : 'basico';
	const plan = await traerPlan(ciclo);

	const escritos = await db.select().from(s.componente)
		.where(eq(s.componente.planificacionId, plan.id)).orderBy(asc(s.componente.numero));

	// Los componentes 2 y 3 salen del catálogo: no se escriben, se muestran.
	const desde = ciclo === 'basico' ? 1 : 7;
	const hasta = ciclo === 'basico' ? 6 : 10;
	const catalogo = await db
		.select({
			codigo: s.nudo.codigo, nombre: s.nudo.nombre, disciplina: s.nudo.disciplina,
			transversal: s.nudo.transversal, orden: s.nudo.orden,
			cuatrimestre: s.nudoCuatrimestre.cuatrimestre, anio: s.nudoCuatrimestre.anioEscolar,
			titulo: s.nudoCuatrimestre.titulo, saberes: s.nudoCuatrimestre.saberes
		})
		.from(s.nudoCuatrimestre)
		.innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
		.orderBy(asc(s.nudoCuatrimestre.cuatrimestre), asc(s.nudo.orden));

	return {
		plan,
		ciclo,
		componentes: COMPONENTES.map((c) => ({
			...c,
			contenido: escritos.find((e) => e.numero === c.n)?.contenido ?? ''
		})),
		catalogo: catalogo.filter((c) => c.cuatrimestre >= desde && c.cuatrimestre <= hasta)
	};
};

export const actions: Actions = {
	guardarComponente: async ({ request }) => {
		const f = await request.formData();
		const planificacionId = String(f.get('planId') ?? '');
		const numero = Number(f.get('numero') ?? 0);
		const contenido = String(f.get('contenido') ?? '');
		await db.insert(s.componente)
			.values({ planificacionId, numero, contenido })
			.onConflictDoUpdate({
				target: [s.componente.planificacionId, s.componente.numero],
				set: { contenido, actualizado: new Date() }
			});
		return { ok: true };
	},

	guardarPlan: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('planId') ?? '');
		const datos: Record<string, string> = {};
		if (f.has('situacionInicial')) datos.situacionInicial = String(f.get('situacionInicial'));
		if (f.has('estado')) datos.estado = String(f.get('estado'));
		await db.update(s.planificacion).set(datos)
			.where(and(eq(s.planificacion.id, id), eq(s.planificacion.tenantId, TENANT)));
		return { ok: true };
	}
};
