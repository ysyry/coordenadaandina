/**
 * El marco prescripto por la Res. 1463/18 · Área Matemática e Informática.
 *
 * Esto no es dato de la escuela: es texto normativo. No cambia por escuela, ni
 * por año, ni por docente. Las páginas leen el texto largo de acá; lo que se
 * elige o se cruza (perspectivas, vínculos de área, objetivos, categorías) se
 * copia a la tabla `concepto` con `npm run db:estructura`, con la clave de acá
 * como código. Ver MODELO.md.
 *
 * Transcripción del documento «Los nudos del área». Las comillas angulares
 * marcan cita textual de la resolución.
 */

/* ── Las cinco Perspectivas ─────────────────────────────────────────────
   Están antes que los nudos en la estructura del diseño. No son un prólogo:
   definen políticas y organizan contenidos. */

export const PERSPECTIVAS_QUE_SON =
	'«Enfoques filosóficos, epistémicos, pedagógicos y didácticos que otorgan ' +
	'direccionalidad a los procesos de enseñanza y de aprendizaje y configuran la ' +
	'experiencia escolar. Definen políticas que organizan contenidos, otorgan sentidos ' +
	'culturales a las relaciones pedagógicas, e instituyen modos de gobierno y ' +
	'organización escolar. Implican formas de ser y estar en la escuela secundaria.»';

export const PERSPECTIVAS = [
	{
		clave: 'ddhh',
		rot: 'Derechos Humanos',
		pie: 'en clave decolonial',
		texto:
			'La norma critica la epistemología binaria que trajo la conquista imperial ' +
			'—naturaleza/sociedad, cuerpo/mente, colectividad/individuo, masculino/femenino, ' +
			'sujeto/objeto— por haber destruido la idea de que cada persona es un todo ' +
			'bio-físico-cultural integrado. Implica incorporar los derechos de la naturaleza y ' +
			'concebir el planeta «como algo que se hereda de las generaciones futuras».'
	},
	{
		clave: 'genero',
		rot: 'Género',
		pie: 'ESI y sus cinco ejes',
		texto:
			'Se apoya en la Educación Sexual Integral y sus cinco ejes, que la norma presenta ' +
			'«en estrecha imbricación, de tal manera que no puede concebirse uno sin los otros»: ' +
			'reconocer la perspectiva de género, ejercer los derechos, cuidar el cuerpo y la salud, ' +
			'valorar la afectividad y respetar la diversidad. La norma es explícita: formarse para ' +
			'educar en sexualidades es responsabilidad docente, no de las familias.'
	},
	{
		clave: 'intercultural',
		rot: 'Interculturalidad',
		pie: 'en su versión crítica',
		texto:
			'No en la de tolerancia. La norma rechaza expresamente la retórica que «promueve el ' +
			'respeto y la tolerancia pero en realidad mantiene la diferencia colonial», y también ' +
			'los nativismos esencialistas. La define como «un giro epistémico» y como «proyecto ' +
			'político contrahegemónico al orden capitalista y colonial».'
	},
	{
		clave: 'ambiental',
		rot: 'Ambiental',
		pie: 'con óptica social',
		texto:
			'No se reduce a estudiar la degradación del ambiente y su impacto. Abarca «una gran ' +
			'amplitud focal, determinada y contextualizada, desde una óptica social». La ' +
			'biodiversidad incluye especies, variabilidad genética y ecosistemas, junto con las ' +
			'cosmovisiones de los pueblos originarios.'
	},
	{
		clave: 'inclusion',
		rot: 'Inclusión Educativa',
		pie: 'democratización y justicia curricular',
		texto:
			'Desde los principios de democratización y justicia curricular. Incluye explícitamente ' +
			'el reconocimiento de derechos de colectivos históricamente excluidos.'
	}
] as const;

/** Dónde aparecen concretamente en el trabajo del área. */
export const PERSPECTIVAS_DONDE =
	'En los núcleos problemáticos —«en el desarrollo de cada núcleo se refleja el modo de ' +
	'abordar los fundamentos de las diferentes Perspectivas»— y en el EPA, que pide una ' +
	'temática con relevancia ambiental o social más allá de lo disciplinar.';

/** En el Ciclo Orientado las Perspectivas se traducen en estas Categorías. */
export const CATEGORIAS_ORIENTADO = [
	'saber/poder', 'capitalismo', 'soberanía tecnológica',
	'etnomatemática', 'identidad', 'alteridad'
];

/* ── Los cuatro vínculos de área ────────────────────────────────────────
   «Vínculos que dan lugar a la articulación entre Matemática e Informática
   para la conformación de esta área». Atraviesan los seis cuatrimestres.
   OJO: no son los cruces del mapa. Los cruces son lectura nuestra; estos
   cuatro son texto normativo. */

