import {
	pgTable, uuid, text, integer, boolean, timestamp, date,
	primaryKey, uniqueIndex, index, customType
} from 'drizzle-orm/pg-core';

/* ============================================================
   CATÁLOGO — lo que prescribe el Estado.
   Se carga por seed, no se edita desde la app.
   ============================================================ */

export const jurisdiccion = pgTable('jurisdiccion', {
	id: uuid('id').primaryKey().defaultRandom(),
	nombre: text('nombre').notNull(),
	codigo: text('codigo').notNull().unique()
});

export const diseno = pgTable('diseno', {
	id: uuid('id').primaryKey().defaultRandom(),
	jurisdiccionId: uuid('jurisdiccion_id').notNull().references(() => jurisdiccion.id),
	resolucion: text('resolucion').notNull(),
	anio: integer('anio').notNull(),
	nombre: text('nombre').notNull(),
	/** 'basico' | 'orientado'. */
	ciclo: text('ciclo').notNull().default('basico'),
	vigenciaDesde: date('vigencia_desde'),
	vigenciaHasta: date('vigencia_hasta')
}, (t) => [uniqueIndex('diseno_res_idx').on(t.jurisdiccionId, t.resolucion)]);

export const area = pgTable('area', {
	id: uuid('id').primaryKey().defaultRandom(),
	disenoId: uuid('diseno_id').notNull().references(() => diseno.id),
	nombre: text('nombre').notNull()
});

export const nudo = pgTable('nudo', {
	id: uuid('id').primaryKey().defaultRandom(),
	areaId: uuid('area_id').notNull().references(() => area.id),
	codigo: text('codigo').notNull(),
	nombre: text('nombre').notNull(),
	disciplina: text('disciplina').notNull(),        // 'matematica' | 'informatica' | 'epa'
	/** El espacio curricular al que pertenece. */
	espacioId: uuid('espacio_id').references(() => espacioCurricular.id),
	/**
	 * El mismo nudo en el diseño anterior. MAT-GEO del Orientado continúa al del
	 * Básico, complejizado. Es una fila y no una coincidencia de códigos: entre
	 * ciclos cambian hasta los nombres («Algoritmos y Programación» pasa a ser
	 * «Programación»). Vacío = nudo nuevo, no continúa a ninguno.
	 */
	continuaDe: uuid('continua_de').references((): any => nudo.id),
	transversal: boolean('transversal').notNull().default(false),
	orden: integer('orden').notNull().default(0)
}, (t) => [uniqueIndex('nudo_codigo_idx').on(t.areaId, t.codigo)]);

/** Un nudo en un cuatrimestre concreto. Los saberes van como texto. */
export const nudoCuatrimestre = pgTable('nudo_cuatrimestre', {
	id: uuid('id').primaryKey().defaultRandom(),
	nudoId: uuid('nudo_id').notNull().references(() => nudo.id),
	cuatrimestre: integer('cuatrimestre').notNull(),  // 1..10, corridos
	anioEscolar: integer('anio_escolar').notNull(),   // 1..5
	titulo: text('titulo'),
	saberes: text('saberes').notNull(),
	repiteAnterior: boolean('repite_anterior').notNull().default(false)
}, (t) => [uniqueIndex('nc_idx').on(t.nudoId, t.cuatrimestre)]);

export const vinculo = pgTable('vinculo', {
	id: uuid('id').primaryKey().defaultRandom(),
	/** Los cruces son lectura de un área, no texto de la norma: cada escuela tiene los suyos. */
	tenantId: uuid('tenant_id'),
	origen: text('origen').notNull().default('lectura'),
	nudoA: uuid('nudo_a').notNull().references(() => nudo.id),
	nudoB: uuid('nudo_b').notNull().references(() => nudo.id),
	cuatrimestre: integer('cuatrimestre').notNull(),
	titulo: text('titulo').notNull(),
	resumen: text('resumen').notNull(),
	// las cuatro partes de la traducción entre disciplinas
	idiomaA: text('idioma_a'),
	idiomaB: text('idioma_b'),
	trampa: text('trampa'),
	falsoAmigo: text('falso_amigo'),
	claseA: text('clase_a'),
	claseB: text('clase_b'),
	pregunta: text('pregunta'),
	porQue: text('por_que'),
	vocabA: text('vocab_a'),
	vocabB: text('vocab_b')
});

/* ============================================================
   INSTITUCIÓN — cómo se encarna en una escuela.
   tenant_id desde la primera migración: el white label sale de acá.
   ============================================================ */

export const escuela = pgTable('escuela', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	nombre: text('nombre').notNull(),
	jurisdiccionId: uuid('jurisdiccion_id').notNull().references(() => jurisdiccion.id),
	orientacion: text('orientacion').notNull().default(''),
	localidad: text('localidad').notNull().default(''),
	dominioWorkspace: text('dominio_workspace')
}, (t) => [index('escuela_tenant_idx').on(t.tenantId)]);

export const areaEscuela = pgTable('area_escuela', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	escuelaId: uuid('escuela_id').notNull().references(() => escuela.id),
	areaId: uuid('area_id').notNull().references(() => area.id),
	// El acuerdo de reunión del área. Lo pide el checklist institucional.
	reunionDia: integer('reunion_dia'),              // 1 lunes … 5 viernes
	reunionDesde: text('reunion_desde'),
	reunionHasta: text('reunion_hasta'),
	reunionFrecuencia: text('reunion_frecuencia')    // semanal | quincenal | mensual
}, (t) => [index('ae_tenant_idx').on(t.tenantId)]);

