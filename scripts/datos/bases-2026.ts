/**
 * Bases del área · 2do cuatrimestre 2026, en el formato del constructor.
 *
 * Es la versión del 23/09/2026 de gestion/coordinacion/formulario-area-preguntas.md.
 * Lo que antes era especial ahora son preguntas enganchadas al modelo:
 *  - la planilla del nudo B son preguntas «por unidad» (los temas de marzo);
 *  - los cruces son una pregunta «por vínculo»;
 *  - «qué tres cosas traen / se llevan» se contesta por cada dictado;
 *  - perspectivas, vínculos de área, ejes y criterios salen de `concepto`.
 * El «¿qué das?» ya no se pregunta: sale de los dictados de cada una.
 */
export type PreguntaDef = {
	texto: string;
	ayuda?: string;
	tipo: 'corta' | 'parrafo' | 'una' | 'varias' | 'si' | 'numero' | 'semana';
	obligatoria?: boolean;
	clase?: 'objetivo' | 'subjetivo';
	por?: 'nada' | 'dictado' | 'anio' | 'tramo' | 'vinculo' | 'unidad';
	alcance?: 'mios' | 'todos';
	opcionesDe?: string;
	opciones?: string[];
	conOtra?: boolean;
	muestra?: string;
};
export type SeccionDef = { titulo: string; apunta: string; saber: string; preguntas: PreguntaDef[] };

export const CLAVE = 'bases-2026';
export const TITULO = 'Bases del área';
export const MOTIVACION =
	'En marzo escribimos, entre todas, qué íbamos a dar en cada año. Esto es para mirar eso de frente: qué se está cumpliendo, qué quedó afuera y por qué, y qué habría que cambiar.';

const O = 'objetivo' as const;
const S = 'subjetivo' as const;

