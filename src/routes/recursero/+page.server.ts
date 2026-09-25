import { db, schema as s } from '$lib/server/db';
import { and, asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { CATEGORIAS } from '$lib/recursero';
import type { Actions, PageServerLoad } from './$types';
import { TENANT } from '$lib/server/tenant';



export const load: PageServerLoad = async () => {
	const rs = await db.select().from(s.recurso)
		.where(eq(s.recurso.tenantId, TENANT)).orderBy(asc(s.recurso.orden));
	return { recursos: rs, categorias: CATEGORIAS };
};

export const actions: Actions = {
	agregar: async ({ request }) => {
		const f = await request.formData();
		const titulo = String(f.get('titulo') ?? '').trim();
		if (!titulo) return fail(400, { error: 'Falta el título.' });
		await db.insert(s.recurso).values({
			tenantId: TENANT, titulo,
			categoria: String(f.get('categoria') ?? 'herramienta'),
			formato: String(f.get('formato') ?? 'web'),
			descripcion: String(f.get('descripcion') ?? ''),
			enlace: String(f.get('enlace') ?? ''),
			fuente: String(f.get('fuente') ?? ''),
			orden: 999
		});
		return { ok: true };
	},
	borrar: async ({ request }) => {
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		if (id) await db.delete(s.recurso)
			.where(and(eq(s.recurso.id, id), eq(s.recurso.tenantId, TENANT)));
		return { ok: true };
	}
};