export const VINCULOS_AREA = [
	{
		n: 1,
		clave: 'problemas',
		rot: 'La resolución de problemas',
		resumen: 'La actividad del área se concibe como modelización',
		texto:
			'El núcleo común: recortar una problemática, identificar variables, producir ' +
			'relaciones entre ellas y transformarlas con un sistema teórico para producir ' +
			'conocimiento nuevo. Cita a Sadovsky: «Reconocer una problemática, elegir una teoría ' +
			'para tratarla y producir conocimientos nuevos sobre la problemática son tres ' +
			'aspectos esenciales del proceso de modelización».'
	},
	{
		n: 2,
		clave: 'registros',
		rot: 'Diferentes registros de representación',
		resumen: 'Cada representación enfatiza una propiedad y oculta otras',
		texto:
			'Los objetos del área son abstractos —salvo el hardware— y se construyen a través de ' +
			'representaciones, así que hace falta más de una. En Matemática: el registro gráfico ' +
			'de una función, el de la tabla, el algebraico, el sintáctico de un graficador. En ' +
			'Informática: un algoritmo como pseudocódigo, como diagrama de flujo, o en la ' +
			'sintaxis de un lenguaje.'
	},
	{
		n: 3,
		clave: 'argumentacion',
		rot: 'Reflexión y argumentación',
		resumen: 'La legitimidad está en argumentar, no en que el resultado dé bien',
		texto:
			'Explorar caminos, buscar herramientas, tomar decisiones y formular conjeturas. Todo ' +
			'eso encuentra su legitimidad en la argumentación y en la reflexión sobre lo hecho y ' +
			'lo elegido. Es el vínculo que justifica evaluar por explicación oral y por bitácora, ' +
			'y no sólo por producto.'
	},
	{
		n: 4,
		clave: 'complementariedad',
		rot: 'Complementariedad',
		resumen: 'Las dos se retroalimentan, en direcciones distintas',
		texto:
			'Informática usa conocimientos matemáticos para explicar conceptos propios. ' +
			'Matemática se apoya en aplicaciones para resolver situaciones, y gana ' +
			'retroalimentación inmediata para formular conjeturas.'
	}
] as const;

/** El filtro que dan los cuatro vínculos para descartar cruces decorativos. */
export const VINCULOS_FILTRO =
	'La investigación llama «integración superficial» a usar la herramienta para visualizar y ' +
	'no para modelizar. Un cruce que no se apoye en al menos uno de los cuatro vínculos ' +
	'probablemente sea decorativo.';

/* ── Los objetivos de aprendizaje ───────────────────────────────────────
   Res. 1463/18. Los cinco primeros son comunes a las dos disciplinas, y
   son los criterios compartidos del área: no hay que inventarlos. */

export const OBJETIVOS_AREA = [
	{ n: 1, texto: 'Construir nuevos conocimientos en un contexto de producción colectiva',
	  mira: 'Si el trabajo con otros produce conocimiento, o sólo reparte tareas' },
	{ n: 2, texto: 'Utilizar conocimientos disciplinares para resolver problemas desafiantes y relevantes',
	  mira: 'Si el problema valía la pena, no sólo si lo resolvió' },
	{ n: 3, texto: 'Desarrollar procesos de exploración, justificación, conjeturación y planteo de preguntas',
	  mira: 'Si además de responder, pregunta' },
	{ n: 4, texto: 'Fundamentar el uso de las diferentes formas de representación en relación a la situación en que se utilizan',
	  mira: 'Si elige tabla, gráfico, fórmula, diagrama o código con criterio' },
	{ n: 5, texto: 'Desarrollar prácticas argumentativas como medio para construir y ejercer el poder que otorga el conocimiento',
	  mira: 'Si puede sostener lo que hizo frente a otro' }
] as const;

export const OBJETIVOS_AREA_NOTA =
	'Los cinco valen igual para las dos disciplinas. No hay que inventar criterios compartidos ' +
	'para la Revisión Crítica del área: estos son. Y el número 4 es directamente el vínculo de ' +
	'área de los registros de representación, convertido en algo observable.';

export const OBJETIVOS_DISCIPLINA: Record<string, string[]> = {
	informatica: [
		'Construir conocimientos de informática basados en los fundamentos de las Ciencias de la Computación',
		'Identificar y valorar el rol de la Informática y sus áreas de aplicación en los diferentes campos del saber, incorporando los aspectos epistemológicos de las Ciencias de la Computación',
		'Identificar problemas y desarrollar soluciones que se puedan resolver computacionalmente',
		'Resolver problemas mediante el planteo de los posibles caminos de solución, y el diseño de algoritmos orientados a un paradigma de programación procedural',
		'Analizar críticamente las implicancias económicas, sociales, culturales, éticas y políticas relacionadas con el desarrollo de la Informática'
	],
	matematica: [
		'Ejercer el pensamiento crítico para poner en duda los conocimientos considerados verdaderos',
		'Construir prácticas de empoderamiento problematizando su propio proceso de construcción de conocimientos',
		'Analizar la razonabilidad de los resultados obtenidos',
		'Valorar la interacción entre pares no sólo para clarificar ideas, sino para acceder a nuevos conocimientos que surgen de la confrontación',
		'Resolver situaciones donde la modelización matemática sea instrumento para problemas de la propia disciplina o de la realidad social',
		'Resolver problemas identificando y designando las variables que caracterizan al sistema a modelizar, y estableciendo relaciones entre ellas',
		'Caracterizar los modelos estudiados por su pertinencia, estableciendo similitudes y diferencias'
	]
};

