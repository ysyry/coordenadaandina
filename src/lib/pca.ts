export interface Componente {
	n: number;
	rot: string;
	ayuda: string;
	/** 'catalogo' = se completa solo desde el catálogo curricular. */
	auto?: 'catalogo';
	/** El 6 habla de estudiantes: sus datos no viven en Areal. */
	fuera?: boolean;
}

/** Los ocho componentes de la Planificación Curricular de Área · Res. 1381/22. */
export const COMPONENTES: Componente[] = [
	{ n: 1, rot: 'Fundamentos del Área',
	  ayuda: 'Qué entiende esta área por su objeto de conocimiento y desde qué perspectiva lo enseña.' },
	{ n: 2, rot: 'Núcleos de Área y Nudos Disciplinares',
	  ayuda: 'Sale del catálogo: no se escribe, se elige.', auto: 'catalogo' },
	{ n: 3, rot: 'Conocimientos y Saberes por ciclos',
	  ayuda: 'Sale del catálogo, ya transcripto de la resolución.', auto: 'catalogo' },
	{ n: 4, rot: 'Propósitos del Área',
	  ayuda: 'Qué se propone el área para este tramo. Se escribe entre todas.' },
	{ n: 5, rot: 'Construcción metodológica',
	  ayuda: 'El cómo. La resolución pide pasar de explicación-aplicación a problematización-conceptualización.' },
	{ n: 6, rot: 'Elaboración de los Informes de proceso',
	  ayuda: 'Cómo se organiza el área para hacer los informes. Los datos de estudiantes viven en el Drive de la escuela, no acá.',
	  fuera: true },
	{ n: 7, rot: 'Coordinación de Área',
	  ayuda: 'Reuniones periódicas, seguimiento, trabajo interárea y co-formación.' },
	{ n: 8, rot: 'Itinerario del Equipo de Área',
	  ayuda: 'Qué y cómo se va a enseñar: nudos secuenciados en el tiempo, EPA y formatos.' }
];

export interface ItemChecklist {
	clave: string;
	rot: string;
	/** Si está, la app contesta el ítem sola con lo que ya tiene cargado. */
	auto: 'pca' | 'reunion' | null;
	pide: 'enlace' | 'texto';
	detalle?: string;
	/** Datos de estudiantes: viven en el Drive de la escuela, no acá. */
	fueraDeLaApp?: boolean;
}

/** El checklist que pide la escuela. `auto` marca los que contesta la app. */
export const CHECKLIST: ItemChecklist[] = [
	{ clave: 'plan-anual', rot: 'La planificación anual de cada EPA/asignatura está en el Drive.',
	  auto: null, pide: 'enlace' },
	{ clave: 'pca', rot: 'La PCA está en el Drive.',
	  auto: 'pca', pide: 'enlace' },
	{ clave: 'criterios', rot: 'Los criterios de evaluación por año están definidos y se mantienen igual para el 2do tramo del año.',
	  auto: null, pide: 'texto' },
	{ clave: 'objetivos', rot: 'Los objetivos institucionales están incorporados a la planificación areal.',
	  detalle: 'Capacitación docente · Aprendizaje fuera del aula · Fortalecimiento del trabajo por área, por EPA y en proyecto · Clarificar roles y fortalecer el abordaje de situaciones complejas',
	  auto: null, pide: 'texto' },
	{ clave: 'reuniones', rot: 'Las reuniones por área están definidas y se mantienen igual (día, frecuencia, horario, duración) para el 2do tramo del año.',
	  auto: 'reunion', pide: 'texto' },
	{ clave: 'en-proceso', rot: 'Tenemos un listado de estudiantes que tienen contenidos o capacidades EN PROCESO de años anteriores.',
	  auto: null, pide: 'enlace', fueraDeLaApp: true },
	{ clave: 'fortalecimiento', rot: 'Tenemos una propuesta de fortalecimiento y recuperación para esos estudiantes.',
	  auto: null, pide: 'texto' }
];

export const DIAS = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes'];


/**
 * OJO: la escuela tiene DOS listas de objetivos para 2026, en dos documentos distintos.
 *  - El Mapa de Área los llama "objetivos institucionales 2026" (los de abajo).
 *  - La Circular técnica 01/2026 los llama "Ejes de trabajo 2026", y son otros cuatro.
 * El checklist institucional cita los de la Circular. Mostramos los dos y conviene
 * preguntar en la próxima reunión cuál rige.
 */
export const OBJETIVOS = [
	{ clave: 'menos-miramos', rot: 'Incluir en nuestras propuestas a los que menos miramos' },
	{ clave: 'conflictos',    rot: 'Mejorar la comunicación en la gestión de conflictos' },
	{ clave: 'familias',      rot: 'Involucrar más activamente a las familias' },
	{ clave: 'impacto',       rot: 'Generar proyectos con impacto social y que visibilicen lo que se hace, piensa, siente y cree en la Escuela' }
];

/** Ejes de trabajo 2026 · Circular técnica 01/2026. Son los que cita el checklist. */
export const EJES = [
	{ clave: 'capacitacion', rot: 'Generar más instancias sistemáticas de capacitación continua, priorizando la formación situada y la reflexión sobre la práctica' },
	{ clave: 'fuera-aula',   rot: 'Potenciar y diversificar las propuestas de aprendizaje fuera del aula, aprovechando el entorno natural y comunitario' },
	{ clave: 'interdisc',    rot: 'Fortalecer el trabajo interdisciplinario entre áreas, generando más espacios de encuentro para la planificación conjunta' },
	{ clave: 'roles',        rot: 'Clarificar roles y fortalecer la articulación y la comunicación pedagógica' }
];

/** Los campos del Mapa de Área, en el orden en que los pide la escuela. */
export const MAPA = [
	{ k: 'proposito', rot: 'Propósito o Desafío General',
	  ayuda: 'El para qué, el hacia dónde vamos como área.' },
	{ k: 'nucleos', rot: 'Núcleos Problemáticos',
	  ayuda: 'Los núcleos del Diseño Curricular que seleccionamos para enfocar en este período.' },
	{ k: 'saberes', rot: 'Saberes o Ejes Temáticos',
	  ayuda: 'El qué: los contenidos que queremos que adquieran en este período.' },
	{ k: 'perspectivas', rot: 'Vinculación con las Perspectivas', ayuda: '' },
	{ k: 'capacidades', rot: 'Capacidades',
	  ayuda: 'Planificación, resolución de problemas, comunicación, colaboración, pensamiento crítico.' },
	{ k: 'mapaProyecto', rot: 'Mapa del Proyecto',
	  ayuda: 'Por acá vamos a ir: los pasos del proyecto y sus tiempos. Si esto está armado, las clases se planifican solas.' },
	{ k: 'productoFinal', rot: 'Producto Final', ayuda: '' },
	{ k: 'productosIntermedios', rot: 'Productos Intermedios', ayuda: '' },
	{ k: 'revisionCritica', rot: 'Momentos de Revisión Crítica',
	  ayuda: 'En qué pasos vamos a hacer Revisión Crítica, con qué criterios, cuándo y cómo se los transmitimos, y con qué herramientas.' },
	{ k: 'criteriosInformes', rot: 'Criterios para los informes parciales y finales', ayuda: '' }
] as const;