export const docente = pgTable('docente', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	nombre: text('nombre').notNull(),
	email: text('email').notNull(),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex('docente_email_idx').on(t.tenantId, t.email)]);

export const membresia = pgTable('membresia', {
	docenteId: uuid('docente_id').notNull().references(() => docente.id),
	areaEscuelaId: uuid('area_escuela_id').notNull().references(() => areaEscuela.id),
	rol: text('rol').notNull().default('docente'),   // docente | coordinacion | direccion
	desde: date('desde'),
	hasta: date('hasta')
}, (t) => [primaryKey({ columns: [t.docenteId, t.areaEscuelaId] })]);

export const curso = pgTable('curso', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	escuelaId: uuid('escuela_id').notNull().references(() => escuela.id),
	anioEscolar: integer('anio_escolar').notNull(),
	/** 3º A de 2026 y 3º A de 2027 son dos grupos distintos. */
	anioCalendario: integer('anio_calendario'),
	division: text('division'),
	etiqueta: text('etiqueta')
}, (t) => [index('curso_tenant_idx').on(t.tenantId)]);

export const bloque = pgTable('bloque', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	cursoId: uuid('curso_id').notNull().references(() => curso.id),
	docenteId: uuid('docente_id').references(() => docente.id),
	dia: integer('dia').notNull(),                   // 1 lunes .. 5 viernes
	desde: text('desde').notNull(),                  // "08:00"
	hasta: text('hasta').notNull(),
	/** El espacio curricular tal como lo nombra el horario oficial. */
	espacio: text('espacio').notNull().default('Matemática'),
	disciplina: text('disciplina').notNull().default('matematica'),
	/** Qué dictado es este horario. `espacio`, `disciplina` y `docente_id` salen de acá. */
	dictadoId: uuid('dictado_id').references(() => dictado.id),
	apareadoCon: uuid('apareado_con')
});

/* ============================================================
   TRABAJO — acá escriben las docentes.
   Ningún dato de estudiantes. Eso vive en el Drive de la escuela.
   ============================================================ */

/**
 * La Planificación Curricular de Área · Res. 1381/22.
 * Se elabora POR CICLO, no por año: una para el Ciclo Básico y otra para el
 * Orientado. Es un documento público, para compartir con las familias.
 */
export const planificacion = pgTable('planificacion', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	areaEscuelaId: uuid('area_escuela_id').notNull().references(() => areaEscuela.id),
	/**
	 * El alcance real de la PCA. La secundaria tiene TRES ciclos —Básico (1º y 2º),
	 * Enlace Pedagógico Interciclo (3º) y Orientado (4º y 5º)— y se promociona al
	 * terminar cada uno. Pero la Res. 1278/24 pide una sola planificación
	 * «contemplando los lineamientos para el CBC e Interciclo y su continuidad en
	 * el Ciclo Orientado», así que acá 'basico' abarca 1º a 3º.
	 */
	ciclo: text('ciclo').notNull().default('basico'),
	cuatrimestre: integer('cuatrimestre'),
	anioCalendario: integer('anio_calendario').notNull(),
	estado: text('estado').notNull().default('borrador'), // borrador | revision | presentada
	/**
	 * La Situación Inicial Grupal. No es uno de los ocho componentes: es un
	 * documento propio que reemplaza al diagnóstico áulico, escrito por el
	 * conjunto de docentes al inicio de 1º y revisado año a año.
	 */
	situacionInicial: text('situacion_inicial').notNull().default(''),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [index('plan_tenant_idx').on(t.tenantId)]);

