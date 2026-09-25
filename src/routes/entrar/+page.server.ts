import { fail, redirect, type Actions, type ServerLoad } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import { randomBytes } from 'node:crypto';
import { COOKIE, abrirSesion, buscarUsuaria, hashear, hayUsuarias, verificar } from '$lib/server/sesion';

/**
 * Freno a la fuerza bruta: cinco intentos fallidos y después quince minutos de
 * espera. Vive en memoria; alcanza para un área de cinco personas.
 *
 * Hay dos contadores con topes distintos. El de cuenta es el fino: bloquea sólo
 * el correo que se está probando, así el resto sigue entrando. El de dirección
 * es alto y corta un barrido masivo; va alto porque detrás de un proxy todas las
 * visitas comparten dirección y un tope bajo dejaría afuera a toda la escuela.
 *
 * Para que la dirección sea la real y no la del proxy, en Railway van
 * ADDRESS_HEADER=x-forwarded-for y XFF_DEPTH=1. Ver DESPLIEGUE.md.
 */
const INTENTOS = new Map<string, { fallos: number; hasta: number; ultimo: number }>();
const TOPE_CUENTA = 5;
const TOPE_DIRECCION = 40;
const ESPERA = 15 * 60 * 1000;

/** Minutos que faltan para poder volver a probar, o 0 si no está frenado. */
function frenado(quien: string): number {
	const r = INTENTOS.get(quien);
	if (!r) return 0;
	if (r.hasta > Date.now()) return Math.ceil((r.hasta - Date.now()) / 60000);
	// El registro se olvida con la espera cumplida, o si pasó una espera entera
	// sin fallar. Mientras se acumulan fallos sin llegar al tope, se conserva.
	if (r.hasta || r.ultimo + ESPERA < Date.now()) INTENTOS.delete(quien);
	return 0;
}

function sumarFallo(quien: string, tope: number) {
	const r = INTENTOS.get(quien) ?? { fallos: 0, hasta: 0, ultimo: 0 };
	r.fallos += 1;
	r.ultimo = Date.now();
	if (r.fallos >= tope) {
		r.hasta = Date.now() + ESPERA;
		r.fallos = 0;
	}
	INTENTOS.set(quien, r);
}

/**
 * Un hash descartable contra el que verificar cuando el correo no existe: si no,
 * la respuesta vuelve al instante y se puede averiguar qué correos tienen cuenta
 * midiendo el tiempo. scrypt tarda lo mismo en los dos casos.
 */
const HASH_FALSO = hashear(randomBytes(24).toString('hex'));

export const load: ServerLoad = async ({ locals }) => {
	if (locals.usuario) throw redirect(303, '/');
	return { sinUsuarias: !(await hayUsuarias()) };
};

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const datos = await request.formData();
		const email = String(datos.get('email') ?? '').trim().toLowerCase();
		const clave = String(datos.get('clave') ?? '');

		const desde = `ip:${getClientAddress()}`;
		const cuenta = `mail:${email}`;
		const minutos = Math.max(frenado(desde), frenado(cuenta));
		if (minutos) {
			return fail(429, {
				email,
				error: `Demasiados intentos. Probá de nuevo en ${minutos} minuto${minutos > 1 ? 's' : ''}.`
			});
		}

		const usuaria = email ? await buscarUsuaria(email) : null;
		// Se verifica igual aunque no exista, para no revelar qué correos tienen cuenta.
		const entra = verificar(clave, usuaria?.clave ?? HASH_FALSO) && !!usuaria;

		if (!usuaria || !entra) {
			sumarFallo(desde, TOPE_DIRECCION);
			if (email) sumarFallo(cuenta, TOPE_CUENTA);
			return fail(401, { error: 'No coincide. Revisá el correo y la clave.', email });
		}

		INTENTOS.delete(desde);
		INTENTOS.delete(cuenta);
		const { token, expira } = await abrirSesion(usuaria.id);
		await db
			.update(schema.usuario)
			.set({ ultimoIngreso: new Date() })
			.where(eq(schema.usuario.id, usuaria.id));

		cookies.set(COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			expires: expira
		});

		const volver = url.searchParams.get('volver');
		const destino = volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : '/';
		throw redirect(303, destino);
	}
};
