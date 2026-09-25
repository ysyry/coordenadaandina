/**
 * Catálogo curricular de Neuquén · Área Matemática e Informática.
 * No se edita desde la app: se carga por seed.
 *
 * QUÉ ES TEXTUAL Y QUÉ NO
 *  - Los SABERES de los cuatrimestres 1 a 6 son **el texto de la Res. 1381/22**, extraído
 *    del PDF columna por columna y cotejado nudo por nudo (42 de 42) el 23/09/2026.
 *    MAT-NUM en C4 termina sin punto final: así está en la norma.
 *  - Los TÍTULOS son nuestros: nombres cortos para poder referirse a cada entrada.
 *    La resolución no titula los saberes.
 *  - Los cuatrimestres 7 a 10 (Ciclo Orientado) todavía NO pasaron por esa verificación:
 *    siguen siendo redacción propia a partir de la Res. 1578/26.
 *
 * Fuentes:
 *  - Res. 1381/22 → 1º a 3º (Ciclo Básico Común + Enlace Pedagógico Interciclo)
 *  - Res. 1044/19 → los NUDOS del Ciclo Orientado (Matemática, Informática y EPA).
 *  - Res. 1578/26 → los CONOCIMIENTOS Y SABERES del Ciclo Orientado, por cuatrimestre.
 *
 * Los códigos se mantienen estables entre ciclos: MAT-GEO en 2º y en 4º es el mismo nudo,
 * complejizado. Los que no continúan simplemente no tienen filas en el Orientado.
 *
 * Dos hallazgos de la 1044/19:
 *  - Matemática pasa de CUATRO nudos a TRES: "Lo Numérico y lo Aritmético" NO continúa
 *    en el Ciclo Orientado.
 *  - Informática pasa de OCHO nudos a CUATRO propios (Programación, Base de datos,
 *    Seguridad y legislación, Software Libre). Arquitectura y Redes no continúan.
 *    IA e Ingeniería de Software entran por la cláusula de la propia 1044/19, que
 *    habilita "incorporar otros nudos disciplinares que hayan sido propuestos en el CBC".
 *
 * La distribución de los saberes de la 1578/26 sobre los nudos de la 1044/19 es lectura
 * nuestra: la 1578/26 lista los saberes por cuatrimestre sin asignarlos a un nudo.
 */

export type Disciplina = 'matematica' | 'informatica' | 'epa';

export interface NudoDef {
	codigo: string;
	nombre: string;
	disciplina: Disciplina;
	transversal?: boolean;
	/**
	 * Sólo en el Orientado: a qué nudo del Ciclo Básico continúa, por código.
	 * `null` es una afirmación, no un olvido: el nudo nace en el Orientado.
	 * Los códigos coinciden, pero los nombres no: por eso se declara.
	 */
	continuaDe?: string | null;
	cuatris: { c: number; anio: number; titulo?: string; saberes: string; repite?: boolean }[];
}

export interface VinculoDef {
	c: number; a: string; b: string; titulo: string; resumen: string;
	idiomaA?: string; idiomaB?: string; trampa?: string; falsoAmigo?: string;
	claseA?: string; claseB?: string; pregunta?: string; porQue?: string;
	vocabA?: string; vocabB?: string;
}

/* ─────────────── 1º a 3º · Res. 1381/22 ─────────────── */

