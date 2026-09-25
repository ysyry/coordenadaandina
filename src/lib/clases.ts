import { CICLO } from './cuatrimestres';

/** Cuatrimestre corrido 1..10 → año escolar. El 6 es 3º año. */
export const anioDe = (c: number) => Math.ceil(c / 2);
/** Cuatrimestre corrido → mitad del año calendario, 1 o 2. */
export const mitadDe = (c: number) => (c % 2 === 1 ? 1 : 2);
/** Año escolar → sus dos cuatrimestres corridos. */
export const cuatrisDe = (anio: number) => [anio * 2 - 1, anio * 2];

export const ORDINAL: Record<number, string> = {
	1: 'primer', 2: 'segundo', 3: 'tercer', 4: 'cuarto', 5: 'quinto',
	6: 'sexto', 7: 'séptimo', 8: 'octavo', 9: 'noveno', 10: 'décimo'
};

const fmt = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const tramoDe = (c: number) => CICLO.cuatrimestres[mitadDe(c) - 1];

export interface EventoMin {
	fecha: string;
	hasta: string | null;
	afectaClases: boolean;
	cursoId: string | null;
}

/** Las fechas en que no hay clase, expandiendo los eventos de varios días. */
export function diasSinClase(eventos: EventoMin[], cursoId: string): Set<string> {
	const set = new Set<string>();
	for (const e of eventos) {
		if (!e.afectaClases) continue;
		if (e.cursoId && e.cursoId !== cursoId) continue;
		const d = new Date(e.fecha + 'T12:00:00');
		const fin = new Date((e.hasta ?? e.fecha) + 'T12:00:00');
		while (d <= fin) {
			set.add(fmt(d));
			d.setDate(d.getDate() + 1);
		}
	}
	return set;
}

/**
 * Cuántas veces cae cada día de la semana dentro del cuatrimestre, descontando
 * lo que el calendario marca como día sin clase. `dias` viene del horario:
 * un bloque por cada vez que la materia se junta en la semana.
 */
export function clasesReales(dias: number[], c: number, sinClase: Set<string>) {
	const tramo = tramoDe(c);
	const d = new Date(tramo.desde + 'T12:00:00');
	const fin = new Date(tramo.hasta + 'T12:00:00');
	let hay = 0;
	let perdidas = 0;
	while (d <= fin) {
		const cuantas = dias.filter((x) => x === d.getDay()).length;
		if (cuantas) (sinClase.has(fmt(d)) ? (perdidas += cuantas) : (hay += cuantas));
		d.setDate(d.getDate() + 1);
	}
	return { hay, perdidas, tramo };
}
