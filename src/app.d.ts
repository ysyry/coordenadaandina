declare global {
	namespace App {
		interface Locals {
			/** Quién está usando la app, o null si todavía no entró. */
			usuario: {
				id: string;
				nombre: string;
				email: string;
				tenantId: string;
				docenteId: string | null;
				admin: boolean;
			} | null;
		}
	}
}

export {};