/** Los ocho componentes de la Res. 1381/22. El 6 no se usa: es de estudiantes. */
export const componente = pgTable('componente', {
	id: uuid('id').primaryKey().defaultRandom(),
	planificacionId: uuid('planificacion_id').notNull().references(() => planificacion.id, { onDelete: 'cascade' }),
	numero: integer('numero').notNull(),
	contenido: text('contenido').notNull().default(''),
	actualizadoPor: uuid('actualizado_por').references(() => docente.id),
	actualizado: timestamp('actualizado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex('comp_idx').on(t.planificacionId, t.numero)]);

export const situacion = pgTable('situacion', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	planificacionId: uuid('planificacion_id').notNull().references(() => planificacion.id, { onDelete: 'cascade' }),
	titulo: text('titulo').notNull().default(''),
	problema: text('problema').notNull().default(''),
	medio: text('medio').notNull().default(''),
	institucionalizacion: text('institucionalizacion').notNull().default(''),
	semanaDesde: integer('semana_desde'),
	semanaHasta: integer('semana_hasta'),
	posX: integer('pos_x'),
	posY: integer('pos_y'),
	orden: integer('orden').notNull().default(0)
});

/** La relación que hace todo. El EPA se deriva de acá: no hay columna es_epa. */
export const situacionNudo = pgTable('situacion_nudo', {
	situacionId: uuid('situacion_id').notNull().references(() => situacion.id, { onDelete: 'cascade' }),
	nudoId: uuid('nudo_id').notNull().references(() => nudo.id)
}, (t) => [primaryKey({ columns: [t.situacionId, t.nudoId] })]);

export const precedencia = pgTable('precedencia', {
	antesId: uuid('antes_id').notNull().references(() => situacion.id, { onDelete: 'cascade' }),
	despuesId: uuid('despues_id').notNull().references(() => situacion.id, { onDelete: 'cascade' })
}, (t) => [primaryKey({ columns: [t.antesId, t.despuesId] })]);

export const claseDada = pgTable('clase_dada', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	cursoId: uuid('curso_id').notNull().references(() => curso.id),
	docenteId: uuid('docente_id').notNull().references(() => docente.id),
	dictadoId: uuid('dictado_id').references(() => dictado.id),
	unidadId: uuid('unidad_id').references(() => unidad.id),
	fecha: date('fecha').notNull(),
	nudoId: uuid('nudo_id').references(() => nudo.id),
	situacionId: uuid('situacion_id').references(() => situacion.id),
	notas: text('notas').notNull().default(''),
	comoVino: text('como_vino'),                    // bien | regular | costo
	seDio: boolean('se_dio').notNull().default(true)
}, (t) => [index('clase_curso_idx').on(t.tenantId, t.cursoId, t.fecha)]);

/**
 * Todo lo que pasa en el calendario del área: actividades, avisos y días sin clase.
 * `afectaClases` es el campo que decide si el evento se descuenta de las clases efectivas.
 */
export const evento = pgTable('evento', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	escuelaId: uuid('escuela_id').notNull().references(() => escuela.id),
	fecha: date('fecha').notNull(),
	hasta: date('hasta'),                            // para eventos de varios días
	tipo: text('tipo').notNull(),                    // actividad | aviso | feriado | jornada | suspension | acto | paro | clima | entrega
	titulo: text('titulo').notNull(),
	nota: text('nota').notNull().default(''),
	cursoId: uuid('curso_id').references(() => curso.id), // null = toda la escuela
	afectaClases: boolean('afecta_clases').notNull().default(false),
	creadoPor: uuid('creado_por').references(() => docente.id),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [index('evento_idx').on(t.tenantId, t.fecha)]);

export const revisionCritica = pgTable('revision_critica', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	planificacionId: uuid('planificacion_id').notNull().references(() => planificacion.id, { onDelete: 'cascade' }),
	fecha: date('fecha').notNull(),
	participantes: text('participantes').notNull().default(''),
	acuerdos: text('acuerdos').notNull().default('')
});

/** Puente a la planilla de la escuela. Guarda el id del archivo, nunca su contenido. */
export const planillaEscuela = pgTable('planilla_escuela', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	cursoId: uuid('curso_id').notNull().references(() => curso.id),
	tipo: text('tipo').notNull(),
	driveFileId: text('drive_file_id').notNull()
});


/* ============================================================
   CHECKLIST INSTITUCIONAL
   Lo que la escuela le pide al área cada tramo. Varios ítems los
   contesta la propia app con lo que ya tiene cargado.
   ============================================================ */

export const checklist = pgTable('checklist', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	areaEscuelaId: uuid('area_escuela_id').notNull().references(() => areaEscuela.id),
	periodo: text('periodo').notNull(),              // "Agosto 2026"
	fecha: date('fecha'),
	participantes: text('participantes').notNull().default(''),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex('checklist_periodo_idx').on(t.areaEscuelaId, t.periodo)]);

export const checklistItem = pgTable('checklist_item', {
	id: uuid('id').primaryKey().defaultRandom(),
	checklistId: uuid('checklist_id').notNull().references(() => checklist.id, { onDelete: 'cascade' }),
	clave: text('clave').notNull(),
	marcado: boolean('marcado').notNull().default(false),
	comentario: text('comentario').notNull().default(''),
	enlace: text('enlace').notNull().default('')
}, (t) => [uniqueIndex('checklist_item_idx').on(t.checklistId, t.clave)]);


/* ============================================================
   EPA · Espacios Pedagógicos Articulados
   En el Ciclo Básico el cruce es un vínculo entre nudos; en el
   Ciclo Orientado tiene espacio curricular propio. Acá viven los
   EPA que el área efectivamente sostiene.
   ============================================================ */

export const epa = pgTable('epa', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	areaEscuelaId: uuid('area_escuela_id').notNull().references(() => areaEscuela.id),
	nombre: text('nombre').notNull(),
	cursoId: uuid('curso_id').references(() => curso.id),
	cuatrimestre: integer('cuatrimestre'),
	anioCalendario: integer('anio_calendario').notNull(),
	estado: text('estado').notNull().default('idea'),   // idea | en curso | cerrado
	docentes: text('docentes').notNull().default(''),

	// Los campos del Mapa de Área que usa la escuela.
	proposito: text('proposito').notNull().default(''),          // Propósito o Desafío General
	nucleos: text('nucleos').notNull().default(''),              // Núcleos Problemáticos del DC
	saberes: text('saberes').notNull().default(''),              // Saberes o Ejes Temáticos
	perspectivas: text('perspectivas').notNull().default(''),
	capacidades: text('capacidades').notNull().default(''),
	mapaProyecto: text('mapa_proyecto').notNull().default(''),   // los pasos y los tiempos
	productoFinal: text('producto_final').notNull().default(''),
	productosIntermedios: text('productos_intermedios').notNull().default(''),
	revisionCritica: text('revision_critica').notNull().default(''),
	criteriosInformes: text('criterios_informes').notNull().default(''),
	/** La temática transversal que el EPA aborda. La 1463/18 la exige. */
	problematica: text('problematica').notNull().default(''),
	/** Normado en «taller» para Matemática/Informática (Res. 1463/18 y 1044/19). */
	formato: text('formato').notNull().default('taller'),
	/** La 1381/22 admite que un EPA sea interareal, no sólo entre dos disciplinas. */
	interareal: boolean('interareal').notNull().default(false),

	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [index('epa_tenant_idx').on(t.tenantId)]);

