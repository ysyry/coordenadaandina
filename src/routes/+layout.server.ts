import type { LayoutServerLoad } from './$types';

/** Quién está usando la app, para el menú. */
export const load: LayoutServerLoad = async ({ locals }) => ({ usuario: locals.usuario });