export const SECCIONES: SeccionDef[] = [
	{
		titulo: 'A · Cuándo nos encontramos',
		apunta: 'PCA 7 · Coordinación de área',
		saber: 'Para acordar los encuentros del área.',
		preguntas: [
			{ texto: '¿Te sirve usar el recreo del jueves a las 10:50 para una puesta al día semanal de cinco minutos?', tipo: 'una', clase: S,
			  opciones: ['Sí', 'No', 'Algunas semanas', 'Ese día no estoy'] },
			{ texto: 'Para el encuentro mensual del área, ¿qué opción te queda mejor?', tipo: 'una', clase: S, obligatoria: true, conOtra: true,
			  opciones: ['Jueves a las 13:00, en la escuela', 'Videollamada de 40 minutos', 'Miércoles a las 9:35'] },
			{ texto: '¿Hay alguna franja horaria en la que no puedas?', tipo: 'corta', clase: O }
		]
	},
	{
		titulo: 'B · Lo que planificamos en los mapas de área',
		apunta: 'PCA 3 · Conocimientos y saberes · PCA 8 · Itinerario',
		saber: 'Estos son los temas de los mapas de área 2026 de tus cursos. Para cada uno, contame cómo viene.',
		preguntas: [
			{ texto: 'Estado', tipo: 'una', clase: O, por: 'unidad',
			  opciones: ['Dado completo', 'Dado en parte', 'Todavía no, pero lo voy a dar', 'No se va a dar este año', 'Lo reemplacé por otro tema'] },
			{ texto: 'Si no se dio, por qué', tipo: 'una', clase: O, por: 'unidad', conOtra: true,
			  opciones: ['Falta de tiempo', 'Faltaban conocimientos previos', 'Faltaron recursos', 'Lo desplazó el proyecto', 'El grupo no se enganchó', 'Prioricé otro tema'] },
			{ texto: 'Tiempo que llevó', tipo: 'una', clase: O, por: 'unidad',
			  opciones: ['Menos de lo previsto', 'Lo previsto', 'Más', 'Mucho más'] },
			{ texto: 'Cómo le fue al grupo', tipo: 'una', clase: O, por: 'unidad',
			  opciones: ['Lo aprendió', 'En parte', 'No lo aprendió', 'Todavía no sé'] },
			{ texto: 'Imprescindible para el año siguiente', tipo: 'si', clase: O, por: 'unidad', ayuda: 'Marcá hasta tres.' },
			{ texto: '¿Qué tema les costó más aprender? ¿En qué se traban?', tipo: 'parrafo', clase: S },
			{ texto: '¿Hay algún tema que quede pendiente todos los años?', tipo: 'parrafo', clase: S },
			{ texto: '¿Con qué tema se engancharon más? ¿Qué tenía de distinto?', tipo: 'parrafo', clase: S },
			{ texto: 'Si pudieras volver a dar un tema desde cero, ¿cuál sería y qué cambiarías?', tipo: 'parrafo', clase: S },
			{ texto: '¿Qué sacarías del programa de tu año? ¿Qué agregarías?', tipo: 'parrafo', clase: S },
			{ texto: '¿Qué te haría falta para poder dar lo que hoy queda afuera?', tipo: 'parrafo', clase: S,
			  ayuda: 'Tiempo, recursos, conocimientos previos, formación, trabajo con otra materia.' }
		]
	},
	{
		titulo: 'C · Perspectivas y vínculos de área',
		apunta: 'PCA 1 · Fundamentos',
		saber: 'Cómo aparecen en tus clases las Perspectivas y los vínculos de área del diseño curricular.',
		preguntas: [
			{ texto: '¿Qué Perspectivas trabajaste este cuatrimestre?', tipo: 'varias', clase: O, opcionesDe: 'concepto:perspectiva' },
			{ texto: '¿Qué vínculo de área predomina en tus clases?', tipo: 'una', clase: O, opcionesDe: 'concepto:vinculo_area' },
			{ texto: 'Contame una actividad en la que se vea la perspectiva que más trabajás.', tipo: 'parrafo', clase: S },
			{ texto: '¿Cuál te cuesta más incorporar? ¿Por qué?', tipo: 'parrafo', clase: S }
		]
	},
	{
		titulo: 'D · La secuencia entre años',
		apunta: 'PCA 8 · Itinerario del equipo de área',
		saber: 'Qué necesita traer un estudiante para empezar cada año y con qué se va. Con esto armamos la secuencia del ciclo.',
		preguntas: [
			{ texto: '¿Qué tres cosas necesita saber un estudiante para empezar tu año?', tipo: 'parrafo', clase: O, por: 'dictado', obligatoria: true },
			{ texto: '¿Qué tres cosas se lleva de tu año?', tipo: 'parrafo', clase: O, por: 'dictado', obligatoria: true },
			{ texto: '¿En qué semana trabajás cada uno de estos cruces?', tipo: 'semana', clase: O, por: 'vinculo',
			  ayuda: 'Número de semana, «ya lo di» o «no lo doy».' },
			{ texto: '¿Qué contenidos del año anterior te llegan flojos?', tipo: 'parrafo', clase: S, por: 'dictado' },
			{ texto: '¿Qué hito proponés para este cuatrimestre?', tipo: 'una', clase: S, conOtra: true,
			  opciones: ['La calibración del sensor en 3º, el 30/09, con Matemática', 'La maceta de 2º: en Matemática calculan el umbral y en Informática lo programan', 'El traspaso de datos de 3º a 4º', 'La propuesta articulada con corte evaluativo de 1º y 2º', 'El Paseo Don Jaime'] },
			{ texto: '¿Qué parte de ese hito podrías sostener con tus clases?', tipo: 'parrafo', clase: S },
			{ texto: '¿Con quién del área te gustaría trabajar algo este cuatrimestre?', tipo: 'varias', clase: S, opcionesDe: 'usuaria' },
			{ texto: '¿Sobre qué?', tipo: 'corta', clase: S }
		]
	},
	{
		titulo: 'E · Evaluación y acreditación',
		apunta: 'PCA 6 · Informes de proceso',
		saber: 'Revisión de los criterios de evaluación que escribimos en el mapa de área.',
		preguntas: [
			{ texto: '¿Seguís usando estos criterios de evaluación?', tipo: 'una', clase: O, obligatoria: true,
			  muestra: 'concepto:criterio_evaluacion', ayuda: 'Rúbrica: Ampliamente logrado · Logrado · En proceso.',
			  opciones: ['Sí, tal cual', 'Sí, con cambios', 'No los uso', 'No los conocía'] },
			{ texto: '¿Tenés escrita la planificación de este cuatrimestre?', tipo: 'una', clase: O,
			  opciones: ['Sí, completa', 'Sí, en parte', 'La tengo armada pero no escrita', 'No'] },
			{ texto: 'Link a la planificación, si está en el Drive', tipo: 'corta', clase: O },
			{ texto: '¿Qué tiene que tener hecho un estudiante para acreditar el cuatrimestre?', tipo: 'parrafo', clase: O },
			{ texto: '¿Usás los mismos criterios que en el primer cuatrimestre?', tipo: 'una', clase: O,
			  opciones: ['Sí', 'Con algunos cambios', 'Con muchos cambios', 'No lo recuerdo'] },
			{ texto: '¿Qué criterio refleja menos lo que pasa en el aula?', tipo: 'una', clase: S, opcionesDe: 'concepto:criterio_evaluacion' },
			{ texto: '¿Cómo lo cambiarías?', tipo: 'parrafo', clase: S },
			{ texto: '¿Agregarías algún criterio?', tipo: 'parrafo', clase: S,
			  ayuda: 'Por ejemplo, resolución de problemas no tiene uno propio.' }
		]
	},
	{
		titulo: 'F · Los estudiantes',
		apunta: 'PCA 6 · Trayectorias',
		saber: 'Sin nombres: sólo cantidades y cómo los estamos acompañando.',
		preguntas: [
			{ texto: '¿Tenés identificados a los estudiantes con contenidos en proceso de años anteriores?', tipo: 'una', clase: O,
			  opciones: ['Sí, los tengo anotados', 'Sí, pero no anotados', 'Más o menos', 'No'] },
			{ texto: 'Estudiantes con contenidos en proceso', tipo: 'numero', clase: O, por: 'dictado' },
			{ texto: 'Estudiantes con materias del área pendientes', tipo: 'numero', clase: O, por: 'dictado' },
			{ texto: 'Estudiantes con PPI', tipo: 'numero', clase: O, por: 'dictado' },
			{ texto: 'Sobre los estudiantes con PPI:', tipo: 'varias', clase: O,
			  opciones: ['Leí el PPI de cada uno', 'Tengo una adaptación escrita para mi materia', 'Hablé con la MAI este cuatrimestre', 'No sé quién es la MAI de alguno', 'Necesito ayuda con esto'] },
			{ texto: '¿Cómo acompañás hoy a quienes tienen contenidos en proceso?', tipo: 'parrafo', clase: S },
			{ texto: '¿Les pedís a los estudiantes que opinen sobre la materia? ¿Cómo?', tipo: 'parrafo', clase: S },
			{ texto: '¿Qué te preocupa de tus grupos este cuatrimestre?', tipo: 'parrafo', clase: S }
		]
	},
	{
		titulo: 'G · La escuela y el área',
		apunta: 'PCA 1 · Fundamentos · PCA 4 · Propósitos',
		saber: 'Los ejes de la escuela y lo que podemos mejorar como área.',
		preguntas: [
			{ texto: '¿Qué ejes institucionales de 2026 ya aparecen en tus clases?', tipo: 'varias', clase: O, opcionesDe: 'concepto:eje_institucional' },
			{ texto: 'Contame una situación concreta.', tipo: 'parrafo', clase: S },
			{ texto: '¿Hay algo que como área deberíamos dejar de hacer?', tipo: 'parrafo', clase: S },
			{ texto: '¿Qué te podría resolver la coordinación este mes?', tipo: 'corta', clase: S, obligatoria: true, ayuda: 'Una cosa concreta.' },
			{ texto: '¿Tenés materiales que le puedan servir a otra compañera?', tipo: 'parrafo', clase: S, ayuda: 'Alcanza con contar qué tenés.' }
		]
	},
	{
		titulo: 'H · El 2º FoCA',
		apunta: 'Foro Curricular Areal',
		saber: 'Para preparar lo que el área lleva al segundo Foro Curricular.',
		preguntas: [
			{ texto: '¿Participaste del FoCA de mayo?', tipo: 'una', clase: O, opciones: ['Sí, completo', 'En parte', 'No pude', 'No me enteré'] },
			{ texto: '¿Vas a poder participar del 2º FoCA?', tipo: 'una', clase: O,
			  opciones: ['Sí', 'Sí, si es en jornada institucional', 'Sólo si es en la escuela', 'Depende de la fecha', 'No puedo'] },
			{ texto: '¿Qué dinámicas te aportan más en una jornada así?', tipo: 'varias', clase: O,
			  opciones: [
				'Trabajo en grupos chicos, por área',
				'Trabajo entre áreas distintas',
				'Taller con algo escrito al final',
				'Puesta en común de lo que está haciendo cada una',
				'Lectura y discusión de un documento',
				'Alguien de afuera que venga a contar algo',
				'Plenario con todo el colegio'
			  ] },
			{ texto: '¿Qué te gustaría que pasara en el 2º FoCA? Sugerencias concretas.', tipo: 'parrafo', clase: S,
			  ayuda: 'Actividades, temas, invitados, formato. Lo que se te ocurra, aunque sea difícil de organizar.' },
			{ texto: '¿Cambió algo en tu práctica o en la escuela a partir de lo que el área pidió en mayo?', tipo: 'parrafo', clase: S },
			{ texto: '¿Hay algún tema o nudo del diseño que sobre, falte o esté mal ubicado en tu año?', tipo: 'parrafo', clase: S },
			{ texto: '¿Qué es lo más importante que el área tiene que llevar al 2º FoCA?', tipo: 'corta', clase: S }
		]
	}
];

