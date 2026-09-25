import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('Falta DATABASE_URL. Copiá .env.example a .env');

const cliente = postgres(env.DATABASE_URL, { max: 10 });

export const db = drizzle(cliente, { schema });
export { schema };