/** Cómo cada EPA se hace cargo de los objetivos institucionales del año. */
export const epaObjetivo = pgTable('epa_objetivo', {
	epaId: uuid('epa_id').notNull().references(() => epa.id, { onDelete: 'cascade' }),
	clave: text('clave').notNull(),
	como: text('como').notNull().default('')
}, (t) => [primaryKey({ columns: [t.epaId, t.clave] })]);

/** Qué nudos pone en juego cada EPA. El cruce entre disciplinas se deriva de acá. */
export const epaNudo = pgTable('epa_nudo', {
	epaId: uuid('epa_id').notNull().references(() => epa.id, { onDelete: 'cascade' }),
	nudoId: uuid('nudo_id').notNull().references(() => nudo.id)
}, (t) => [primaryKey({ columns: [t.epaId, t.nudoId] })]);


/* ============================================================
   RECURSERO
   Los documentos que el área necesita a mano: normativa, papeles
   institucionales, apps propias y herramientas de aula.
   ============================================================ */

export const recurso = pgTable('recurso', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	titulo: text('titulo').notNull(),
	categoria: text('categoria').notNull(),   // normativa | institucional | app | herramienta | dataset
	formato: text('formato').notNull().default('pdf'), // pdf | docx | web | app | video | audio | imagen
	descripcion: text('descripcion').notNull().default(''),
	enlace: text('enlace').notNull().default(''),
	fuente: text('fuente').notNull().default(''),
	orden: integer('orden').notNull().default(0),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [index('recurso_tenant_idx').on(t.tenantId)]);


/* ============================================================
   REUNIONES Y BITÁCORA DE COORDINACIÓN
   Los acuerdos se toman y se pierden. Acá quedan, con quién los
   tomó y si se cumplieron.
   ============================================================ */

export const reunion = pgTable('reunion', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	areaEscuelaId: uuid('area_escuela_id').notNull().references(() => areaEscuela.id),
	fecha: date('fecha').notNull(),
	titulo: text('titulo').notNull(),
	caracter: text('caracter').notNull().default(''),
	participantes: text('participantes').notNull().default(''),
	notas: text('notas').notNull().default(''),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [index('reunion_idx').on(t.tenantId, t.fecha)]);

/** Lo que sale de una reunión. Si no tiene responsable ni fecha, no es un acuerdo. */
export const acuerdo = pgTable('acuerdo', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	reunionId: uuid('reunion_id').references(() => reunion.id, { onDelete: 'cascade' }),
	bloque: text('bloque').notNull().default(''),
	texto: text('texto').notNull(),
	detalle: text('detalle').notNull().default(''),
	responsable: text('responsable').notNull().default(''),
	hecho: boolean('hecho').notNull().default(false),
	comoSeResolvio: text('como_se_resolvio').notNull().default(''),
	orden: integer('orden').notNull().default(0)
}, (t) => [index('acuerdo_idx').on(t.tenantId, t.hecho)]);


/* ============================================================
   PLANIFICACIONES · la realidad
   El catálogo dice qué hay que enseñar; acá va lo que cada materia
   efectivamente va a hacer con eso, cuatrimestre por cuatrimestre.
   Son dos documentos distintos y la escuela los pide por separado:
   la PCA es del área, esto es "la planificación anual de cada
   EPA/asignatura" del checklist.

   No hay tabla de materias: una materia es lo que el horario dice
   que se dicta. Si está en `bloque`, existe.
   ============================================================ */

export const planMateria = pgTable('plan_materia', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	cursoId: uuid('curso_id').notNull().references(() => curso.id),
	/** El dictado que planifica. Reemplaza a curso + espacio de texto. */
	dictadoId: uuid('dictado_id').references(() => dictado.id),
	/** El espacio curricular tal como lo nombra el horario: "Programación", "Diseño". */
	espacio: text('espacio').notNull(),
	disciplina: text('disciplina').notNull(),
	/** Corrido 1..10, igual que el catálogo: 3º año 2do cuatrimestre es el 6. */
	cuatrimestre: integer('cuatrimestre').notNull(),
	anioCalendario: integer('anio_calendario').notNull(),
	estado: text('estado').notNull().default('borrador'), // borrador | en curso | cerrado
	proposito: text('proposito').notNull().default(''),
	criterios: text('criterios').notNull().default(''),     // criterios de evaluación
	acreditacion: text('acreditacion').notNull().default(''),
	notas: text('notas').notNull().default(''),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [
	uniqueIndex('pm_idx').on(t.cursoId, t.espacio, t.cuatrimestre, t.anioCalendario),
	index('pm_tenant_idx').on(t.tenantId)
]);