/** El EPA repite cuatro de los cinco del área, con dos cambios. */
export const OBJETIVOS_EPA_DIFERENCIAS = [
	'Donde el área dice «conocimientos disciplinares», el EPA dice «conocimientos del área»',
	'No incluye el objetivo 4, el de fundamentar las formas de representación'
];

/** Objetivos y propósitos no son lo mismo, y en la planificación van los dos. */
export const OBJETIVOS_VS_PROPOSITOS =
	'Los objetivos de aprendizaje están en la Res. 1463/18 y describen lo que el estudiantado ' +
	'desarrolla. Los propósitos son el componente 4 de la Planificación de Área y se enuncian ' +
	'desde el compromiso del profesorado: qué se va a favorecer.';

/* ── Cómo hay que enseñar, no sólo qué ──────────────────────────────── */

export const ENFOQUE: Record<string, { intro: string; puntos: string[] }> = {
	informatica: {
		intro:
			'El diseño desplaza explícitamente el planteo instrumentalista de las TIC —aprender a ' +
			'usar programas— hacia los fundamentos de las Ciencias de la Computación. Y lo ' +
			'argumenta con Dijkstra: «La computación trata tanto de computadoras como la ' +
			'astronomía trata sobre telescopios.»',
		puntos: [
			'Resolución de problemas como eje transversal. Los conceptos deben surgir del trabajo de resolver problemas, por exploración y descubrimiento — no darse primero y aplicarse después',
			'Pensamiento computacional: descomposición, diseño de algoritmos, abstracción, análisis de procesos y datos, razonamiento lógico',
			'Actividades desenchufadas antes de llevar el tema a la computadora, y trabajo colaborativo',
			'Filosofía del software libre atravesando toda la disciplina, en clave decolonial y emancipadora',
			'Paradigma procedural para el diseño de algoritmos'
		]
	},
	matematica: {
		intro:
			'La enseñanza se organiza a partir de la actividad de modelización, que «debe formar ' +
			'parte de cualquier proceso de su estudio».',
		puntos: [
			'En lo geométrico: la tensión entre el objeto real y el objeto teórico. El dibujo es una representación del objeto, no el objeto. Los problemas de construcción son el motor de la conjetura y la validación',
			'El análisis de invariancias —qué se mantiene bajo ciertas condiciones— como aspecto característico del hacer matemático, que fundamenta la generalización',
			'Validar una afirmación es parte de construir conocimiento: argumentar a partir de las propiedades produce conocimiento nuevo sobre ellas',
			'Trascender lo puramente perceptivo: que el estudiantado disponga de propiedades para argumentar, y no de lo que se ve o se mide en el dibujo',
			'En el Ciclo Orientado suma una perspectiva explícita: decolonial, emancipadora e intercultural, con la etnomatemática como eje'
		]
	}
};

/* ── Qué prescribe sobre evaluación ─────────────────────────────────── */

export const EVALUACION = {
	intro:
		'El proceso debe ser continuo, dinámico, constructivo y formativo, y el diseño dice ' +
		'textualmente que «trasciende la evaluación escrita».',
	observa: [
		'comprensión', 'argumentación', 'reflexión', 'creatividad', 'trabajo colaborativo',
		'fundamentación de decisiones', 'comunicación oral y escrita'
	],
	consecuencia:
		'Una rúbrica sobre un producto grupal, una bitácora sostenida o un checkpoint oral ' +
		'—«explicame estas tres líneas»— están más alineados al diseño que una prueba escrita. ' +
		'El vínculo de área número 3, reflexión y argumentación, lo respalda.'
};

/* ── El EPA, en las palabras de la norma ────────────────────────────── */

export const EPA_NORMA = {
	formato:
		'«El formato de este espacio interdisciplinario tiene una modalidad de taller en el cual ' +
		'se impulsa el desarrollo de proyectos que aúnan problemáticas de ambas disciplinas.»',
	contenidos:
		'Los contenidos del EPA no están fijados. Quedan sujetos a las problemáticas que acuerde ' +
		'cada colectivo docente; los nudos de cada disciplina son el marco del que se seleccionan.',
	exige: [
		'Tareas conjuntas desde el inicio: discutir ideas y estrategias, evaluar avances, relevar dificultades, reformular caminos',
		'Formulación de conjeturas y comprensión de la provisionalidad del conocimiento',
		'Modelos científicos como mediadores entre teoría y experimentación',
		'Una temática transversal más allá de lo disciplinar, con relevancia ambiental o social',
		'Que el aporte de cada disciplina implique conocimientos nuevos o profundización de los ya adquiridos',
		'Se considera tan relevante el proceso como el producto'
	]
};
