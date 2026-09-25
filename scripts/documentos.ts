/**
 * Los documentos institucionales que Areal sirve en `/docs`.
 *
 *   npm run docs -- subir [carpeta]     (por defecto ./documentos)
 *   npm run docs -- lista
 *   npm run docs -- borrar <archivo>
 *
 * No se versionan: el GPS habla de protección de estudiantes y las circulares
 * son internas. Por eso viven en la base y no en el repositorio, y `/docs` los
 * entrega sólo a quien tiene la sesión abierta.
 *
 * Contra el servidor, desde tu máquina:
 *   DATABASE_URL="…la URL pública de Railway…" npm run docs -- subir
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, eq } from 'drizzle-orm';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import * as s from '../src/lib/server/db/schema';

const TENANT = '00000000-0000-4000-8000-000000000001';

const TIPOS: Record<string, string> = {
	'.pdf': 'application/pdf',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.m4a': 'audio/mp4',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg',
	'.mp4': 'video/mp4',
	'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'.txt': 'text/plain; charset=utf-8'
};

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql, { schema: s });

const pesar = (n: number) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} K` : `${(n / 1048576).toFixed(1)} M`);

const [accion, ...resto] = process.argv.slice(2);

try {
	if (accion === 'subir') {
		const carpeta = resolve(resto[0] ?? 'documentos');
		const nombres = (await readdir(carpeta)).filter((n) => !n.startsWith('.')).sort();
		if (!nombres.length) throw new Error(`No hay nada en ${carpeta}.`);
		for (const archivo of nombres) {
			const tipo = TIPOS[extname(archivo).toLowerCase()];
			if (!tipo) {
				console.log(`  salteado ${archivo} · no sé qué tipo de archivo es`);
				continue;
			}
			const contenido = await readFile(join(carpeta, archivo));
			await db
				.insert(s.documento)
				.values({ tenantId: TENANT, archivo, tipo, peso: contenido.length, contenido })
				.onConflictDoUpdate({
					target: [s.documento.tenantId, s.documento.archivo],
					set: { tipo, peso: contenido.length, contenido, subido: new Date() }
				});
			console.log(`  ok   ${archivo.padEnd(28)} ${pesar(contenido.length).padStart(7)}   ${tipo}`);
		}
	} else if (accion === 'lista') {
		const filas = await db
			.select({ archivo: s.documento.archivo, tipo: s.documento.tipo, peso: s.documento.peso, subido: s.documento.subido })
			.from(s.documento)
			.where(eq(s.documento.tenantId, TENANT));
		if (!filas.length) console.log('No hay documentos cargados. Corré: npm run docs -- subir');
		for (const d of filas.sort((a, b) => a.archivo.localeCompare(b.archivo))) {
			console.log(`  ${d.archivo.padEnd(28)} ${pesar(d.peso).padStart(7)}   ${d.subido.toLocaleDateString('es-AR')}`);
		}
	} else if (accion === 'borrar') {
		const archivo = resto[0];
		if (!archivo) throw new Error('Falta el nombre del archivo.');
		const r = await db
			.delete(s.documento)
			.where(and(eq(s.documento.tenantId, TENANT), eq(s.documento.archivo, archivo)))
			.returning({ archivo: s.documento.archivo });
		if (!r.length) throw new Error(`No estaba cargado ${archivo}.`);
		console.log(`${archivo} ya no está.`);
	} else {
		console.log('Usos: subir [carpeta] · lista · borrar <archivo>');
	}
} catch (e) {
	console.error(e instanceof Error ? e.message : e);
	process.exitCode = 1;
} finally {
	await sql.end();
}