/** Lo que se va a dar, en orden, con cuántas clases se le dedican. */
export const unidad = pgTable('unidad', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	planId: uuid('plan_id').notNull().references(() => planMateria.id, { onDelete: 'cascade' }),
	orden: integer('orden').notNull().default(0),
	titulo: text('titulo').notNull(),
	/** Los contenidos, tal como están escritos en el mapa de área. */
	contenidos: text('contenidos').notNull().default(''),
	/** Dónde está escrita: el link al mapa de área. */
	fuente: text('fuente').notNull().default(''),
	/** Qué se busca ver. El para qué de la unidad, en criollo. */
	busca: text('busca').notNull().default(''),
	clases: integer('clases').notNull().default(0),
	producto: text('producto').notNull().default(''),
	criterios: text('criterios').notNull().default(''),
	/** Si la unidad ES un EPA ya declarado, apunta al EPA. No lo duplica. */
	epaId: uuid('epa_id').references(() => epa.id)
}, (t) => [index('unidad_plan_idx').on(t.planId)]);

/** Qué nudos prescriptos cubre la unidad. Si toca las dos disciplinas, es un EPA. */
export const unidadNudo = pgTable('unidad_nudo', {
	unidadId: uuid('unidad_id').notNull().references(() => unidad.id, { onDelete: 'cascade' }),
	nudoId: uuid('nudo_id').notNull().references(() => nudo.id),
	/**
	 * 'da' es la unidad dictando ese nudo. 'atraviesa' es un nudo transversal
	 * que la recorre sin ser su contenido: la 1381/22 dice de Software Libre que
	 * «su abordaje se ha de realizar de manera que atraviese a los otros nudos».
	 * Por defecto 'da', para que lo ya cargado siga significando lo mismo.
	 */
	modo: text('modo').notNull().default('da')
}, (t) => [primaryKey({ columns: [t.unidadId, t.nudoId] })]);

/* ============================================================
   ACCESO — quién entra a Areal.
   Las usuarias se crean desde la terminal (`npm run usuaria`),
   no hay registro abierto.
   ============================================================ */

export const usuario = pgTable('usuario', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	docenteId: uuid('docente_id').references(() => docente.id),
	email: text('email').notNull(),
	nombre: text('nombre').notNull(),
	/** scrypt: algoritmo$sal$derivada, todo en hexadecimal. Nunca la clave. */
	clave: text('clave').notNull(),
	activa: boolean('activa').notNull().default(true),
	/** Puede dar de alta y de baja a las demás. */
	admin: boolean('admin').notNull().default(false),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow(),
	ultimoIngreso: timestamp('ultimo_ingreso', { withTimezone: true })
}, (t) => [uniqueIndex('usuario_email_idx').on(t.email)]);

/**
 * Los correos a los que cada una quiere que le llegue un aviso.
 * Van aparte del correo de acceso: con ese se entra, a estos se escribe.
 */
export const usuarioAviso = pgTable('usuario_aviso', {
	id: uuid('id').primaryKey().defaultRandom(),
	usuarioId: uuid('usuario_id').notNull().references(() => usuario.id, { onDelete: 'cascade' }),
	email: text('email').notNull(),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex('aviso_idx').on(t.usuarioId, t.email)]);

/** En qué años da clase. Lo declara cada una: el horario puede estar incompleto. */
export const usuarioAnio = pgTable('usuario_anio', {
	usuarioId: uuid('usuario_id').notNull().references(() => usuario.id, { onDelete: 'cascade' }),
	anio: integer('anio').notNull()                  // 1..5
}, (t) => [primaryKey({ columns: [t.usuarioId, t.anio] })]);

/** Una fila por sesión abierta. En la cookie viaja el token; acá se guarda su huella. */
export const sesion = pgTable('sesion', {
	huella: text('huella').primaryKey(),
	usuarioId: uuid('usuario_id').notNull().references(() => usuario.id, { onDelete: 'cascade' }),
	expira: timestamp('expira', { withTimezone: true }).notNull(),
	creada: timestamp('creada', { withTimezone: true }).notNull().defaultNow()
}, (t) => [index('sesion_usuario_idx').on(t.usuarioId)]);




/* ============================================================
   ESTRUCTURA — lo que hace que todo se pueda cruzar.
   Ver MODELO.md. Tres capas: la norma (sin tenant), la escuela
   (con tenant) y el trabajo. La llave que une lo esperable, lo
   planificado y lo dado es el tramo: nudo_cuatrimestre.
   ============================================================ */

/** Norma · Los espacios curriculares que prescribe cada diseño: Matemática, Informática, EPA. */
export const espacioCurricular = pgTable('espacio_curricular', {
	id: uuid('id').primaryKey().defaultRandom(),
	areaId: uuid('area_id').notNull().references(() => area.id),
	codigo: text('codigo').notNull(),                // MAT | INF | EPA-MI
	nombre: text('nombre').notNull(),
	disciplina: text('disciplina').notNull(),        // matematica | informatica | epa
	anios: integer('anios').array().notNull(),
	orden: integer('orden').notNull().default(0)
}, (t) => [uniqueIndex('ec_codigo_idx').on(t.areaId, t.codigo)]);

