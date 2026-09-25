import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import type { RequestHandler } from './$types';

/**
 * Los documentos institucionales, uno por uno.
 *
 * No están en `static/` a propósito: ahí los entregaría el servidor de archivos
 * antes de que corra el hook, y cualquiera con la dirección podría bajarlos. El
 * GPS habla de protección de estudiantes y las circulares son internas, así que
 * pasan por la misma puerta que el resto de la app.
 */
export const GET: RequestHandler = async ({ params, locals, request }) => {
	const yo = locals.usuario;
	if (!yo) error(401, 'Hay que entrar.');

	const [doc] = await db
		.select()
		.from(schema.documento)
		.where(
			and(eq(schema.documento.tenantId, yo.tenantId), eq(schema.documento.archivo, params.archivo))
		)
		.limit(1);
	if (!doc) error(404, 'Ese documento no está cargado.');

	const cuerpo = Buffer.from(doc.contenido);
	const cabeceras: Record<string, string> = {
		'content-type': doc.tipo,
		'content-disposition': `inline; filename="${doc.archivo}"`,
		'accept-ranges': 'bytes',
		// Privado: que lo guarde el navegador de quien entró, nunca un intermediario.
		'cache-control': 'private, max-age=3600'
	};

	// Sin entregar pedazos, el audio no se reproduce en iPhone.
	const rango = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
	if (rango) {
		const desde = rango[1] ? Number(rango[1]) : 0;
		const hasta = rango[2] ? Math.min(Number(rango[2]), cuerpo.length - 1) : cuerpo.length - 1;
		if (desde > hasta || desde >= cuerpo.length) {
			return new Response(null, {
				status: 416,
				headers: { 'content-range': `bytes */${cuerpo.length}` }
			});
		}
		const pedazo = cuerpo.subarray(desde, hasta + 1);
		return new Response(pedazo, {
			status: 206,
			headers: {
				...cabeceras,
				'content-range': `bytes ${desde}-${hasta}/${cuerpo.length}`,
				'content-length': String(pedazo.length)
			}
		});
	}

	return new Response(cuerpo, {
		headers: { ...cabeceras, 'content-length': String(cuerpo.length) }
	});
};
