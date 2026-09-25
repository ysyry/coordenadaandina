import { db, schema as s } from '$lib/server/db';
import { and, asc, eq } from 'drizzle-orm';
import { CHECKLIST, COMPONENTES, DIAS } from '$lib/pca';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';

const PERIODO = 'Agosto 2026';

export const load: PageServerLoad = async () => {
	const [ae] = await db.select().from(s.areaEscuela)
		.where(eq(s.areaEscuela.tenantId, TENANT)).limit(1);

	const docentes = await db.select().from(s.docente).where(eq(s.docente.tenantId, TENANT));

	const [plan] = await db.select().from(s.planificacion)
		.where(and(eq(s.planificacion.tenantId, TENANT), eq(s.planificacion.cuatrimestre, 2)))
		.limit(1);

	const comps = plan
		? await db.select().from(s.componente)
			.where(eq(s.componente.planificacionId, plan.id)).orderBy(asc(s.componente.numero))
		: [];

	let [ch] = await db.select().from(s.checklist)
		.where(and(eq(s.checklist.areaEscuelaId, ae.id), eq(s.checklist.periodo, PERIODO))).limit(1);
	if (!ch) {
		[ch] = await db.insert(s.checklist)
			.values({ tenantId: TENANT, areaEscuelaId: ae.id, periodo: PERIODO }).returning();
		await db.insert(s.checklistItem)
			.values(CHECKLIST.map((c) => ({ checklistId: ch.id, clave: c.clave })));
	}
	const items = await db.select().from(s.checklistItem)
		.where(eq(s.checklistItem.checklistId, ch.id));

	/* Lo que la app contesta sola */
	const escritos = comps.filter((c) => c.numero !== 6 && c.contenido.trim().length > 0).length;
	const aEscribir = COMPONENTES.filter((c) => !c.auto && !c.fuera).length;
	const reunionOk = ae.reunionDia != null && !!ae.reunionDesde;

	const auto: Record<string, { ok: boolean; texto: string }> = {
		pca: {
			ok: escritos >= aEscribir,
			texto: escritos >= aEscribir
				? `Completa en Areal: los ${aEscribir} componentes que se escriben están redactados.`
				: `En Areal van ${escritos} de ${aEscribir} componentes escritos. Los componentes 2 y 3 salen del catálogo y ya están.`
		},
		reunion: {
			ok: reunionOk,
			texto: reunionOk
				? `${DIAS[ae.reunionDia!]} de ${ae.reunionDesde} a ${ae.reunionHasta}, ${ae.reunionFrecuencia}. ` +
				  `Es la franja en que las cuatro están libres según la grilla oficial.`
				: 'Todavía no está definida en Areal.'
		}
	};

	return {
		periodo: PERIODO,
		checklist: { id: ch.id, fecha: ch.fecha, participantes: ch.participantes },
		items: Object.fromEntries(items.map((i) => [i.clave, i])),
		auto,
		docentes: docentes.map((d) => d.nombre),
		componentes: comps.map((c) => ({ numero: c.numero, lleno: c.contenido.trim().length > 0 })),
		reunion: {
			dia: ae.reunionDia, desde: ae.reunionDesde,
			hasta: ae.reunionHasta, frecuencia: ae.reunionFrecuencia
		}
	};
};

export const actions: Actions = {
	guardar: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		await db.update(s.checklistItem).set({
			marcado: f.get('marcado') != null,
			comentario: String(f.get('comentario') ?? ''),
			enlace: String(f.get('enlace') ?? '')
		}).where(eq(s.checklistItem.id, id));
		return { ok: true };
	},
	cabecera: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		await db.update(s.checklist).set({
			fecha: String(f.get('fecha') ?? '') || null,
			participantes: String(f.get('participantes') ?? '')
		}).where(eq(s.checklist.id, id));
		return { ok: true };
	}
};