/**
 * Norma o escuela · Todo lo que se elige de una lista: perspectivas, vínculos de
 * área, objetivos, categorías, ejes institucionales, criterios de evaluación.
 * Sin tenant es texto de una resolución; con tenant es de una escuela.
 */
export const concepto = pgTable('concepto', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id'),
	tipo: text('tipo').notNull(),
	codigo: text('codigo').notNull(),
	nombre: text('nombre').notNull(),
	/** Una línea: lo que se lee en una lista. */
	resumen: text('resumen').notNull().default(''),
	texto: text('texto').notNull().default(''),
	disciplina: text('disciplina'),                  // cuando el concepto es de una sola
	disenoId: uuid('diseno_id').references(() => diseno.id),
	orden: integer('orden').notNull().default(0),
	vigenteDesde: integer('vigente_desde'),          // año calendario
	vigenteHasta: integer('vigente_hasta')
}, (t) => [
	uniqueIndex('concepto_codigo_idx').on(t.tenantId, t.tipo, t.codigo),
	index('concepto_tipo_idx').on(t.tipo)
]);

/** Qué vínculo de área (de los cuatro normativos) encarna cada cruce. */
export const vinculoConcepto = pgTable('vinculo_concepto', {
	vinculoId: uuid('vinculo_id').notNull().references(() => vinculo.id, { onDelete: 'cascade' }),
	conceptoId: uuid('concepto_id').notNull().references(() => concepto.id)
}, (t) => [primaryKey({ columns: [t.vinculoId, t.conceptoId] })]);

/** Escuela · El año lectivo y cómo se parte: cuatrimestres o trimestres, con fechas. */
export const cicloLectivo = pgTable('ciclo_lectivo', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	escuelaId: uuid('escuela_id').notNull().references(() => escuela.id),
	anio: integer('anio').notNull()
}, (t) => [uniqueIndex('cl_idx').on(t.escuelaId, t.anio)]);

export const periodo = pgTable('periodo', {
	id: uuid('id').primaryKey().defaultRandom(),
	cicloLectivoId: uuid('ciclo_lectivo_id').notNull().references(() => cicloLectivo.id, { onDelete: 'cascade' }),
	tipo: text('tipo').notNull().default('cuatrimestre'),   // cuatrimestre | trimestre
	n: integer('n').notNull(),
	nombre: text('nombre').notNull(),
	desde: date('desde').notNull(),
	hasta: date('hasta').notNull()
}, (t) => [uniqueIndex('periodo_idx').on(t.cicloLectivoId, t.tipo, t.n)]);

/**
 * Escuela · Cómo dicta la escuela un espacio curricular. Acá están las ramas:
 * Informática rama Programación e Informática rama Diseño, en 3º y 4º.
 */
export const espacioEscuela = pgTable('espacio_escuela', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	escuelaId: uuid('escuela_id').notNull().references(() => escuela.id),
	espacioCurricularId: uuid('espacio_curricular_id').notNull().references(() => espacioCurricular.id),
	/** Como lo nombra el horario: «Programación», «Matemática». */
	nombre: text('nombre').notNull(),
	rama: text('rama'),
	anios: integer('anios').array().notNull()
}, (t) => [uniqueIndex('ee_idx').on(t.escuelaId, t.espacioCurricularId, t.nombre)]);

/** Escuela · La pieza que une todo: este puesto da este espacio en este curso. */
export const dictado = pgTable('dictado', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	cursoId: uuid('curso_id').notNull().references(() => curso.id),
	espacioEscuelaId: uuid('espacio_escuela_id').notNull().references(() => espacioEscuela.id),
	puestoId: uuid('puesto_id').references(() => docente.id),
	/** Encuentros por semana. */
	encuentros: integer('encuentros').notNull().default(0),
	origen: text('origen').notNull().default('horario'),   // horario | declarado
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [
	uniqueIndex('dictado_idx').on(t.cursoId, t.espacioEscuelaId, t.puestoId),
	index('dictado_tenant_idx').on(t.tenantId)
]);

/**
 * Quién ocupa qué puesto. Reemplaza a usuario.docente_id: una persona puede
 * tener varios puestos y un puesto varias personas (en dupla).
 * Con `dictado_id` la ocupación es sólo de ese dictado; sin él, de todo el puesto.
 */
export const ocupacion = pgTable('ocupacion', {
	id: uuid('id').primaryKey().defaultRandom(),
	usuarioId: uuid('usuario_id').notNull().references(() => usuario.id, { onDelete: 'cascade' }),
	puestoId: uuid('puesto_id').notNull().references(() => docente.id),
	dictadoId: uuid('dictado_id').references(() => dictado.id, { onDelete: 'cascade' }),
	rol: text('rol').notNull().default('titular'),          // titular | suplente | dupla
	desde: date('desde'),
	hasta: date('hasta')
}, (t) => [index('ocupacion_usuario_idx').on(t.usuarioId)]);

