import { redirect, type Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { COOKIE, quienEs, limpiarVencidas } from '$lib/server/sesion';

/**
 * Política de contenido. Deja entrar lo que la app usa de verdad:
 * las tipografías de Google y los documentos del recursero. Nada más.
 * Los scripts en línea son los que SvelteKit inyecta para hidratar.
 */
const POLITICA = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data:",
	"frame-src 'self' https:",
	"connect-src 'self'",
	"form-action 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'"
].join('; ');

/** Lo único que se puede ver sin haber entrado: la portada y el propio ingreso. */
const ABIERTO = ['/', '/entrar', '/salir'];

let ultimaLimpieza = 0;

/**
 * Puerta del área.
 *
 * Adentro hay horarios con nombre y apellido, acuerdos y planificaciones:
 * sin sesión no se ve nada. Las usuarias se crean desde la terminal
 * (`npm run usuaria`), no hay registro abierto.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Una sola dirección. `ORIGIN` es la raíz, así que un formulario enviado desde
	// `www` daría 403: antes de nada, se manda a la raíz. Se mira la cabecera `host`
	// y no `event.url`, porque con `ORIGIN` puesto adapter-node arma la URL a partir
	// de esa variable y ahí el `www` ya no aparece. El 308 conserva el método, así
	// que un POST que llegue a `www` también termina bien.
	if ((event.request.headers.get('host') ?? '').startsWith('www.')) {
		const raiz = new URL(event.url);
		if (raiz.hostname.startsWith('www.')) raiz.hostname = raiz.hostname.slice(4);
		throw redirect(308, raiz.toString());
	}

	const token = event.cookies.get(COOKIE);
	event.locals.usuario = await quienEs(token);

	if (!event.locals.usuario && !ABIERTO.includes(event.url.pathname)) {
		const volver = event.url.pathname + event.url.search;
		throw redirect(303, `/entrar?volver=${encodeURIComponent(volver)}`);
	}

	// Una barrida de sesiones vencidas por hora, no en cada visita.
	if (Date.now() - ultimaLimpieza > 60 * 60 * 1000) {
		ultimaLimpieza = Date.now();
		limpiarVencidas().catch(() => {});
	}

	const respuesta = await resolve(event);

	respuesta.headers.set('Content-Security-Policy', POLITICA);
	respuesta.headers.set('X-Content-Type-Options', 'nosniff');
	respuesta.headers.set('Referrer-Policy', 'same-origin');
	respuesta.headers.set('X-Frame-Options', 'DENY');
	respuesta.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	if (!dev) {
		respuesta.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return respuesta;
};
