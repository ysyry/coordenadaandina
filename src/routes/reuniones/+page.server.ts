import { db, schema as s } from '$lib/server/db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';


export const load: PageServerLoad = async () => {
	const [ae] = await db.select().from(s.areaEscuela)
		.where(eq(s.areaEscuela.tenantId, TENANT)).limit(1);

	const reuniones = await db.select().from(s.reunion)
		.where(eq(s.reunion.tenantId, TENANT)).orderBy(desc(s.reunion.fecha));
	const acuerdos = await db.select().from(s.acuerdo)
		.where(eq(s.acuerdo.tenantId, TENANT)).orderBy(asc(s.acuerdo.orden));

	const docentes = await db.select().from(s.docente).where(eq(s.docente.tenantId, TENANT));

	return {
		areaEscuelaId: ae.id,
		docentes: docentes.map((d) => d.nombre),
		reunion: { dia: ae.reunionDia, desde: ae.reunionDesde,
			hasta: ae.reunionHasta, frecuencia: ae.reunionFrecuencia },
		reuniones: reuniones.map((r) => {
			const mios = acuerdos.filter((a) => a.reunionId === r.id);
			const bloques: { bloque: string; items: typeof mios }[] = [];
			for (const a of mios) {
				let b = bloques.find((x) => x.bloque === a.bloque);
				if (!b) { b = { bloque: a.bloque, items: [] }; bloques.push(b); }
				b.items.push(a);
			}
			return { ...r, bloques, hechos: mios.filter((a) => a.hecho).length, total: mios.length };
		}),
		pendientes: acuerdos.filter((a) => !a.hecho).length
	};
};

export const actions: Actions = {
	marcar: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		await db.update(s.acuerdo).set({
			hecho: f.get('hecho') != null,
			comoSeResolvio: String(f.get('como') ?? '')
		}).where(and(eq(s.acuerdo.id, id), eq(s.acuerdo.tenantId, TENANT)));
		return { ok: true };
	},
	nuevaReunion: async ({ request }) => {
		const f = await request.formData();
		const titulo = String(f.get('titulo') ?? '').trim();
		const fecha = String(f.get('fecha') ?? '');
		if (!titulo || !fecha) return fail(400, { error: 'Falta la fecha o el título.' });
		const [ae] = await db.select().from(s.areaEscuela)
			.where(eq(s.areaEscuela.tenantId, TENANT)).limit(1);
		await db.insert(s.reunion).values({
			tenantId: TENANT, areaEscuelaId: ae.id, fecha, titulo,
			participantes: String(f.get('participantes') ?? ''),
			caracter: String(f.get('caracter') ?? ''),
			notas: String(f.get('notas') ?? '')
		});
		return { ok: true };
	},
	nuevoAcuerdo: async ({ request }) => {
		const f = await request.formData();
		const texto = String(f.get('texto') ?? '').trim();
		if (!texto) return fail(400, { error: 'Falta el texto.' });
		await db.insert(s.acuerdo).values({
			tenantId: TENANT, reunionId: String(f.get('reunionId') ?? '') || null,
			bloque: String(f.get('bloque') ?? ''), texto,
			responsable: String(f.get('responsable') ?? ''), orden: 900
		});
		return { ok: true };
	}
};