/** El rol de una persona en el área: la coordinación es de alguien, no de un puesto. */
export const rolArea = pgTable('rol_area', {
	usuarioId: uuid('usuario_id').notNull().references(() => usuario.id, { onDelete: 'cascade' }),
	areaEscuelaId: uuid('area_escuela_id').notNull().references(() => areaEscuela.id),
	rol: text('rol').notNull(),                               // coordinacion | asesoria | direccion
	desde: date('desde'),
	hasta: date('hasta')
}, (t) => [primaryKey({ columns: [t.usuarioId, t.areaEscuelaId, t.rol] })]);

/** Qué perspectivas, categorías o criterios trabaja una unidad. */
export const unidadConcepto = pgTable('unidad_concepto', {
	unidadId: uuid('unidad_id').notNull().references(() => unidad.id, { onDelete: 'cascade' }),
	conceptoId: uuid('concepto_id').notNull().references(() => concepto.id)
}, (t) => [primaryKey({ columns: [t.unidadId, t.conceptoId] })]);


/* ============================================================
   FORMULARIOS — las encuestas del área, armadas por cualquiera.
   Cada pregunta dice por qué cosa del modelo se repite y de dónde
   salen sus opciones. Cada respuesta guarda sobre qué es y, si
   eligió cosas del modelo, sus ids: así se cruza con todo.
   ============================================================ */

export const encuesta = pgTable('encuesta', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	/** Sólo para las que siembra la app, como 'bases-2026'. */
	clave: text('clave'),
	autoraId: uuid('autora_id').references(() => usuario.id, { onDelete: 'set null' }),
	titulo: text('titulo').notNull(),
	/** Para qué es: lo primero que se lee al abrirla. */
	motivacion: text('motivacion').notNull().default(''),
	estado: text('estado').notNull().default('borrador'),   // borrador | abierta | cerrada
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow(),
	actualizado: timestamp('actualizado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [
	uniqueIndex('encuesta_clave_idx').on(t.tenantId, t.clave),
	index('encuesta_tenant_idx').on(t.tenantId)
]);

/** Los bloques de una encuesta. Bases del área tiene ocho: los nudos A a H. */
export const encuestaSeccion = pgTable('encuesta_seccion', {
	id: uuid('id').primaryKey().defaultRandom(),
	encuestaId: uuid('encuesta_id').notNull().references(() => encuesta.id, { onDelete: 'cascade' }),
	orden: integer('orden').notNull(),
	titulo: text('titulo').notNull(),
	/** A qué alimenta: «PCA 7 · Coordinación de área». */
	apunta: text('apunta').notNull().default(''),
	/** Qué queremos saber, en una línea. */
	saber: text('saber').notNull().default('')
}, (t) => [index('es_encuesta_idx').on(t.encuestaId, t.orden)]);

export const pregunta = pgTable('pregunta', {
	id: uuid('id').primaryKey().defaultRandom(),
	encuestaId: uuid('encuesta_id').notNull().references(() => encuesta.id, { onDelete: 'cascade' }),
	seccionId: uuid('seccion_id').references(() => encuestaSeccion.id, { onDelete: 'set null' }),
	orden: integer('orden').notNull(),
	texto: text('texto').notNull(),
	ayuda: text('ayuda').notNull().default(''),
	/** corta | parrafo | una | varias | si | numero | semana */
	tipo: text('tipo').notNull().default('parrafo'),
	obligatoria: boolean('obligatoria').notNull().default(false),
	clase: text('clase'),                                     // objetivo | subjetivo
	/** Se repite por cada… nada | dictado | anio | tramo | vinculo | unidad */
	por: text('por').notNull().default('nada'),
	/** De cuáles: mios (los de sus dictados) | todos */
	alcance: text('alcance').notNull().default('mios'),
	/** De dónde salen las opciones: manual | concepto:<tipo> | nudo | usuaria | puesto */
	opcionesDe: text('opciones_de').notNull().default('manual'),
	/** Si son a mano, una por renglón. */
	opciones: text('opciones').notNull().default(''),
	/** Suma «Otra» con un renglón para escribir cuál. */
	conOtra: boolean('con_otra').notNull().default(false),
	/** Qué se muestra pegado arriba para contestar sin ir a buscar: concepto:<tipo>. */
	muestra: text('muestra')
}, (t) => [index('pregunta_encuesta_idx').on(t.encuestaId, t.orden)]);

export const respuesta = pgTable('respuesta', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	preguntaId: uuid('pregunta_id').notNull().references(() => pregunta.id, { onDelete: 'cascade' }),
	usuarioId: uuid('usuario_id').notNull().references(() => usuario.id, { onDelete: 'cascade' }),
	/** Sobre qué cosa del modelo es la respuesta: 'unidad' + su id, 'anio' + '3'. Vacío si no se repite. */
	sobreTipo: text('sobre_tipo').notNull().default(''),
	sobreId: text('sobre_id').notNull().default(''),
	/** Lo escrito, o las opciones a mano elegidas, una por renglón. */
	valor: text('valor').notNull().default(''),
	/** Lo que escribió en «Otra». */
	otro: text('otro').notNull().default(''),
	actualizado: timestamp('actualizado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [
	uniqueIndex('respuesta_idx').on(t.preguntaId, t.usuarioId, t.sobreTipo, t.sobreId),
	index('respuesta_sobre_idx').on(t.sobreTipo, t.sobreId)
]);

