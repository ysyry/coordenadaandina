/**
 * Lo que el área planificó para 2026, tomado de los mapas de área que están en el Drive
 * de la escuela. El título y los contenidos son el texto del mapa, tal cual.
 *
 * Lo que NO dice el mapa y es lectura nuestra, para poder cruzarlo con el diseño:
 *  - `nudos`: ningún mapa asigna nudos por tema;
 *  - `c`: el cuatrimestre corrido. Ningún mapa ubica cada tema en el tiempo. En 2º sale del
 *    mapa del proyecto (ABP 1 en el 1er cuatrimestre, ABP 2 en el 2do); en 1º, de las
 *    menciones a trimestres de la revisión crítica; en 3º y 4º, del tramo del diseño.
 * El área lo corrige en /planificaciones.
 *
 * 3º Informática (Programación y Diseño) no tiene temas: el mapa de 3º del Drive sólo trae
 * Matemática.
 */
export type TemaMarzo = {
	id: string;
	anio: number;
	materia: 'Matemática' | 'Informática';
	rama?: 'Programación' | 'Diseño';
	c: number;
	nudos: string[];
	tema: string;
	contenidos: string;
};

export const MAPAS: Record<number, { titulo: string; url: string }> = {
	1: { titulo: 'Mapa de área - 1° Matemática e Informática 2026', url: 'https://drive.google.com/file/d/14Aq0h0QGAHVbOhve4rKqWrPtqwlq2NDD/view' },
	2: { titulo: 'Mapa de área - 2° año Matemática e Informática 2026', url: 'https://drive.google.com/file/d/1BUhrHWolup6pqIDeY5lV8Wp6v6-YgI95/view' },
	3: { titulo: 'Mapa de área - 3° año Matemática + Informática', url: 'https://docs.google.com/document/d/1acoH-64MusEYkgBvHT_FSft-_gcqkj18/edit' },
	4: { titulo: 'Mapa del área - 4to año Informática y Matemática', url: 'https://docs.google.com/document/d/1ejCg-P1FFYBwh4NAdvb7P9mWT9We4G7j/edit' }
};