export const NUDOS_BASICO: NudoDef[] = [
{ codigo: 'MAT-GEO', nombre: 'Lo Geométrico y la Medida', disciplina: 'matematica', cuatris: [
 { c:1, anio:1, titulo:'Entes fundamentales, ángulos y su medida', saberes:'Entes fundamentales: recta, punto y plano. Construcción de segmentos y ángulos. El sistema sexagesimal. Lugares geométricos: la mediatriz y la bisectriz. Relaciones entre ángulos a partir de las propiedades del paralelogramo: opuestos por el vértice y adyacentes, suplementarios y determinados por dos rectas paralelas cortadas por una transversal. Propiedades que fundamentan la construcción de triángulos y cuadriláteros. Elementos y clasificación de triángulos. Propiedad triangular y de ángulos del triángulo. Criterios de congruencia de triángulos. Construcción de polígonos regulares con regla y compás. Elementos y Clasificación de cuadriláteros Propiedades de paralelogramos, trapecios y romboides.' },
 { c:2, anio:1, titulo:'Puntos notables, perímetros y áreas', saberes:'Propiedades de las mediatrices y bisectrices de un triángulo. Puntos notables del triángulo: el ortocentro y el baricentro, el incentro y el circuncentro. Perímetros y áreas de triángulos y cuadriláteros: comparación y variaciones en función de la descomposición de figuras. Unidades de medida de longitud y superficie/agrarias adecuadas de acuerdo a la situación planteada.' },
 { c:3, anio:2, titulo:'Pitágoras y Thales', saberes:'Teorema de Pitágoras a través del área de los cuadrados y la relación entre los lados y la diagonal de un rectángulo. Descomposición de triángulos en triángulos rectángulos. La relación Pitagórica. Teorema de Thales y división proporcional de segmentos. Semejanza de triángulos y la consecuencia del teorema de Thales. Criterios de semejanza de triángulos. Criterios para decidir sobre la congruencia de figuras Condiciones de aplicación del teorema de Thales: sus propiedades.' },
 { c:4, anio:2, titulo:'Círculo y cuerpos', saberes:'Circunferencia y círculo: Perímetro y superficie. Variación del perímetro y área de un círculo en función de la variación del radio. Relaciones entre el ángulo inscripto en un arco de circunferencia con el ángulo central correspondiente. Propiedades. Cuerpos geométricos: poliedros y redondos. Propiedades. Construcción. Volumen y superficie: variación de acuerdo a la variación de medidas de sus elementos. Unidades de longitud, superficie, volumen y capacidad. Equivalencias. Relación entre superficies y volumen de cuerpos poliedros y redondos. Variación de superficies laterales con volúmenes constantes o variación de volúmenes con superficies laterales constantes.' },
 { c:5, anio:3, titulo:'Trigonometría', saberes:'Triángulo rectángulo: Distancia entre dos puntos en el plano coordenado. Distancia de un punto a una recta. Relaciones entre lados de un triángulo rectángulo: razones trigonométricas. Seno, coseno y tangente. Teorema del seno y del coseno.' },
 { c:6, anio:3, titulo:'Lugar geométrico', saberes:'La circunferencia Ecuación de la circunferencia. Relaciones entre circunferencia y una recta y entre dos circunferencias. Análisis de soluciones gráfica y analítica. Características geométricas de la circunferencia y la parábola como lugar geométrico.' } ]},

{ codigo: 'MAT-NUM', nombre: 'Lo Numérico y lo Aritmético', disciplina: 'matematica', cuatris: [
 { c:1, anio:1, titulo:'Naturales y enteros', saberes:'Distintos sistemas de numeración: Propiedades de los números naturales (N): operaciones y su jerarquía. Criterios de divisibilidad de números naturales y sus propiedades. La división como operación y como relación: Múltiplos y divisores. Relación entre dividendo, divisor, cociente y resto y condiciones del resto Números enteros (Z): la relación de orden. Representación en la recta numérica. Opuestos y consecutivos. El módulo o valor absoluto. Operaciones en Z Suma y resta, multiplicación y división, potenciación de exponente natural y radicación. Propiedades Jerarquía de las operaciones en la resolución de cálculos combinados.' },
 { c:2, anio:1, titulo:'Los racionales', saberes:'Conjunto de números racionales (ℚ) Representaciones de un número racional: expresiones fraccionarias y decimales, notación científica. Ubicación aproximada en la recta numérica. Densidad de Q. Fracciones equivalentes: amplificación y simplificación. Transformación de expresiones decimales exactas/periódicas a fracción y viceversa. Redondeo y truncamiento.' },
 { c:3, anio:2, titulo:'Operar en Q', saberes:'Operaciones elementales entre números racionales (ℚ) que incluya la potenciación (con exponente entero), la radicación en ℚ y las propiedades de las mismas. Propiedades y jerarquía de operaciones involucradas en diferentes cálculos. Propiedades de las operaciones numéricas: igualdades o desigualdades. Proporcionalidad numérica. Extremos y medios.' },
 { c:4, anio:2, titulo:'Medida y proporcionalidad', saberes:'Números racionales: problemas de medida y de proporcionalidad. Aproximaciones: redondeo, truncamiento. Generalización de las propiedades de los números naturales, enteros y racionales' },
 { c:5, anio:3, titulo:'Los reales', saberes:'El conjunto de los números Reales (ℝ) El número irracional (𝕀) y su ubicación en la recta numérica (triángulo rectángulo de altura 1) de la forma . Operaciones entre números irracionales de la forma que incluya la potenciación (con exponente entero y fraccionario), la radicación y propiedades Racionalización de denominadores.' },
 { c:6, anio:3, titulo:'Sucesiones', saberes:'Sucesiones: comportamiento de los para un n muy grande. Progresiones aritméticas y geométricas. Uso de gráficos cartesianos.' } ]},

{ codigo: 'MAT-ALG', nombre: 'Lo Algebraico y Funcional', disciplina: 'matematica', cuatris: [
 { c:1, anio:1, titulo:'Primeras ecuaciones', saberes:'Expresiones algebraicas. Su expresión oral o coloquial y su expresión simbólica. Transformación de expresiones algebraicas en equivalentes. Supresión de paréntesis y las propiedades de las operaciones (suma, resta y producto por un escalar). Comparación de expresiones algebraicas: la diferencia. Ecuaciones de primer grado donde la variable aparece en uno o ambos de los miembros: su conjunto solución (sin solución, única solución e infinitas soluciones)' },
 { c:2, anio:1, titulo:'Registros de representación', saberes:'Fórmulas de cálculo de perímetros y áreas como relación entre variables. Introducción a las Ecuaciones e inecuaciones: su conjunto solución El plano cartesiano. Registros de representación (tabla, gráfica, algebraica) Modelos funcionales de una variable y las correspondientes ecuaciones (e inecuaciones) asociadas. Interpretación de relaciones entre variables en tablas y gráficas.' },
 { c:3, anio:2, titulo:'La función lineal', saberes:'Ecuaciones e inecuaciones con números racionales. Representación del conjunto solución. La función como relación entre variables. Dominio e imagen de una función. Intervalos de crecimiento y decrecimiento. Raíces de una función. Positividad y negatividad. La función lineal: fórmula algebraica, gráfica y tabla Relaciones entre variables de una función lineal Parámetros de la función lineal y su variabilidad. Ecuación de una recta a partir de diferentes datos. Sistemas de ecuaciones: métodos gráfico y analítico. Relaciones entre rectas y el conjunto solución de su correspondiente sistema de ecuaciones: tipos de soluciones de un sistema de ecuaciones. Variaciones de los parámetros de la función lineal: paralelismo y perpendicularidad.' },
 { c:4, anio:2, titulo:'Polinomios', saberes:'Expresiones algebraicas: Polinomios. La suma y la resta de polinomios. Multiplicación de polinomios: propiedad distributiva, reglas de cálculos. Potencia: el cuadrado y el cubo de un binomio. Cociente: relación entre dividendo, divisor, cociente y resto. Determinación e interpretación del resto de la división entre polinomios utilizando Teorema del resto y Regla de Ruffini.' },
 { c:5, anio:3, titulo:'La función cuadrática', saberes:'Factorización de expresiones algebraicas: el factor común, trinomio cuadrado perfecto, cuatrinomio cubo perfecto, diferencia de cuadrados, método de Ruffini. Simplificación de expresiones racionales. Función cuadrática: variaciones en los diferentes registros de representación (tabla, gráfica, algebraica). Crecimiento, decrecimiento, máximos y mínimos. Raíces de la función cuadrática. Expresión canónica, polinómica y factorizada. Construcción del gráfico. Ecuaciones cuadráticas: interpretación gráfica y analítica de las raíces de la función cuadrática. Fórmula de Baskara o resolvente. Intersecciones entre parábolas y rectas, y parábolas y parábolas: análisis de sus posibles soluciones:' },
 { c:6, anio:3, titulo:'Exponencial y logarítmica', saberes:'La función cúbica. Funciones polinómicas, raíces y su representación gráfica. Variaciones funcionales: Funciones logarítmicas y exponenciales. Logaritmo: definición y propiedades. Logaritmos decimales y naturales. Logaritmos de distinta base. El cambio de base. Ecuaciones logarítmicas y exponenciales: raíz de la función. Funciones racionales. Funciones trigonométricas: variaciones (amplitud, desplazamientos, frecuencia). Análisis gráfico y de sus parámetros (dominio, imagen, ceros, ordenada al origen, máximos, punto de inflexión, asíntotas, continuidad, entre otros).' } ]},

{ codigo: 'MAT-PRO', nombre: 'Lo Probabilístico y Estadístico', disciplina: 'matematica', cuatris: [
 { c:1, anio:1, titulo:'Frecuencias y azar', saberes:'Poblaciones, muestras y variables Frecuencias absolutas, relativas y porcentuales Promedio, moda y mediana Gráfico de barras y de torta Sucesos aleatorios. Probabilidad simple.' },
 { c:2, anio:1, titulo:'Frecuencias y azar', saberes:'Poblaciones, muestras y variables Frecuencias absolutas, relativas y porcentuales Promedio, moda y mediana Gráfico de barras y de torta Sucesos aleatorios. Probabilidad simple.', repite:true },
 { c:3, anio:2, titulo:'Intervalos e histogramas', saberes:'Poblaciones, muestras y variables Frecuencias absolutas, relativas y porcentuales Promedio, moda y mediana Gráfico de barras y circulares. Intervalos de clase. Histogramas. Sucesos aleatorios Probabilidad simple y cálculo combinatorio (anagramas)' },
 { c:4, anio:2, titulo:'Intervalos e histogramas', saberes:'Poblaciones, muestras y variables Frecuencias absolutas, relativas y porcentuales Promedio, moda y mediana Gráfico de barras y circulares. Intervalos de clase. Histogramas. Sucesos aleatorios Probabilidad simple y cálculo combinatorio (anagramas)', repite:true },
 { c:5, anio:3, titulo:'Combinatoria y estadística', saberes:'Sucesos aleatorios y espacio muestral Probabilidad. Combinatoria: Cálculo combinatorio y factorial de un número. Permutaciones, variaciones y combinaciones. Estadística. Distribución de frecuencias y parámetros estadísticos: mediana, moda y media. Gráficos estadísticos. Intervalos de clase. Histogramas El diagrama de árbol.' },
 { c:6, anio:3, titulo:'Combinatoria y estadística', saberes:'Sucesos aleatorios y espacio muestral Probabilidad. Combinatoria: Cálculo combinatorio y factorial de un número. Permutaciones, variaciones y combinaciones. Estadística. Distribución de frecuencias y parámetros estadísticos: mediana, moda y media. Gráficos estadísticos. Intervalos de clase. Histogramas El diagrama de árbol.', repite:true } ]},

{ codigo: 'INF-A', nombre: 'Algoritmos y Programación', disciplina: 'informatica', cuatris: [
 { c:1, anio:1, titulo:'El algoritmo aparece', saberes:'Definición formal del problema y pasos para el análisis. Estudio de un problema como un proceso que implica, estado inicial, diversas acciones y que concluye en un estado final. La idea de abstracción a fin de modelizar un problema que pueda formalizarse algorítmicamente. Conceptualización de Algoritmo. Las estructuras secuenciales, alternativas (condicionales) y las repetitivas. El concepto de secuencialidad y de alternativas condicionales como dos tipos de recorridos de las instrucciones dentro de un algoritmo o programa. Los operadores lógicos (Y, O, NOT) que proporcionan un resultado a partir de que se cumpla o no una cierta condición. Los operadores de comparación (>, <, =) que se utilizan para tomar decisiones mediante comparaciones en las estructuras condicionales.' },
 { c:3, anio:2, titulo:'La variable y la traza', saberes:'Conceptualización de Algoritmo. Diferentes formas de representación (diagramas de flujo, pseudocódigo, entre otros). Las estructuras secuenciales, alternativas (condicionales) y las repetitivas. La implementación de algoritmos en un lenguaje de programación. Conceptos de constante y variable, relacionarlos con la memoria y las formas de almacenamiento de las computadoras. La relación de los valores de una variable, sus cambios a lo largo de la ejecución del programa y el ámbito en que puede ser usada. Los distintos tipos de datos y su relación con el tipo de información que representan. La operación de asignación utilizada para que una variable reciba un valor de forma directa. La prueba de escritorio, o traza, y su relación con lo que hace un determinado algoritmo o programa . La utilidad de las expresiones booleanas en las estructuras alternativas para determinar si un conjunto de una o más expresiones son verdaderas o falsas.' },
 { c:5, anio:3, titulo:'Del algoritmo al programa', saberes:'Las estructuras secuenciales, alternativas (condicionales) y las repetitivas La implementación de algoritmos en un lenguaje de programación y su sintaxis en los aspectos léxicos (palabras válidas del lenguaje), sintácticos (reglas para combinarlas) y semánticos (significado de las mismas). Diferencias entre algoritmo y programa. La noción de programa y la diferencia entre tiempo de creación y de ejecución del mismo.' } ]},

{ codigo: 'INF-B', nombre: 'Arquitectura de Computadoras y Sistemas Operativos', disciplina: 'informatica', cuatris: [
 { c:2, anio:1, titulo:'Cómo es una computadora por dentro', saberes:'Conceptos de Hardware y Software y su relación. Las características, funciones y relaciones de los componentes de una computadora. Arquitectura de Von Newman, funcionamiento de la CPU, como está constituida y su relación con la memoria RAM. Caracterización según su velocidad, su modo de funcionamiento y su arquitectura. Concepto de periférico y su clasificación (entrada – salida – entrada/salida). Las funciones de la memoria de una computadora e identificar los diferentes tipos (memoria RAM – ROM – Cache – EPROM – entre otros). Las características de la jerarquía de memoria. Representación digital de datos. Sistema binario. Concepto de bit, byte y múltiplos equivalentes. Los dispositivos de almacenamiento, considerando su capacidad de almacenamiento, su velocidad de acceso y costo.' },
 { c:4, anio:2, titulo:'El sistema operativo', saberes:'Concepto de sistema operativo interpretándolo como una capa intermedia entre el hardware y las aplicaciones de software. La utilidad y funcionalidades de los sistemas operativos, así como sus partes más importantes. Funciones de los sistemas operativos referidas al manejo de recursos, procesos, usuarios y el sistema de permisos. Los diversos sistemas de archivos que el sistema operativo utiliza para organizar la información en los medios de almacenamiento. Origen de las actualizaciones y aplicaciones de un sistema operativo.' } ]},

{ codigo: 'INF-C', nombre: 'Redes de Computadoras e Internet', disciplina: 'informatica', cuatris: [
 { c:3, anio:2, titulo:'Las redes', saberes:'Concepto de redes de computadoras. Historia y evolución. Uso de las redes de computadoras en la vida cotidiana. Clasificación según su alcance (PAN, LAN, MAN, WAN, entre otros). Los modelos de referencia en capas (modelo OSI, modelo TCP/IP) como una forma de diseñar e implementar redes de computadoras. Concepto de protocolo como conjunto de reglas que rigen el intercambio de información a través de una red de computadoras. Modelos de red cliente/servidor o igual a igual, sus características y particularidades.' },
 { c:6, anio:3, titulo:'Internet por dentro', saberes:'Concepto de enlace y tramas como también el de redes Ethernet cableadas e inalámbricas como parte del nivel de enlace. Conceptos de ruteo, protocolo IP, resolución de direcciones como parte del nivel de red. Protocolos UDP, TCP y el concepto de socket, como parte del nivel de transporte. Internet: su composición, sus protocolos, sus servicios de red (http, dhcp, dns, entre otros).' } ]},

{ codigo: 'INF-D', nombre: 'Seguridad Informática', disciplina: 'informatica', cuatris: [
 { c:2, anio:1, titulo:'Ciudadanía digital', saberes:'Concepto de seguridad informática. Característica de un sistema informático seguro en relación a la integridad, confidencialidad, disponibilidad, autenticidad e irrefutabilidad. Origen y concepto de vulnerabilidad, tanto lógica como física en los sistemas informáticos. Concepto de identidad digital y ciudadanía digital. Su construcción, desarrollo y relación. Conceptualizar el ciberespacio como lugar de interacción. Características generales de las redes sociales y de los sistemas de mensajería instantánea. Comprender los riesgos a los que se está expuesto cuando se forma parte de una red social. El impacto social de la creación de redes sociales. Proveer herramientas que permitan generar conciencia crítica sobre las acciones que corresponde tomar en diferentes situaciones de riesgo. Delitos de cyberbullying, grooming, sexting entre otros. Concepto hacker y su relación con la ética en cuanto al acceso y uso a la información, así como al acceso y control de los sistemas de información y comunicación. La autenticación con contraseñas para el acceso a sistemas informáticos. Característica de una contraseña segura. Concepto de encriptación. Usos y técnicas. Descarga de software de sitios inseguros. Riegos y análisis crítico de una alerta, una publicidad o una aplicación. Características que determinan si una fuente es segura en el acceso a información.' },
 { c:4, anio:2, titulo:'Leyes y malware', saberes:'Aspectos legales de la seguridad informática. Fundamentos y alcances de las leyes de Habeas Data, de Confidencialidad y de Delitos Informáticos Concepto de firewalls y filtrado de paquetes. Concepto hacker y su relación con la ética en cuanto al acceso y uso a la información, así como al acceso y control de los sistemas de información y comunicación. Concepto de software malicioso -virus, malware, spyware, entre otros-, su funcionamiento, su origen y su impacto en la confidencialidad, integridad y disponibilidad de un sistema informático y su información. Características y funciones de los antivirus, antimalware y antispyware en la detección y prevención de amenazas. Descarga de software de sitios inseguros. Riegos y análisis crítico de una alerta, una publicidad o una aplicación. Características que determinan si una fuente es segura en el acceso a información.' } ]},

{ codigo: 'INF-E', nombre: 'Bases de Datos', disciplina: 'informatica', cuatris: [
 { c:5, anio:3, titulo:'Bases de datos', saberes:'Concepto de base datos. Características y funciones. La presencia de bases de datos en situaciones de la vida cotidiana. Concepto de dato, información y conocimiento. Modelización de problemas que impliquen el uso de base de datos relacionales. Concepto de atributo y entidad. Diagrama de Entidad-Relación como forma de representar los modelos planteados. Gestores de base de datos. Funciones y características. Concepto de tablas, campos, registros, clave primaria y relación entre tablas. Implementación de un diagrama de Entidad-Relación en un gestor de base de datos. Principales sentencias del lenguaje SQL, a fin de realizar consultas a la base de datos.' } ]},

{ codigo: 'INF-F', nombre: 'Ingeniería de Software', disciplina: 'informatica', cuatris: [
 { c:6, anio:3, titulo:'Ingeniería de software', saberes:'Concepto y origen de la ingeniería del software Las distintas etapas del proceso de desarrollo del ciclo de vida: especificación, diseño, implementación, validación y evolución. El ciclo de vida del software y sus diferentes modelos de aplicación: cascada, incremental y evolutivo. Proceso de especificación de requerimientos y caracterización de los distintos tipos de requerimientos: funcionales, no funcionales, del usuario y del sistema. Distintas técnicas de comunicación para la obtención de requerimientos: entrevistas y cuestionarios entre otros. La participación y función de distintos actores en el desarrollo del software en relación a la especificación de los casos de uso. El prototipado de requerimientos como una técnica de desarrollo rápida. La validación de requerimientos comprendiendo la importancia de la elaboración del documento de especificación de requerimientos. Comprender el desarrollo de software como un proceso productivo en el que su producción es una actividad intelectual cuyos requerimientos son inestables en el tiempo y por lo tanto se encuentra en constante evolución.' } ]},

{ codigo: 'INF-G', nombre: 'Inteligencia Artificial', disciplina: 'informatica', cuatris: [
 { c:4, anio:2, titulo:'Qué es la inteligencia artificial', saberes:'Fundamentos de la inteligencia artificial como campo multidisciplinario íntimamente relacionado con las nociones de computación y computabilidad, lógica, filosofía y ética. La ética en la inteligencia artificial ante la posibilidad de crear agentes pensantes en relación a que estos no lastimen a seres humanos u otros seres vivos, así como al estatus moral propio del agente. Características de un sistema para considerarse racional. Facetas del comportamiento inteligente de acuerdo al enfoque centrado en el humano y al enfoque racionalista. Las facetas del comportamiento inteligente: actuar humanamente desde el enfoque del Test de Turing, pensar humanamente desde el enfoque del modelado cognitivo, pensar racionalmente desde el enfoque de las leyes del pensamiento y actuar racionalmente desde el enfoque del agente racional.' },
 { c:6, anio:3, titulo:'Agentes y autómatas', saberes:'La teoría de autómatas y los problemas que son capaces de resolver en relación a la máquina de Turing. Destacar que este es el primer modelo teórico de computadora. Concepto de agente inteligente, su medio, y cómo se construyen mediante su estructura y tipo de ambiente. Clasificación de los agentes, racional ideal, de reflejo simple, basado en logro de metas y basados en el logro del mejor desempeño. Los tipos de ambientes de un agente, accesibles y no accesibles, deterministas y no deterministas, episódicos y no episódicos, estáticos y dinámicos, discretos y continuos. Grado de autonomía que proporciona la inteligencia artificial a sistemas robóticos, entendiendo a la autonomía como la independencia del robot con respecto al control humano. Problemas resolubles e irresolubles. Teoría de la computación y la teoría de autómatas para formalizar los problemas y darles solución.' } ]},

{ codigo: 'INF-H', nombre: 'Software Libre', disciplina: 'informatica', transversal: true, cuatris: [
 { c:1, anio:1, titulo:'Qué hace libre a un software', saberes:'Condiciones que debe cumplir un software para que sea considerado software libre y sus diferencias con el software propietario. Concepto de software propietario en relación con las diversas licencias privativas como ser la licencia Gratuita (en inglés, Freeware), la licencia de Distribución (en inglés, Shareware) entre otras. Distinción entre software libre y gratuito en relación con las diversas licencias públicas como ser la Licencia Pública General (en inglés, General Public License, GPL), la Licencia Pública General de Affero (en inglés, Affero General Public License, AGPL), la licencia de Distribución de Software de Berkeley (en inglés, Berkeley Software Distribution, BSD), la licencia Apache y las licencias Comunes Creativas (en inglés, Creative Commons, CC), entre otras.' },
 { c:3, anio:2, titulo:'Copyleft y hardware libre', saberes:'La filosofía del software libre considera al software como un medio para transmitir y depurar conocimiento y como modelo cuya connotación ética, en tanto alternativa socializadora y antimonopolista al software privativo, promueve un impacto y significación social en oposición al sustento filosófico y ético de la propiedad capitalista del conocimiento. La filosofía del software libre para comprender por qué los usuarios deben tener la libertad para ejecutar, copiar, estudiar, mejorar y redistribuir el software en directa relación al estudio y comprensión de las licencias Copyleft como método para liberar una creación en oposición a las licencias Copyrigth. Concepto de hardware libre y sus principios básicos.' },
 { c:4, anio:2, titulo:'Sigue transversal', saberes:'La filosofía del software libre considera al software como un medio para transmitir y depurar conocimiento y como modelo cuya connotación ética, en tanto alternativa socializadora y antimonopolista al software privativo, promueve un impacto y significación social en oposición al sustento filosófico y ético de la propiedad capitalista del conocimiento. La filosofía del software libre para comprender por qué los usuarios deben tener la libertad para ejecutar, copiar, estudiar, mejorar y redistribuir el software en directa relación al estudio y comprensión de las licencias Copyleft como método para liberar una creación en oposición a las licencias Copyrigth. Concepto de hardware libre y sus principios básicos.', repite:true },
 { c:5, anio:3, titulo:'Con implicancias', saberes:'La filosofía del software libre considera al software como un medio para transmitir y depurar conocimiento y como modelo cuya connotación ética, en tanto alternativa socializadora y antimonopolista al software privativo, promueve un impacto y significación social en oposición al sustento filosófico y ético de la propiedad capitalista del conocimiento. La filosofía del software libre para comprender por qué los usuarios deben tener la libertad para ejecutar, copiar, estudiar, mejorar y redistribuir el software en directa relación al estudio y comprensión de las licencias Copyleft como método para liberar una creación en oposición a las licencias Copyrigth. Considerando las implicancias éticas, políticas, sociales y económicas.' },
 { c:6, anio:3, titulo:'Sigue transversal', saberes:'La filosofía del software libre considera al software como un medio para transmitir y depurar conocimiento y como modelo cuya connotación ética, en tanto alternativa socializadora y antimonopolista al software privativo, promueve un impacto y significación social en oposición al sustento filosófico y ético de la propiedad capitalista del conocimiento. La filosofía del software libre para comprender por qué los usuarios deben tener la libertad para ejecutar, copiar, estudiar, mejorar y redistribuir el software en directa relación al estudio y comprensión de las licencias Copyleft como método para liberar una creación en oposición a las licencias Copyrigth. Considerando las implicancias éticas, políticas, sociales y económicas.', repite:true } ]}
];

