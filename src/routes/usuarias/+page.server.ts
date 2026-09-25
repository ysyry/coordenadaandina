import { error, fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, schema as s } from '$lib/server/db';
import { hashear } from '$lib/server/sesion';
import type { PageServerLoad } from './$types';

const MINIMO = 10;

/** Sólo quien administra ve y toca esta página. */
function soloAdmin(locals: App.Locals) {
	if (!locals.usuario?.admin) throw error(403, 'Esta parte la maneja la coordinación.');
	return locals.usuario;
}

export const load: PageServerLoad = async ({ locals }) => {
	soloAdmin(locals);
	const filas = await db
		.select({
			id: s.usuario.id, nombre: s.usuario.nombre, email: s.usuario.email,
			activa: s.usuario.activa, admin: s.usuario.admin,
			ultimoIngreso: s.usuario.ultimoIngreso, creado: s.usuario.creado
		})
		.from(s.usuario)
		.orderBy(s.usuario.nombre);
	return { usuarias: filas, yo: locals.usuario!.id };
};

export const actions: Actions = {
	alta: async ({ request, locals }) => {
		const yo = soloAdmin(locals);
		const d = await request.formData();
		const nombre = String(d.get('nombre') ?? '').trim();
		const email = String(d.get('email') ?? '').trim().toLowerCase();
		const clave = String(d.get('clave') ?? '');
		const admin = d.get('admin') === 'sí';

		if (!nombre || !email) return fail(400, { error: 'Falta el nombre o el correo.' });
		if (clave.length < MINIMO) {
			return fail(400, { error: `La clave necesita al menos ${MINIMO} caracteres.` });
		}
		const yaEsta = await db.select({ id: s.usuario.id }).from(s.usuario).where(eq(s.usuario.email, email));
		if (yaEsta.length) return fail(400, { error: 'Ese correo ya está dado de alta.' });

		await db.insert(s.usuario).values({
			tenantId: yo.tenantId, nombre, email, clave: hashear(clave), admin
		});
		return { hecho: `${nombre} ya puede entrar.` };
	},

	clave: async ({ request, locals }) => {
		soloAdmin(locals);
		const d = await request.formData();
		const id = String(d.get('id') ?? '');
		const clave = String(d.get('clave') ?? '');
		if (clave.length < MINIMO) {
			return fail(400, { error: `La clave necesita al menos ${MINIMO} caracteres.` });
		}
		await db.update(s.usuario).set({ clave: hashear(clave) }).where(eq(s.usuario.id, id));
		// Cambiar la clave cierra las sesiones abiertas de esa persona.
		await db.delete(s.sesion).where(eq(s.sesion.usuarioId, id));
		return { hecho: 'Clave cambiada. Las sesiones abiertas se cerraron.' };
	},

	estado: async ({ request, locals }) => {
		const yo = soloAdmin(locals);
		const d = await request.formData();
		const id = String(d.get('id') ?? '');
		if (id === yo.id) return fail(400, { error: 'No te podés dar de baja a vos misma.' });
		const activa = d.get('activa') === 'sí';
		await db.update(s.usuario).set({ activa }).where(eq(s.usuario.id, id));
		if (!activa) await db.delete(s.sesion).where(eq(s.sesion.usuarioId, id));
		return { hecho: activa ? 'Vuelve a entrar.' : 'Ya no entra.' };
	}
};