export const TEMAS_MARZO: TemaMarzo[] = [
	/* ── 1º año ── */
	{ id: 'm1-u0', anio: 1, materia: 'Matemática', c: 1, nudos: ['MAT-NUM', 'MAT-GEO'], tema: 'Unidad 0: Revisión',
	  contenidos: 'Números naturales: las 4 operaciones básicas. Conocimientos de geometría básica. Estrategias y planteos para la resolución de problemas.' },
	{ id: 'm1-u1', anio: 1, materia: 'Matemática', c: 1, nudos: ['MAT-NUM'], tema: 'Unidad 1: Números enteros',
	  contenidos: 'Operaciones con enteros. Recta numérica, orden y valor absoluto. Regla de los signos para producto y cociente entre números. Propiedad distributiva de la multiplicación y división. Operaciones combinadas. Potenciación de números enteros. Propiedades de la potenciación. Radicación de números enteros. Operaciones combinadas.' },
	{ id: 'm1-u2', anio: 1, materia: 'Matemática', c: 1, nudos: ['MAT-ALG'], tema: 'Unidad 2: Ecuaciones',
	  contenidos: 'Lenguaje simbólico. Resolución de ecuaciones con una variable. Propiedad distributiva en ecuaciones. Inecuaciones de primer grado con una incógnita. Expresión de las soluciones en la recta numérica e intervalos.' },
	{ id: 'm1-u3', anio: 1, materia: 'Matemática', c: 2, nudos: ['MAT-GEO'], tema: 'Unidad 3: Figuras en el plano',
	  contenidos: 'Perímetros y áreas de figuras planas. Magnitudes. Equivalencias.' },
	{ id: 'i1-u0', anio: 1, materia: 'Informática', c: 1, nudos: ['INF-A'], tema: 'U0: Primeras ideas, primeros programas',
	  contenidos: 'Pensamiento computacional y primer contacto con la programación a través de Scratch. Algoritmos, eventos, movimiento, coordenadas, condicionales, loops y variables, todo descubierto por necesidad de los proyectos. Los conceptos de variable y coordenada dialogan con las Unidades 2 y 3 de Matemática.' },
	{ id: 'i1-u1', anio: 1, materia: 'Informática', c: 2, nudos: ['INF-D', 'INF-B', 'INF-H'], tema: 'UI: La tecnología por dentro y por fuera',
	  contenidos: 'Criptografía básica (cifrado César) y seguridad digital, huella digital y ciudadanía digital. Arquitectura básica de la computadora, sistema binario, electrónica y primeros circuitos. Filosofía del software libre como experiencia concreta a través de maquetas modificables. El sistema binario dialoga con la potenciación de enteros y el cifrado con las operaciones entre enteros de la Unidad 1 de Matemática.' },
	{ id: 'i1-u2', anio: 1, materia: 'Informática', c: 2, nudos: ['INF-A', 'INF-F'], tema: 'UII: Proyectos colectivos',
	  contenidos: 'Proyecto integrador Paseo Don Jaime: cada equipo produce un proyecto propio vinculado a Villa La Angostura, e integra en él todo lo aprendido durante el año. Se presenta en la feria de emprendimientos de la escuela.' },

	/* ── 2º año ── */
	{ id: 'm2-u1', anio: 2, materia: 'Matemática', c: 3, nudos: ['MAT-ALG'], tema: 'Unidad 1: Repaso',
	  contenidos: 'Despeje de Ecuaciones Lineales con números Enteros. Aplicación Propiedad Distributiva. Inecuaciones. Recta Numérica. Intervalos solución.' },
	{ id: 'm2-u2', anio: 2, materia: 'Matemática', c: 3, nudos: ['MAT-NUM'], tema: 'Unidad 2: Números racionales',
	  contenidos: 'Número racional: concepto: Fracciones. Fracciones Equivalentes y Fracciones Decimales. Representación gráfica de los números racionales. Expresiones decimales exactas y periódicas. Aproximación por redondeo. Fracción y porcentaje. Porcentajes aplicados a interés y descuento. Operaciones básicas con Racionales. Suma y Resta de Racionales. Multiplicación y división. Simplificación. Potenciación. Propiedades. Potencia con exponente negativo. Radicación con radicando racional. Propiedades. Operaciones Combinadas con decimales con las 6 operaciones.' },
	{ id: 'm2-u3', anio: 2, materia: 'Matemática', c: 3, nudos: ['MAT-ALG'], tema: 'Unidad 3: Ecuaciones e inecuaciones con Números racionales',
	  contenidos: 'Ecuaciones e inecuaciones. Ecuaciones de primer grado con una incógnita y con denominadores. Planteo y resolución de problemas. Inecuaciones de primer grado con una incógnita. Expresión de las soluciones en la recta numérica e intervalos.' },
	{ id: 'm2-u4', anio: 2, materia: 'Matemática', c: 4, nudos: ['MAT-GEO'], tema: 'Unidad 4: Ángulos y Triángulos',
	  contenidos: 'Ángulos: Sistema sexagesimal. Clasificación de los ángulos. Ángulos complementarios y suplementarios. Ángulos adyacentes y opuestos por el vértice. Ángulos determinados por dos rectas paralelas y una transversal. Ángulos entre rectas paralelas. Triángulos: Definición y Clasificación. Ángulos interiores y exteriores. Propiedades. Triángulo Rectángulo.' },
	{ id: 'i2-01', anio: 2, materia: 'Informática', c: 3, nudos: ['INF-F'], tema: 'Diseño de videojuegos',
	  contenidos: 'GDD (Game Design Document), game loop, mecánicas, feedback, curva de dificultad' },
	{ id: 'i2-02', anio: 2, materia: 'Informática', c: 3, nudos: ['INF-F'], tema: 'Ingeniería de software',
	  contenidos: 'Descomposición de problemas, prototipado, desarrollo iterativo, playtesting.' },
	{ id: 'i2-03', anio: 2, materia: 'Informática', c: 3, nudos: ['INF-A'], tema: 'Programación en Scratch',
	  contenidos: 'Variables, condicionales, loops, clones, funciones, modularización.' },
	{ id: 'i2-04', anio: 2, materia: 'Informática', c: 3, nudos: ['INF-D'], tema: 'Ética en videojuegos',
	  contenidos: 'Dark patterns, adicción por diseño, soberanía digital.' },
	{ id: 'i2-05', anio: 2, materia: 'Informática', c: 3, nudos: ['INF-D'], tema: 'Privacidad, ciudadanía digital, huella digital',
	  contenidos: '' },
	{ id: 'i2-06', anio: 2, materia: 'Informática', c: 3, nudos: ['INF-H'], tema: 'Software libre',
	  contenidos: 'Filosofía, las 4 libertades, licencias.' },
	{ id: 'i2-07', anio: 2, materia: 'Informática', c: 4, nudos: ['INF-B'], tema: 'Arquitectura de computadoras',
	  contenidos: 'Componentes, CPU, memoria, sistema binario' },
	{ id: 'i2-08', anio: 2, materia: 'Informática', c: 4, nudos: ['INF-C'], tema: 'Redes e internet',
	  contenidos: 'Cómo viaja la información.' },
	{ id: 'i2-09', anio: 2, materia: 'Informática', c: 4, nudos: ['INF-G'], tema: 'Inteligencia artificial',
	  contenidos: 'Aprendizaje automático, Teachable Machine, entrenamiento de modelos, sesgo, ética.' },
	{ id: 'i2-10', anio: 2, materia: 'Informática', c: 4, nudos: ['INF-A'], tema: 'Electrónica y computación física',
	  contenidos: 'Sensores, actuadores, micro:bit/Arduino (según disponibilidad), conexión hardware-software.' },
	{ id: 'i2-11', anio: 2, materia: 'Informática', c: 4, nudos: ['INF-F'], tema: 'Diseño de experiencias interactivas',
	  contenidos: 'Diseño centrado en el usuario, prototipado físico, iteración con público real.' },

	/* ── 3º año ── */
	{ id: 'm3-u1', anio: 3, materia: 'Matemática', c: 5, nudos: ['MAT-ALG', 'MAT-GEO'], tema: 'Unidad 1: Función lineal y Sistemas de Funciones Lineales',
	  contenidos: 'Sistema de ejes coordenados. Pares ordenados. Concepto de función. Características: dominio, imagen, crecimiento. Puntos notables. Función lineal: pendiente y ordenada. Raíz. Grafica con tabla de valores y con puntos esenciales. Sistemas de ecuaciones lineales. Resolución analítica y gráfica. Clasificación de sistemas de ecuaciones lineales. Ecuación de rectas paralelas y perpendiculares. Ecuación de la recta que pasa por dos puntos. Distancia entre dos puntos.' },
	{ id: 'm3-u2', anio: 3, materia: 'Matemática', c: 5, nudos: ['MAT-ALG'], tema: 'Unidad 2: Función cuadrática',
	  contenidos: 'Función cuadrática (Función Polinómica de Grado 2). Características de la parábola y su representación. Desplazamientos en los ejes cartesianos. Análisis de función, Variables. Dominio e imagen. Crecimiento. Máximos y mínimos. Conjuntos de positividad, negatividad y ceros. Pasaje de la forma polinómica a la canónica y viceversa.' },
	{ id: 'm3-u3', anio: 3, materia: 'Matemática', c: 6, nudos: ['MAT-ALG'], tema: 'Unidad 3: Sistemas Mixtos y otras Funciones',
	  contenidos: 'Función Lineal y Cuadrática. Resolución Gráfica. Interpretación de resultados. Aplicación en distintas problemáticas. Ejemplos y análisis de otro tipo de funciones: cúbica; Inversa.' },

	/* ── 4º año ── */
	{ id: 'm4-trig', anio: 4, materia: 'Matemática', c: 7, nudos: ['MAT-GEO'], tema: 'Trigonometría', contenidos: '' },
	{ id: 'm4-pye', anio: 4, materia: 'Matemática', c: 8, nudos: ['MAT-PRO'], tema: 'Probabilidad y estadística', contenidos: '' },
	{ id: 'p4-prog', anio: 4, materia: 'Informática', rama: 'Programación', c: 7, nudos: ['INF-A'], tema: 'Programación',
	  contenidos: 'Python como herramienta de investigación, incorporado progresivamente: Pandalyze (bloques sobre pandas, UNLP) → Python/pandas directo → scripts para sensores Arduino. Programación web (HTML/CSS) para portfolio de proyecto.' },
	{ id: 'p4-sl', anio: 4, materia: 'Informática', rama: 'Programación', c: 7, nudos: ['INF-H'], tema: 'Filosofía del software libre',
	  contenidos: 'Transversal: cada elección de herramienta es una decisión política explícita (Pandalyze/UNLP, Arduino/hardware libre). Soberanía digital y datos abiertos.' },
	{ id: 'p4-bd', anio: 4, materia: 'Informática', rama: 'Programación', c: 8, nudos: ['INF-E'], tema: 'Bases de datos',
	  contenidos: 'Concepto dato → información → conocimiento (eje del año a través del Ciclo de Datos); SQLite para almacenar lecturas de sensores en el ABP 2.' },
	{ id: 'p4-seg', anio: 4, materia: 'Informática', rama: 'Programación', c: 8, nudos: ['INF-D'], tema: 'Seguridad y legislación informática',
	  contenidos: 'Privacidad al publicar datos y fotos, derecho de imagen al filmar, licencias del sitio web. Ley de datos personales 25.326.' },
	{ id: 'd4-texto', anio: 4, materia: 'Informática', rama: 'Diseño', c: 7, nudos: [], tema: 'Relación texto imagen en la comunicación', contenidos: '' },
	{ id: 'd4-cartel', anio: 4, materia: 'Informática', rama: 'Diseño', c: 8, nudos: [], tema: 'Cartelería impresa situada y digital', contenidos: '' }
];