/* ─────────────── 4º y 5º · Res. 1578/26 ─────────────── */

export const NUDOS_ORIENTADO: NudoDef[] = [
{ codigo: 'EPA-CONJ', continuaDe: null, nombre: 'Teoría de conjuntos', disciplina: 'epa', cuatris: [
 { c:7, anio:4, titulo:'Conjuntos y lógica', saberes:'Concepto de conjunto, elemento y pertenencia. Definir por extensión y comprensión. Subconjuntos, conjunto universal y vacío. Unión e intersección. Diagramas de Venn. Organización y clasificación de información. Tablas simples. Introducción a bases de datos y a herramientas digitales para organizar información. Conectores lógicos AND, OR, NOT. Tablas de verdad simples. Condicionales básicos. Funciones lógicas en hojas de cálculo. Introducción al modelo entidad-relación.' } ]},
{ codigo: 'EPA-NUM', continuaDe: null, nombre: 'Sistemas de numeración', disciplina: 'epa', cuatris: [
 { c:8, anio:4, titulo:'Codificar la realidad', saberes:'Codificación de caracteres: tabla ASCII simplificada. Sistema binario en sistemas digitales. Imágenes digitales como mapa de bits. Sistema binario y hexadecimal. Medición de la información: bit y byte, cálculo del tamaño de datos. Construcción de secuencias ordenadas de pasos. Agrupamiento en bytes y manejo de grandes volúmenes. Criterios de eficiencia y legibilidad. Traducción entre representaciones: imagen y código.' },
 { c:9, anio:5, titulo:'Conversiones y unidades', saberes:'Binario, decimal, octal y hexadecimal. Valor posicional y conversiones entre sistemas. Operaciones básicas en distintos sistemas. Unidades de medida de la información y relaciones entre unidades. Representación digital de datos y codificación básica. Capacidad de almacenamiento y velocidad de procesamiento. Noción de algoritmo, secuencias ordenadas, precisión y finitud.' } ]},
{ codigo: 'EPA-LOG', continuaDe: null, nombre: 'Lógica Matemática', disciplina: 'epa', cuatris: [
 { c:10, anio:5, titulo:'Lógica y circuitos', saberes:'Lógica proposicional. Proposiciones simples y compuestas. Operadores lógicos: conjunción, disyunción, negación, condicional y bicondicional. Construcción e interpretación de tablas de verdad complejas. Tautologías y contradicciones. Equivalencias lógicas. Introducción al álgebra de Boole y simplificación de expresiones. Lógica aplicada a la programación. Circuitos lógicos básicos: puertas AND, OR y NOT. Criterios de optimización y eficiencia.' } ]},

{ codigo: 'MAT-GEO', continuaDe: 'MAT-GEO', nombre: 'Lo Geométrico y la Medida', disciplina: 'matematica', cuatris: [
 { c:7, anio:4, titulo:'Trigonometría y medición', saberes:'Razones trigonométricas en triángulos rectángulos: seno, coseno y tangente. Resolución de triángulos rectángulos. Aplicaciones contextualizadas en alturas, distancias y mediciones indirectas. Introducción a la circunferencia trigonométrica.' },
 { c:9, anio:5, titulo:'Circunferencia trigonométrica', saberes:'Circunferencia trigonométrica completa. Razones trigonométricas para cualquier ángulo. Teorema del seno y del coseno. Resolución de triángulos oblicuángulos. Modelización de fenómenos periódicos mediante relaciones trigonométricas.' } ]},
{ codigo: 'MAT-ALG', continuaDe: 'MAT-ALG', nombre: 'Lo Algebraico y lo Funcional', disciplina: 'matematica', cuatris: [
 { c:7, anio:4, titulo:'Funciones y modelización inicial', saberes:'Función lineal: pendiente e interpretación. Función cuadrática: análisis inicial de la parábola, raíces y vértice. Lectura e interpretación de gráficos. Relación entre fórmulas, tablas y gráficos utilizando recursos tecnológicos.' },
 { c:9, anio:5, titulo:'Comparar funciones', saberes:'Función lineal, cuadrática y exponencial: comparación de comportamientos y variaciones. Transformaciones de funciones: traslaciones, estiramientos y compresiones. Interpretación analítica y gráfica con herramientas tecnológicas.' } ]},
{ codigo: 'MAT-PRO', continuaDe: 'MAT-PRO', nombre: 'La Probabilidad y lo Estadístico', disciplina: 'matematica', cuatris: [
 { c:8, anio:4, titulo:'Probabilidad y datos reales', saberes:'Experimentos aleatorios. Probabilidad simple. Frecuencia absoluta y relativa. Representación e interpretación de datos mediante tablas y gráficos. Trabajo con datos provenientes de situaciones reales. Aplicación conjunta de trigonometría, funciones y probabilidad en la resolución de situaciones problemáticas. Validación de procedimientos en distintos registros de representación.' },
 { c:10, anio:5, titulo:'Probabilidad condicionada', saberes:'Probabilidad de sucesos excluyentes y no excluyentes, independientes y dependientes. Noción de probabilidad condicionada. Análisis estadístico e interpretación crítica de datos. Modelización matemática de situaciones intra y extra-matemáticas. Construcción, validación y análisis de modelos. Comunicación de resultados en proyectos interdisciplinarios.' } ]},

{ codigo: 'INF-A', continuaDe: 'INF-A', nombre: 'Programación', disciplina: 'informatica', cuatris: [
 { c:7, anio:4, titulo:'Python entra por nombre', saberes:'Algoritmos y resolución de problemas. Representación en lenguaje natural, diagramas de flujo y pseudocódigo. Estructuras secuenciales, condicionales y repetitivas. Variables y constantes. Introducción a lenguajes de programación interpretados (Python). Entrada, procesamiento y salida de datos. Desarrollo de programas simples.' },
 { c:8, anio:4, titulo:'Web y aplicaciones', saberes:'Programación aplicada y pensamiento computacional. Modularización y reutilización de código en Python. Eficiencia algorítmica y manejo de datos. Desarrollo web básico: HTML y CSS. Desarrollo básico de aplicaciones móviles.' },
 { c:9, anio:5, titulo:'Programar con funciones', saberes:'Funciones, modularización y reutilización de código en Python. Estructuras de datos básicas y validación de datos. Desarrollo de aplicaciones contextualizadas. Introducción a programación web dinámica.' } ]},
{ codigo: 'INF-E', continuaDe: 'INF-E', nombre: 'Base de datos', disciplina: 'informatica', cuatris: [
 { c:7, anio:4, titulo:'Del dato a la información', saberes:'Datos, información y conocimiento. Organización y representación de información digital. Introducción a bases de datos. Modelización de situaciones mediante tablas y diagramas. Almacenamiento, búsqueda y recuperación de información.' },
 { c:8, anio:4, titulo:'Relacionales y SQL', saberes:'Bases de datos relacionales. Relaciones entre tablas y modelización de datos. Lenguaje SQL y consultas básicas. Almacenamiento, recuperación y filtrado de información. Integración entre bases de datos y aplicaciones.' },
 { c:9, anio:5, titulo:'Consultas avanzadas', saberes:'Diagramas entidad-relación y modelización de datos. Consultas avanzadas en SQL. Integración entre bases de datos y aplicaciones digitales. Procesamiento, análisis y resguardo de información digital.' } ]},
{ codigo: 'INF-F', continuaDe: 'INF-F', nombre: 'Ingeniería de Software', disciplina: 'informatica', cuatris: [
 { c:7, anio:4, titulo:'Ciclo de vida', saberes:'Ingeniería de software: ciclo de vida del software. Requerimientos funcionales, no funcionales y de usuario. Participación de actores en el desarrollo de software.' },
 { c:8, anio:4, titulo:'Modelos de desarrollo', saberes:'Ingeniería de software y ciclo de desarrollo. Modelos incremental y evolutivo. Implementación, validación y evolución del software. Requerimientos y cambios en sistemas informáticos.' },
 { c:9, anio:5, titulo:'Proyectos de software', saberes:'El software como proceso productivo. Ciclo de vida y modelos cascada, incremental y evolutivo. Requerimientos funcionales y no funcionales. Casos de uso y prototipado. Diseño, implementación y validación de soluciones digitales. Trabajo colaborativo en proyectos de software.' } ]},
{ codigo: 'INF-G', continuaDe: 'INF-G', nombre: 'Inteligencia Artificial', disciplina: 'informatica', cuatris: [
 { c:8, anio:4, titulo:'Agentes y autómatas', saberes:'Inteligencia artificial y agentes inteligentes. Ambientes, sensores y actuadores en sistemas inteligentes. Introducción a teoría de autómatas y diagramas de estados. Comportamiento racional y toma de decisiones automatizadas. Ética e impacto social de la inteligencia artificial.' },
 { c:10, anio:5, titulo:'IA generativa', saberes:'Fundamentos de Inteligencia Artificial. Sistemas inteligentes y agentes racionales. Introducción al aprendizaje automático y reconocimiento de patrones. Inteligencia Artificial generativa y modelos de lenguaje. Ingeniería de prompts y resolución de problemas. Razonamiento lógico y respuestas probabilísticas en modelos generativos. Impacto social, político, económico y ambiental de la IA. Diseño y desarrollo de proyectos interdisciplinarios integrando programación, bases de datos e inteligencia artificial.' } ]},
{ codigo: 'INF-D', continuaDe: 'INF-D', nombre: 'Seguridad y legislación informática', disciplina: 'informatica', cuatris: [
 { c:7, anio:4, titulo:'Ciudadanía digital', saberes:'Seguridad informática y protección de datos. Ciudadanía digital y uso responsable de la información. Privacidad, huella digital y desinformación. Aspectos legales vinculados a las tecnologías digitales.' },
 { c:8, anio:4, titulo:'Integridad y riesgos', saberes:'Seguridad informática e integridad de datos. Riesgos y aspectos legales en sistemas digitales. Ciudadanía digital y uso responsable de la información.' },
 { c:9, anio:5, titulo:'Resguardo de la información', saberes:'Seguridad informática y protección de datos en el desarrollo de soluciones digitales.' },
 { c:10, anio:5, titulo:'Sesgo y vigilancia', saberes:'Ética y ciudadanía digital en entornos inteligentes. Sesgo algorítmico, privacidad y vigilancia digital. Deepfakes, desinformación y construcción de la verdad digital. Propiedad intelectual y contenidos sintéticos.' } ]},
{ codigo: 'INF-H', continuaDe: 'INF-H', nombre: 'Filosofía del Software Libre', disciplina: 'informatica', transversal: true, cuatris: [
 { c:7, anio:4, titulo:'Soberanía tecnológica', saberes:'Filosofía del software libre y soberanía tecnológica.' },
 { c:8, anio:4, titulo:'Libre y privativo', saberes:'Filosofía del software libre y cultura digital. Software libre y software privativo. Soberanía tecnológica y acceso democrático al conocimiento. Implicancias éticas, sociales, políticas y económicas de las tecnologías digitales.' },
 { c:10, anio:5, titulo:'Tecnología y poder', saberes:'Filosofía del software libre y soberanía tecnológica. Relaciones entre tecnología, poder y sociedad. Documentación, validación y comunicación de proyectos tecnológicos.' } ]}
];

