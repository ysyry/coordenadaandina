/**
 * Lo que comparten el constructor, la pantalla para contestar y la de respuestas.
 * Ver MODELO.md, capa 4.
 */
export const TIPOS = [
	{ id: 'corta', rotulo: 'Respuesta corta' },
	{ id: 'parrafo', rotulo: 'Párrafo' },
	{ id: 'una', rotulo: 'Una opción' },
	{ id: 'varias', rotulo: 'Varias opciones' },
	{ id: 'si', rotulo: 'Casilla (sí / no)' },
	{ id: 'numero', rotulo: 'Número' },
	{ id: 'semana', rotulo: 'Semana del cuatrimestre' }
] as const;

export const POR = [
	{ id: 'nada', rotulo: 'Una sola vez' },
	{ id: 'dictado', rotulo: 'Por cada materia y curso' },
	{ id: 'anio', rotulo: 'Por cada año' },
	{ id: 'unidad', rotulo: 'Por cada tema planificado' },
	{ id: 'vinculo', rotulo: 'Por cada cruce entre materias' },
	{ id: 'tramo', rotulo: 'Por cada nudo del cuatrimestre' }
] as const;

export const ALCANCE = [
	{ id: 'mios', rotulo: 'Los de cada una' },
	{ id: 'todos', rotulo: 'Todos los del área' }
] as const;

export const ESTADOS = {
	borrador: 'Borrador',
	abierta: 'Abierta',
	cerrada: 'Cerrada'
} as const;

export const conOpciones = (tipo: string) => tipo === 'una' || tipo === 'varias';
/** Las preguntas que se repiten y se contestan en una celda van en tabla. */
export const vaEnTabla = (p: { por: string; tipo: string }) =>
	p.por !== 'nada' && ['una', 'si', 'numero', 'semana', 'corta'].includes(p.tipo);

const CONCEPTOS: Record<string, string> = {
	perspectiva: 'Las Perspectivas',
	vinculo_area: 'Los vínculos de área',
	objetivo_area: 'Los objetivos del área',
	objetivo_disciplina: 'Los objetivos de cada disciplina',
	categoria: 'Las categorías del Ciclo Orientado',
	eje_institucional: 'Los ejes institucionales',
	criterio_evaluacion: 'Los criterios de evaluación'
};
export const rotuloConcepto = (tipo: string) => CONCEPTOS[tipo] ?? tipo;

export const rotuloOpcionesDe = (spec: string) =>
	spec === 'manual' ? 'Escritas a mano'
	: spec === 'usuaria' ? 'Las compañeras del área'
	: spec === 'puesto' ? 'Los puestos del área'
	: spec === 'nudo' ? 'Los nudos del diseño'
	: spec.startsWith('concepto:') ? rotuloConcepto(spec.slice(9))
	: spec;

/** Nombre del campo en el formulario: r~pregunta~sobreTipo~sobreId. `o~` es el «Otra». */
export const campo = (preguntaId: string, sobreTipo = '', sobreId = '') => `r~${preguntaId}~${sobreTipo}~${sobreId}`;
export const campoOtro = (preguntaId: string, sobreTipo = '', sobreId = '') => `o~${preguntaId}~${sobreTipo}~${sobreId}`;
export const leerCampo = (nombre: string) => {
	const [pre, preguntaId, sobreTipo = '', sobreId = ''] = nombre.split('~');
	return (pre === 'r' || pre === 'o') && preguntaId ? { otro: pre === 'o', preguntaId, sobreTipo, sobreId } : null;
};

/** El valor con que se marca «Otra» entre las opciones. */
export const OTRA = '__otra';

/** Separador de las opciones elegidas en `valor`. */
export const SEP = '\n';