/** Las cosas del modelo que eligió en una respuesta. Es el índice para cruzar. */
export const respuestaRef = pgTable('respuesta_ref', {
	respuestaId: uuid('respuesta_id').notNull().references(() => respuesta.id, { onDelete: 'cascade' }),
	refTipo: text('ref_tipo').notNull(),
	refId: text('ref_id').notNull()
}, (t) => [
	primaryKey({ columns: [t.respuestaId, t.refTipo, t.refId] }),
	index('rr_ref_idx').on(t.refTipo, t.refId)
]);


/* ============================================================
   EVALUACIÓN · Res. 1278/24 y Res. 1463/18
   La norma NO pide una grilla de evaluación por unidad ni por
   nudo: eso se verificó en los componentes obligatorios de la
   PCA y no está. Lo que sí exige la 1463/18, en el capítulo del
   área, es anticipar los criterios y explicitar, por cada uno,
   qué se evalúa, quién participa y qué lugar ocupa en la
   acreditación. Eso es lo que se modela.
   ============================================================ */

/**
 * Un criterio de evaluación acordado por el área. Se acuerda en colectivo
 * (Res. 1062/11) y se anticipa antes del trabajo (Res. 1463/18).
 */
export const criterioArea = pgTable('criterio_area', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	areaEscuelaId: uuid('area_escuela_id').notNull().references(() => areaEscuela.id),
	/** Si sale de una lista del marco, apunta al concepto; si es propio, va suelto. */
	conceptoId: uuid('concepto_id').references(() => concepto.id),
	nombre: text('nombre').notNull(),
	/** Los tres que la Res. 1463/18 pide explicitar. */
	queSeEvalua: text('que_se_evalua').notNull().default(''),
	quienParticipa: text('quien_participa').notNull().default(''),
	lugarAcreditacion: text('lugar_acreditacion').notNull().default(''),
	orden: integer('orden').notNull().default(0),
	vigenteDesde: integer('vigente_desde'),
	vigenteHasta: integer('vigente_hasta')
}, (t) => [index('criterio_area_idx').on(t.tenantId, t.areaEscuelaId)]);

/**
 * La Planilla de Seguimiento del corte, por dictado o EPA · Res. 1278/24 §3.6.4.
 * Son los ocho ítems que pide la norma, y es lo que después alimenta el
 * Informe de Proceso. No lleva ningún dato de estudiantes: es del grupo.
 */
export const planillaSeguimiento = pgTable('planilla_seguimiento', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	dictadoId: uuid('dictado_id').references(() => dictado.id, { onDelete: 'cascade' }),
	epaId: uuid('epa_id').references(() => epa.id, { onDelete: 'cascade' }),
	periodoId: uuid('periodo_id').notNull().references(() => periodo.id),
	itemsAreales: text('items_areales').notNull().default(''),
	categorias: text('categorias').notNull().default(''),
	practicas: text('practicas').notNull().default(''),
	conocimientosClave: text('conocimientos_clave').notNull().default(''),
	formatos: text('formatos').notNull().default(''),
	producciones: text('producciones').notNull().default(''),
	sugerencias: text('sugerencias').notNull().default(''),
	presencialidades: text('presencialidades').notNull().default(''),
	creado: timestamp('creado', { withTimezone: true }).notNull().defaultNow()
}, (t) => [index('planilla_idx').on(t.tenantId, t.periodoId)]);

/* ============================================================
   EPA · lo que lo ata al resto del modelo
   ============================================================ */

/** Quién dicta el EPA. Reemplaza al texto libre `epa.docentes`. */
export const epaDictado = pgTable('epa_dictado', {
	epaId: uuid('epa_id').notNull().references(() => epa.id, { onDelete: 'cascade' }),
	dictadoId: uuid('dictado_id').notNull().references(() => dictado.id, { onDelete: 'cascade' })
}, (t) => [primaryKey({ columns: [t.epaId, t.dictadoId] })]);

/** Perspectivas, categorías y núcleos que el EPA pone en juego, por id y no por texto. */
export const epaConcepto = pgTable('epa_concepto', {
	epaId: uuid('epa_id').notNull().references(() => epa.id, { onDelete: 'cascade' }),
	conceptoId: uuid('concepto_id').notNull().references(() => concepto.id)
}, (t) => [primaryKey({ columns: [t.epaId, t.conceptoId] })]);

/* ============================================================
   DOCUMENTOS PROPIOS
   El GPS habla de protección de estudiantes y las circulares son
   internas: no van al repositorio. Viven acá, y `/docs/<archivo>`
   los entrega sólo a quien tiene la sesión abierta.
   Se cargan una vez, desde la máquina de quien coordina:
   `npm run docs -- subir`.
   ============================================================ */

/** `bytea` no viene con drizzle. Es el archivo entero, tal cual. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => 'bytea' });

export const documento = pgTable('documento', {
	tenantId: uuid('tenant_id').notNull(),
	/** El nombre con el que se pide: `gps-protocolo.m4a`. */
	archivo: text('archivo').notNull(),
	tipo: text('tipo').notNull(),
	peso: integer('peso').notNull(),
	contenido: bytea('contenido').notNull(),
	subido: timestamp('subido', { withTimezone: true }).notNull().defaultNow()
}, (t) => [primaryKey({ columns: [t.tenantId, t.archivo] })]);
