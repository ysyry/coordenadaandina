import { redirect, type Actions } from '@sveltejs/kit';
import { COOKIE, cerrarSesion } from '$lib/server/sesion';

export const actions: Actions = {
	default: async ({ cookies }) => {
		await cerrarSesion(cookies.get(COOKIE));
		cookies.delete(COOKIE, { path: '/' });
		throw redirect(303, '/entrar');
	}
};