/** Conceptos de la escuela que la encuesta necesita. */
export const EJES_2026 = [
	['capacitacion', 'Capacitación continua situada y reflexión sobre la práctica'],
	['fuera-del-aula', 'Aprendizaje fuera del aula, aprovechando el entorno natural y comunitario'],
	['interdisciplina', 'Trabajo interdisciplinario entre áreas'],
	['roles', 'Clarificar roles y fortalecer la articulación y la comunicación pedagógica']
] as const;

export const CRITERIOS_2026 = [
	['critico', 'Pensamiento crítico y ética digital', 'Analiza la tecnología que consume y produce; argumenta sobre ética, privacidad y soberanía digital.'],
	['argumentacion', 'Argumentación y lenguaje técnico', 'Justifica decisiones, usa el vocabulario de las dos disciplinas y explica la conexión entre un concepto matemático y la programación.'],
	['proceso', 'Proceso y autonomía', 'Documenta versiones, borradores, errores y cómo los resolvió; avanza con autonomía creciente.'],
	['compromiso', 'Compromiso con el trabajo propuesto', 'Completa tareas en tiempo, se involucra, aprovecha el tiempo de clase.'],
	['colaborativo', 'Trabajo colaborativo y trato', 'Trabaja en equipo, rota roles, da y recibe feedback, mantiene buen trato.']
] as const;
