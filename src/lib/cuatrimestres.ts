/**
 * Ciclo lectivo 2026 · Res. CPE 1980/25 y Circular técnica 02/2026 de la escuela.
 * La circular fija el 1er cuatrimestre del lunes 09-03 al miércoles 08-07.
 */
export const CICLO = {
	anio: 2026,
	cuatrimestres: [
		{ n: 1, desde: '2026-03-09', hasta: '2026-07-08', nombre: 'Primer cuatrimestre' },
		{ n: 2, desde: '2026-08-04', hasta: '2026-11-27', nombre: 'Segundo cuatrimestre' }
	]
};

export const TIPOS = [
	{ id: 'actividad',  rot: 'Actividad',    afecta: false, color: 'violeta' },
	{ id: 'aviso',      rot: 'Aviso',        afecta: false, color: 'tenue' },
	{ id: 'entrega',    rot: 'Entrega',      afecta: false, color: 'inf' },
	{ id: 'acto',       rot: 'Acto escolar', afecta: true,  color: 'epa' },
	{ id: 'jornada',    rot: 'Jornada',      afecta: true,  color: 'epa' },
	{ id: 'feriado',    rot: 'Feriado',      afecta: true,  color: 'mat' },
	{ id: 'paro',       rot: 'Paro',         afecta: true,  color: 'mat' },
	{ id: 'suspension', rot: 'Suspensión',   afecta: true,  color: 'mat' },
	{ id: 'clima',      rot: 'Clima',        afecta: true,  color: 'mat' }
] as const;

export const rotulo = (id: string) => TIPOS.find((t) => t.id === id)?.rot ?? id;
export const colorDe = (id: string) => TIPOS.find((t) => t.id === id)?.color ?? 'tenue';