export const CATEGORIAS_ORIENTADO = [
	'Construcción colectiva, crítica y plural del conocimiento. La Etnomatemática y la Etnotecnología como herramientas políticas y epistémicas contrahegemónicas.',
	'Discurso científico, representación y contexto sociocultural. Los lenguajes matemáticos, lógicos y computacionales como sistemas de representación históricamente construidos.',
	'Capitalismo de plataformas, algoritmos y cultura digital. Cómo los algoritmos y las plataformas organizan la circulación de información, las identidades y las disputas de sentido.',
	'Relación entre tecnología, poder y soberanía del conocimiento. Control, clasificación y acceso a la información; soberanía tecnológica, Software Libre y brechas digitales.'
];

/* ─────────────── Vínculos entre nudos ───────────────
   Los cruces que la propia secuenciación pone en el mismo cuatrimestre.
   Los campos de traducción entre disciplinas NO salen de ninguna resolución:
   los escribe el equipo. Cuatro están sembrados como ejemplo; el resto va vacío. */

export const VINCULOS: VinculoDef[] = [
{ c:1, a:'MAT-ALG', b:'INF-A', titulo:'El = que guarda y el = que pregunta',
  resumen:'Los mismos símbolos con dos usos distintos',
  idiomaA:'Una variable es una letra que representa un número desconocido. En 3x + 5 = 20 el signo afirma: los dos lados valen lo mismo, y despejar es encontrar qué x hace verdadera esa afirmación.',
  idiomaB:'Los operadores de comparación sirven para decidir. El programa mira dos valores, los compara y con esa respuesta elige por dónde seguir.',
  trampa:'vidas = 3     ·     si vidas = 0 entonces:',
  falsoAmigo:'Los dos signos se escriben igual y hacen cosas distintas. El primero GUARDA: mete el 3 adentro de vidas. El segundo PREGUNTA: mira si vidas vale 0 para decidir.\n\nLo que hacen los pibes: leen la segunda línea como si fuera una ecuación y tratan de despejar. No es una ecuación: es una pregunta de sí o no.\n\nCómo se destraba: poner los dos al lado y nombrar la diferencia en voz alta. Muchos lenguajes usan == para preguntar, justamente para no confundirlos.',
  claseA:'Traducir un enunciado a expresión simbólica y despejar la incógnita en ecuaciones de primer grado.',
  claseB:'Escribir un condicional que decida qué mostrar según el valor de una variable, y probarlo con distintos valores.',
  pregunta:'¿Cuándo el juego tiene que decir "perdiste"?',
  porQue:'Hay que traducir una situación a una condición (Matemática) y escribirla de forma que la máquina la evalúe (Informática). Ninguna de las dos alcanza sola.',
  vocabA:'condicional: si pasa esto, hacé aquello. operador de comparación: el símbolo que compara dos valores y devuelve verdadero o falso.',
  vocabB:'expresión simbólica: escribir con letras y símbolos lo que el enunciado dice con palabras.' },

{ c:2, a:'MAT-ALG', b:'INF-B', titulo:'Representar lo mismo de varias formas',
  resumen:'Que ninguna representación sea la verdadera' },
{ c:2, a:'MAT-NUM', b:'INF-B', titulo:'Órdenes de magnitud y aproximación',
  resumen:'Por qué un archivo pesa, y por qué a veces la máquina redondea' },

{ c:3, a:'MAT-ALG', b:'INF-A', titulo:'Variable en los dos sentidos',
  resumen:'El cruce más fuerte del área',
  idiomaA:'Una letra que representa un número que puede tomar distintos valores dentro de un dominio. En y = 2x + 3, x e y varían juntas: lo permanente es la relación entre ellas.',
  idiomaB:'Un nombre que apunta a un lugar de la memoria donde hay un valor guardado. El valor cambia cuando el programa lo cambia, y el orden de las líneas importa.',
  trampa:'x = x + 1',
  falsoAmigo:'En Matemática no tiene solución: es una afirmación falsa, ningún número es igual a sí mismo más uno.\n\nEn programación es una orden perfectamente normal: agarrá lo que hay en x, sumale 1 y guardalo de nuevo en x.\n\nLo que hacen los pibes: se quedan mirando esa línea y dicen "está mal". Y tienen razón, en el idioma que aprendieron en Matemática.\n\nCómo se destraba: nombrar la diferencia. En Matemática el = afirma; en programación ordena. Hay lenguajes que lo escriben x ← x + 1 justamente por esto.',
  claseA:'Despejar con la incógnita en los dos miembros. Ver que la función lineal relaciona dos variables. Resolver un sistema por igualación y descubrir que la solución es donde se cruzan las rectas.',
  claseB:'Escribir vidas = vidas - 1 dentro de un bucle y hacer la traza en papel: una columna por variable, una fila por vuelta, para ver cómo cambia el valor paso a paso.',
  pregunta:'El sensor devuelve 512. ¿Cuántos grados hace?',
  porQue:'No se contesta solo con programación: hay que plantear la recta que pasa por dos puntos conocidos. No se contesta solo con Matemática: hay que escribirla como asignación y probar que el aparato mida bien. Es un sistema de dos ecuaciones con dos incógnitas, resuelto para que después el programa lo use.',
  vocabA:'traza: seguir a mano cómo cambian los valores paso a paso. asignación: guardar un valor en un nombre. bucle: repetir un bloque varias veces.',
  vocabB:'conjunto solución: todos los valores que hacen verdadera la ecuación. registros de representación: tabla, gráfico y fórmula como formas de lo mismo.' },

{ c:3, a:'MAT-NUM', b:'INF-A', titulo:'La condición de un si es una desigualdad',
  resumen:'La condición no es sintaxis: es matemática escrita en otro lado',
  idiomaA:'Una desigualdad como h < 30 define un conjunto de valores, no uno solo. Resolverla es describir ese conjunto y saber representarlo en la recta.',
  idiomaB:'La misma desigualdad es una expresión booleana: para un valor concreto de h devuelve verdadero o falso, y con eso el programa decide.',
  trampa:'if 30 < porcentaje < 70:',
  falsoAmigo:'En Matemática esa cadena se escribe así y se entiende perfecto. En la mayoría de los lenguajes no se puede escribir de corrido: hay que poner las dos condiciones enteras, cada una con su variable, unidas por and.\n\nLo que hacen los pibes: lo escriben como en la carpeta de Matemática, no da error evidente, y el programa hace cualquier cosa.\n\nCómo se destraba: mostrando que el programa evalúa de a una comparación por vez, no la cadena entera de un saque.',
  claseA:'Resolver inecuaciones y representar el conjunto solución en la recta numérica. Distinguir cuándo el borde entra y cuándo no.',
  claseB:'Escribir un umbral que decida cuándo regar, y probar qué pasa justo en el borde: si el 30 exacto entra o no en el riego.',
  pregunta:'¿A partir de qué número decimos que la tierra está seca?',
  porQue:'El umbral no lo dice el sensor: lo decide alguien. Elegirlo es un problema de intervalos y de datos reales; escribirlo bien es un problema de comparadores y de bordes.',
  vocabA:'booleano: un valor que solo puede ser verdadero o falso. umbral: el número a partir del cual cambia la decisión.',
  vocabB:'inecuación: como una ecuación pero con < o >, y su solución es un intervalo. intervalo: todos los números entre dos valores.' },

{ c:4, a:'MAT-PRO', b:'INF-G', titulo:'Clasificar es decidir dónde va el borde',
  resumen:'Agrupar en intervalos y clasificar comportamientos es la misma operación' },

{ c:5, a:'MAT-PRO', b:'INF-E', titulo:'Una consulta SQL es un cálculo de frecuencias',
  resumen:'La misma operación escrita en dos idiomas',
  idiomaA:'Una distribución de frecuencias agrupa los datos por categoría y cuenta cuántos hay en cada una. Después se calculan promedio, moda y mediana sobre esos grupos.',
  idiomaB:'Una consulta con GROUP BY hace exactamente eso: agrupa las filas por un campo y aplica una función a cada grupo. COUNT cuenta, AVG promedia.',
  trampa:'SELECT especie, COUNT(*) FROM avistajes GROUP BY especie',
  falsoAmigo:'Acá no hay un falso amigo sino algo mejor: es literalmente la misma operación, escrita en dos idiomas. La tabla de frecuencias de la carpeta de Matemática y el resultado de esa consulta son el mismo objeto.\n\nLo que hacen los pibes: aprenden a hacer la tabla a mano en Matemática y a escribir la consulta en Informática, sin darse cuenta nunca de que es lo mismo. Cada una queda encerrada en su materia.\n\nCómo se destraba: hacer la tabla a mano primero, después la consulta, y comparar los dos resultados en la misma pantalla.',
  claseA:'Construir tablas de distribución de frecuencias con datos reales y calcular parámetros estadísticos. Elegir el gráfico adecuado.',
  claseB:'Modelar los datos en tablas relacionadas y escribir consultas con SELECT, WHERE y GROUP BY sobre un conjunto de datos propio.',
  pregunta:'¿Qué especie se avistó más veces, y en qué época del año?',
  porQue:'La pregunta exige decidir qué agrupar y qué contar (Matemática) y expresarlo de forma que la base lo responda (Informática). Y el resultado hay que interpretarlo críticamente, que no es ninguna de las dos cosas por separado.',
  vocabA:'consulta: una pregunta escrita en un idioma que la base entiende. GROUP BY: agrupar filas que comparten un valor. clave primaria: el campo que identifica una fila sin repetirse.',
  vocabB:'frecuencia absoluta: cuántas veces aparece. frecuencia relativa: qué proporción del total representa.' },

{ c:5, a:'MAT-ALG', b:'INF-E', titulo:'Del dato a la información',
  resumen:'La expresión registros de representación aparece textual en las dos disciplinas' },
{ c:6, a:'MAT-ALG', b:'INF-G', titulo:'Costo y crecimiento',
  resumen:'Por qué hay cosas que no se pueden calcular aunque sepamos cómo' },
{ c:6, a:'MAT-GEO', b:'INF-F', titulo:'Definir por condiciones, no por enumeración',
  resumen:'Un lugar geométrico y un requerimiento se escriben igual' }
];


/**
 * Las prácticas con las que el estudiantado evidencia lo aprendido.
 * Res. 1278/24 §3.6.6.1, indicador (b) del Informe de Proceso. Es la lista
 * textual de la norma: no es nuestra y no se amplía por gusto.
 */
export const PRACTICAS = [
	'complejizar', 'relacionar', 'comprender', 'criticar', 'producir',
	'integrar', 'cuestionar', 'categorizar', 'problematizar'
];

/**
 * Los formatos pedagógicos que enumera el componente 8 de la PCA · Res. 1381/22.
 * Para el EPA de Matemática e Informática la norma fija «taller»
 * (Res. 1463/18 y Res. 1044/19).
 */
export const FORMATOS = [
	'taller', 'foro', 'seminario', 'ateneo', 'congreso',
	'proyecto de investigación', 'proyecto de extensión e intervención sociocomunitaria',
	'trabajo de campo', 'laboratorio', 'salida de campo',
	'práctica profesionalizante', 'experiencia socioeducativa de formación'
];
