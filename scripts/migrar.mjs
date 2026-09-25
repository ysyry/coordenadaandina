/**
 * Aplica las migraciones pendientes usando sólo dependencias de producción.
 *
 * En local se usa `npm run db:migrate` (drizzle-kit). Acá no: drizzle-kit es
 * una dependencia de desarrollo y en el servidor puede no estar instalada.
 * Este script usa el migrador de drizzle-orm, que sí es de producción.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('Falta DATABASE_URL.');
	process.exit(1);
}

const cliente = postgres(url, { max: 1 });

try {
	await migrate(drizzle(cliente), { migrationsFolder: 'drizzle' });
	console.log('Migraciones al día.');
} catch (e) {
	console.error('No se pudieron aplicar las migraciones:', e);
	process.exit(1);
} finally {
	await cliente.end();
}
