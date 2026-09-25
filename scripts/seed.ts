import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as s from '../src/lib/server/db/schema';
import { NUDOS_BASICO, NUDOS_ORIENTADO, VINCULOS } from '../src/lib/catalogo/neuquen';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql, { schema: s });

async function main() {
	console.log('Sembrando el catálogo de Neuquén…\n');

	// Primero lo que referencia al catálogo, después el catálogo.
	// Formularios y estructura (MODELO.md): se rehacen con `npm run db:estructura`.
	await db.delete(s.respuestaRef);
	await db.delete(s.respuesta);
	await db.delete(s.pregunta);
	await db.delete(s.encuestaSeccion);
	await db.delete(s.encuesta);
	await db.delete(s.unidadConcepto);
	await db.delete(s.unidadNudo);
	await db.delete(s.claseDada);
	await db.delete(s.unidad);
	await db.delete(s.planMateria);
	await db.delete(s.ocupacion);
	await db.delete(s.rolArea);
	await db.update(s.bloque).set({ dictadoId: null });
	await db.delete(s.dictado);
	await db.delete(s.espacioEscuela);
	await db.delete(s.periodo);
	await db.delete(s.cicloLectivo);
	await db.delete(s.vinculoConcepto);
	await db.delete(s.concepto);
	await db.delete(s.acuerdo);
	await db.delete(s.reunion);
	await db.delete(s.recurso);
	await db.delete(s.epaObjetivo);
	await db.delete(s.epaNudo);
	await db.delete(s.epa);
	await db.delete(s.checklistItem);
	await db.delete(s.checklist);
	await db.delete(s.componente);
	await db.delete(s.situacionNudo);
	await db.delete(s.situacion);
	await db.delete(s.revisionCritica);
	await db.delete(s.planificacion);
	await db.delete(s.evento);
	await db.delete(s.bloque);
	await db.delete(s.membresia);
	await db.delete(s.curso);
	await db.delete(s.areaEscuela);
	await db.delete(s.docente);
	await db.delete(s.escuela);

	await db.delete(s.vinculo);
	await db.delete(s.nudoCuatrimestre);
	await db.delete(s.nudo);
	await db.delete(s.espacioCurricular);
	await db.delete(s.area);
	await db.delete(s.diseno);
	await db.delete(s.jurisdiccion);

	const [nqn] = await db.insert(s.jurisdiccion)
		.values({ nombre: 'Neuquén', codigo: 'NQN' }).returning();

	const [d1381] = await db.insert(s.diseno).values({
		jurisdiccionId: nqn.id, resolucion: 'Res. 1381/22', anio: 2022,
		nombre: 'Criterios y Secuenciación · Ciclo Básico Común y Enlace Interciclo',
		vigenciaDesde: '2022-01-01'
	}).returning();

	const [d1578] = await db.insert(s.diseno).values({
		jurisdiccionId: nqn.id, resolucion: 'Res. 1578/26', anio: 2026,
		nombre: 'Conocimientos y Saberes · Ciclo Orientado',
		vigenciaDesde: '2026-01-01'
	}).returning();

	const [aBasico] = await db.insert(s.area)
		.values({ disenoId: d1381.id, nombre: 'Matemática e Informática' }).returning();
	const [aOrient] = await db.insert(s.area)
		.values({ disenoId: d1578.id, nombre: 'Matemática e Informática' }).returning();

	// Un mapa por diseño: los códigos se repiten entre ciclos y con uno solo el
	// Orientado pisaba al Básico. Eso hacía que los cruces de 1º a 3º apuntaran a
	// nudos del Orientado.
	const porCodigo = new Map<string, string>();          // Básico
	const porCodigoOrient = new Map<string, string>();
	/** El nudo de un código según el año escolar: hasta 3º manda el Básico. */
	const nudoDe = (codigo: string, anio: number) =>
		(anio >= 4 ? porCodigoOrient.get(codigo) : porCodigo.get(codigo)) ??
		porCodigo.get(codigo) ?? porCodigoOrient.get(codigo);

	async function cargar(defs: typeof NUDOS_BASICO, areaId: string, orientado = false) {
		let orden = 0;
		for (const n of defs) {
			// `continuaDe` viene por código del Básico y acá se vuelve una clave foránea.
			const viene = orientado && n.continuaDe ? porCodigo.get(n.continuaDe) ?? null : null;
			if (orientado && n.continuaDe && !viene)
				throw new Error(`${n.codigo} dice continuar a ${n.continuaDe}, que no existe en el Básico.`);
			if (orientado && n.continuaDe === undefined)
				throw new Error(`${n.codigo} no declara si continúa a un nudo del Básico o si es nuevo.`);
			const [fila] = await db.insert(s.nudo).values({
				areaId, codigo: n.codigo, nombre: n.nombre, continuaDe: viene,
				disciplina: n.disciplina, transversal: !!n.transversal, orden: orden++
			}).returning();
			(orientado ? porCodigoOrient : porCodigo).set(n.codigo, fila.id);
			for (const c of n.cuatris) {
				await db.insert(s.nudoCuatrimestre).values({
					nudoId: fila.id, cuatrimestre: c.c, anioEscolar: c.anio,
					titulo: c.titulo ?? null, saberes: c.saberes, repiteAnterior: !!c.repite
				});
			}
			console.log(`  ${n.codigo.padEnd(9)} ${String(n.cuatris.length).padStart(2)} cuatrimestre(s)  ${n.nombre}`);
		}
	}

	console.log('Ciclo Básico y Enlace Interciclo · Res. 1381/22');
	await cargar(NUDOS_BASICO, aBasico.id);
	console.log('\nCiclo Orientado · Res. 1578/26');
	await cargar(NUDOS_ORIENTADO, aOrient.id, true);

	// Los que no siguen en el Orientado: no es un olvido, la 1044/19 los deja afuera.
	const siguen = new Set(NUDOS_ORIENTADO.map((n) => n.continuaDe).filter(Boolean));
	const cortan = NUDOS_BASICO.filter((n) => !siguen.has(n.codigo));
	if (cortan.length)
		console.log(`\nNo continúan en el Ciclo Orientado: ` +
			cortan.map((n) => `${n.codigo} (${n.nombre})`).join(' · '));

	console.log('\nVínculos');
	let conDetalle = 0;
	for (const v of VINCULOS) {
		// Hasta el cuatrimestre 6 el cruce es del Ciclo Básico.
		const anio = Math.ceil(v.c / 2);
		const a = nudoDe(v.a, anio), b = nudoDe(v.b, anio);
		if (!a || !b) { console.warn(`  ! nudo faltante en ${v.a}×${v.b}`); continue; }
		await db.insert(s.vinculo).values({
			nudoA: a, nudoB: b, cuatrimestre: v.c, titulo: v.titulo, resumen: v.resumen,
			idiomaA: v.idiomaA ?? null, idiomaB: v.idiomaB ?? null,
			trampa: v.trampa ?? null, falsoAmigo: v.falsoAmigo ?? null,
			claseA: v.claseA ?? null, claseB: v.claseB ?? null,
			pregunta: v.pregunta ?? null, porQue: v.porQue ?? null,
			vocabA: v.vocabA ?? null, vocabB: v.vocabB ?? null
		});
		if (v.falsoAmigo) conDetalle++;
		console.log(`  C${String(v.c).padStart(2)}  ${v.a} × ${v.b}  ${v.falsoAmigo ? '✓ escrito' : '· por escribir'}`);
	}


	/* ─────── Institución: la escuela, sus cursos y la grilla del área ─────── */


	const tenant = '00000000-0000-4000-8000-000000000001';

	const [esc] = await db.insert(s.escuela).values({
		tenantId: tenant, jurisdiccionId: nqn.id,
		nombre: 'EEM Don Jaime de Nevares I 040'
	}).returning();

	const [ae] = await db.insert(s.areaEscuela).values({
		tenantId: tenant, escuelaId: esc.id, areaId: aBasico.id,
		// La ventana que encontramos en la grilla: las cuatro están libres.
		reunionDia: 3, reunionDesde: '09:35', reunionHasta: '10:50', reunionFrecuencia: 'quincenal'
	}).returning();

	// En la base van los puestos del área, no las personas: los nombres propios
	// viven en las cuentas de usuaria y en ningún otro lado.
	const { PERSONAS } = await import('./personas');
	const docs = await db.insert(s.docente).values(
		PERSONAS.map((p) => ({ tenantId: tenant, nombre: p.nombre, email: p.email }))
	).returning();
	/** Por clave estable, no por nombre: así la grilla no depende de quién esté. */
	const D = Object.fromEntries(PERSONAS.map((p, i) => [p.clave, docs[i].id]));
	const nom = (clave: string) => PERSONAS.find((p) => p.clave === clave)!.nombre;

	await db.insert(s.membresia).values(docs.map((d) => ({
		docenteId: d.id, areaEscuelaId: ae.id,
		rol: PERSONAS[docs.indexOf(d)].rol ?? 'docente'
	})));

	const cursos = await db.insert(s.curso).values(
		[1, 2, 3, 4, 5].map((a) => ({
			tenantId: tenant, escuelaId: esc.id, anioEscolar: a, etiqueta: `${a}º año`
		}))
	).returning();
	const C = Object.fromEntries(cursos.map((c) => [c.anioEscolar, c.id]));

	// Grilla real del área, según los horarios oficiales actualizados 03/08/2026.
	// dia: 1 lunes … 5 viernes
	const grilla: [number, number, string, string, string, string][] = [
		[1, 4, '08:00', '09:20', 'mate-basico',    'Matemática'],
		[1, 1, '12:20', '13:00', 'mate-basico',    'Matemática'],
		[1, 3, '11:00', '13:00', 'programacion',   'Informática'],
		[2, 2, '08:00', '08:40', 'mate-basico',    'Matemática'],
		[2, 4, '09:35', '10:50', 'mate-basico',    'Matemática'],
		[2, 4, '11:00', '13:00', 'programacion',   'Informática'],
		[3, 3, '08:00', '09:20', 'mate-basico',    'Matemática'],
		[3, 1, '09:35', '10:50', 'mate-basico',    'Matemática'],
		[3, 3, '08:00', '09:20', 'programacion',   'Programación'],
		[3, 1, '09:35', '10:50', 'diseno',         'Diseño'],
		[4, 4, '09:35', '10:50', 'mate-orientado', 'Matemática'],
		[4, 5, '09:35', '10:50', 'mate-orientado', 'Matemática'],
		[4, 4, '09:35', '10:50', 'programacion',   'Programación'],
		[4, 5, '09:35', '10:50', 'diseno',         'Diseño'],
		[5, 1, '11:00', '12:20', 'mate-basico',    'Matemática'],
		[5, 5, '10:10', '11:40', 'mate-basico',    'Matemática']
	];
	await db.insert(s.bloque).values(grilla.map(([anio, dia, desde, hasta, quien, espacio]) => ({
		tenantId: tenant, cursoId: C[anio], docenteId: D[quien], dia, desde, hasta, espacio,
		disciplina: espacio === 'Matemática' ? 'matematica' : 'informatica'
	})));

	/* ─────── Calendario institucional ───────
	   Feriados nacionales más todo lo que fija la Circular técnica 02/2026,
	   "Fechas 1° cuatrimestre 2026", del 09 de marzo. */

	type Ev = { f: string; hasta?: string; tipo: string; t: string; pierde: boolean; anio?: number; nota?: string };
	const agenda: Ev[] = [
		// Feriados nacionales que caen en día hábil
		{ f: '2026-03-23', tipo: 'feriado', t: 'Feriado nacional', pierde: true },
		{ f: '2026-03-24', tipo: 'feriado', t: 'Día de la Memoria', pierde: true },
		{ f: '2026-04-02', tipo: 'feriado', t: 'Malvinas', pierde: true },
		{ f: '2026-04-03', tipo: 'feriado', t: 'Viernes Santo', pierde: true },
		{ f: '2026-05-01', tipo: 'feriado', t: 'Día del Trabajador', pierde: true },
		{ f: '2026-05-25', tipo: 'feriado', t: 'Revolución de Mayo', pierde: true },
		{ f: '2026-06-15', tipo: 'feriado', t: 'Feriado nacional', pierde: true,
		  nota: 'Belgrano, trasladado al lunes. Lo fija la Circular 02/2026.' },
		{ f: '2026-07-09', tipo: 'feriado', t: 'Día de la Independencia', pierde: true },
		{ f: '2026-07-10', tipo: 'feriado', t: 'Día turístico', pierde: true },
		{ f: '2026-08-17', tipo: 'feriado', t: 'San Martín', pierde: true },
		{ f: '2026-10-12', tipo: 'feriado', t: 'Diversidad Cultural', pierde: true },
		{ f: '2026-11-23', tipo: 'feriado', t: 'Soberanía Nacional', pierde: true },

		// Jornadas institucionales
		{ f: '2026-03-19', tipo: 'jornada', t: 'Jornada Institucional', pierde: true },
		{ f: '2026-04-14', tipo: 'jornada', t: 'Jornada Institucional', pierde: true },
		{ f: '2026-05-13', tipo: 'jornada', t: 'Jornada Institucional', pierde: true },
		{ f: '2026-06-25', tipo: 'jornada', t: 'Jornada Institucional', pierde: true },

		// Actos, asuetos y fiestas
		{ f: '2026-04-08', tipo: 'acto', t: 'Fiesta de la Pascua', pierde: true },
		{ f: '2026-04-17', tipo: 'acto', t: 'Asueto · Día del profesor neuquino', pierde: true },
		{ f: '2026-05-19', tipo: 'acto', t: 'Fiesta de Don Jaime y las Santas', pierde: true },

		// Salidas, por curso
		{ f: '2026-03-19', hasta: '2026-03-20', tipo: 'actividad', t: 'Salida Huella Andina', pierde: true, anio: 4 },
		{ f: '2026-03-19', hasta: '2026-03-20', tipo: 'actividad', t: 'Salida Huella Andina', pierde: true, anio: 5 },
		{ f: '2026-04-29', hasta: '2026-05-01', tipo: 'actividad', t: 'Mar Adentro', pierde: true, anio: 5 },

		// Entregas y avisos del área
		{ f: '2026-04-10', tipo: 'entrega', t: 'Fecha límite para presentar planificaciones', pierde: false },
		{ f: '2026-05-29', tipo: 'entrega', t: 'Última fecha para presentar los PPI', pierde: false },
		{ f: '2026-04-27', hasta: '2026-04-30', tipo: 'aviso', t: 'Elaboración de informes de mitad de cuatrimestre', pierde: false },
		{ f: '2026-05-07', tipo: 'aviso', t: 'Reunión de familias y docentes para informes', pierde: false },
		{ f: '2026-06-22', tipo: 'aviso', t: 'Sin clase en el turno tarde', pierde: false,
		  nota: 'La circular avisa que no está contemplado en su propio cuadro de días.' },
		{ f: '2026-07-02', hasta: '2026-07-08', tipo: 'aviso', t: 'Período de Fortalecimiento del 1° cuatrimestre', pierde: true,
		  nota: 'No son clases regulares: por eso el cuadro de la circular cuenta hasta el 03-07.' },
		{ f: '2026-07-08', tipo: 'aviso', t: 'Fin del 1° cuatrimestre', pierde: false },

		// 2° cuatrimestre: sólo lo que está documentado. La circular de fechas
		// todavía no salió, así que el resto del cuatrimestre está vacío a propósito.
		{ f: '2026-09-15', tipo: 'entrega', t: 'Tope de compras del FabLab', pierde: false,
		  nota: 'Acuerdo con el FabLab de Villa La Angostura del 27/08.' },
		{ f: '2026-11-27', tipo: 'aviso', t: 'Fin de clases', pierde: false,
		  nota: 'Calendario Escolar 2026, Res. CPE 1980/25.' }
	];

	await db.insert(s.evento).values(agenda.map((e) => ({
		tenantId: tenant, escuelaId: esc.id, fecha: e.f, hasta: e.hasta ?? null,
		tipo: e.tipo, titulo: e.t, nota: e.nota ?? '',
		cursoId: e.anio ? C[e.anio] : null, afectaClases: e.pierde
	})));

	/* ─────── Los mapas de área, con la estructura que usa la escuela ─────── */

	const mapas = [
		{
			nombre: 'Matemática e Informática · 3º año', anio: 3, cuatri: 6, estado: 'en curso',
			docentes: `${nom('programacion')} (Programación) · ${nom('diseno')} (Diseño) · ${nom('mate-basico')} (Matemática)`,
			nudos: ['MAT-ALG', 'MAT-NUM', 'INF-A'],
			proposito: 'Durante 2026 Matemática trabaja en equipo con Informática. Las dos materias no comparten horas áulicas: el curso se divide en dos porque Informática tiene dos ramas elegidas por los alumnos, Programación y Diseño. Las clases van Matemática + Diseño y Matemática + Programación, así que los contenidos de ambas se tienen que ir sincronizando. Ahí está el desafío.',
			saberes: 'Matemática — Unidad 1: función lineal y sistemas de funciones lineales. Ejes coordenados, dominio e imagen, pendiente y ordenada, raíz, resolución analítica y gráfica, rectas paralelas y perpendiculares, distancia entre dos puntos. Unidad 2: función cuadrática, parábola, desplazamientos, máximos y mínimos, forma polinómica y canónica. Unidad 3: sistemas mixtos, función cúbica e inversa.',
			capacidades: 'Resolución de problemas propuestos y emergentes. Comunicación y trabajo grupal. Participación activa durante las clases. Pensamiento crítico.',
			revisionCritica: 'La Revisión Crítica es la nueva manera de llamar y pensar la Evaluación. Falta definir en qué pasos del proyecto se hace, con qué criterios, cuándo y cómo se los transmitimos a los estudiantes y qué herramientas usamos.'
		},
		{
			nombre: 'Informática y Matemática · 4º año', anio: 4, cuatri: 8, estado: 'en curso',
			docentes: `${nom('diseno')} (Informática · Diseño) · ${nom('programacion')} (Informática · Programación) · ${nom('mate-orientado')} (Matemática)`,
			nudos: ['MAT-PRO', 'INF-A', 'INF-E', 'INF-H', 'INF-D'],
			proposito: 'El curso se organiza desdoblado según Programación y Diseño, ramas elegidas por los propios estudiantes, con duplas pedagógicas Matemática + Diseño y Matemática + Programación. Aunque no comparten aula, el trabajo se articula por proyectos interdisciplinarios. El objetivo central es potenciar la motivación vinculando el contexto local con el pensamiento computacional. El tópico generativo parte de la pregunta: ¿cómo podemos conocer, medir y contar el territorio que habitamos usando matemática e informática como herramientas de investigación?',
			nucleos: 'La resolución de problemas como medio de construcción de conocimiento situado: los dos ABP parten de problemas reales y los contenidos entran al servicio de esos problemas. La integración del conocimiento: ambas disciplinas trabajan sobre los mismos datos, mate formaliza e informática implementa. La consideración del contexto: el territorio de Villa La Angostura es el contexto de todo el año, con datos locales y herramientas argentinas y libres. Comprensión y alteridad: el trabajo colaborativo exige negociar perspectivas y reconocer que un dato puede leerse de maneras distintas. El pensamiento crítico y el procedural: el Ciclo de Datos aplicado, la distinción entre observación, interpretación y opinión.',
			saberes: 'Matemática — trigonometría, probabilidad y estadística. Informática/Diseño — relación texto e imagen en la comunicación, cartelería impresa situada y digital. Informática/Programación — Python como herramienta de investigación, incorporado progresivamente: Pandalyze (bloques sobre pandas, UNLP) → Python/pandas directo → scripts para sensores Arduino. Programación web (HTML y CSS) para el portfolio. Bases de datos: dato → información → conocimiento, SQLite para lecturas de sensores. Filosofía del software libre, transversal: cada elección de herramienta es una decisión política. Seguridad y legislación: privacidad al publicar datos y fotos, derecho de imagen, licencias, Ley 25.326.',
			mapaProyecto: 'ABP 1 · VLA en datos (otoño-invierno): investigación territorial con datos abiertos. Cada grupo tiene una pregunta propia sobre Villa La Angostura —flora nativa contra invasoras, turismo, fauna, estaciones— y la responde con datos reales, usando el Ciclo de Datos como metodología y herramientas progresivas. ABP 2 · Huerta inteligente (primavera): prototipado con electrónica y sensores para resolver un problema real de la huerta escolar, riego automatizado o monitoreo de temperatura y humedad. Integra todo lo del ABP 1 y lo aplica a un sistema funcional.',
			capacidades: 'Actitud crítica y creativa capaz de proponer soluciones a situaciones o problemas, conectando los contenidos académicos con los intereses de la vida cotidiana.'
		}
	];

	for (const m of mapas) {
		const [fila] = await db.insert(s.epa).values({
			tenantId: tenant, areaEscuelaId: ae.id, nombre: m.nombre,
			cursoId: C[m.anio], cuatrimestre: m.cuatri, anioCalendario: 2026,
			estado: m.estado, docentes: m.docentes,
			proposito: m.proposito ?? '', nucleos: m.nucleos ?? '', saberes: m.saberes ?? '',
			capacidades: m.capacidades ?? '', mapaProyecto: m.mapaProyecto ?? '',
			revisionCritica: m.revisionCritica ?? ''
		}).returning();
		for (const cod of m.nudos) {
			const id = nudoDe(cod, m.anio);
			if (id) await db.insert(s.epaNudo).values({ epaId: fila.id, nudoId: id });
		}
		for (const o of ['menos-miramos', 'conflictos', 'familias', 'impacto',
		                 'capacitacion', 'fuera-aula', 'interdisc', 'roles']) {
			await db.insert(s.epaObjetivo).values({ epaId: fila.id, clave: o });
		}
	}

	/* ─────── Recursero ─────── */

	const recursos: [string, string, string, string, string, string][] = [
		// título, categoría, formato, descripción, enlace, fuente
		['GPS · Guía de Protección y Sentido', 'institucional', 'pdf',
		 'Hoja de ruta para actuar ante situaciones que involucren a estudiantes, desde un enfoque de protección integral de derechos. Elaborada en el Taller Docente de abril de 2026. Tres principios: interés superior, prioridad absoluta y convivencia familiar.',
		 '/docs/gps-hoja-de-ruta.pdf', 'Escuela · Ley Provincial 2302 y orientaciones del EAOPIE'],
		['GPS · la hoja de ruta en una imagen', 'institucional', 'imagen',
		 'El esquema completo del GPS en una sola lámina, para tener a mano.',
		 '/docs/gps-hoja-de-ruta.png', 'Escuela · Taller Docente de abril 2026'],
		['GPS · protocolo para estudiantes vulnerables', 'institucional', 'audio',
		 'La versión hablada del protocolo, para escuchar.',
		 '/docs/gps-protocolo.m4a', 'Escuela'],
		['Circular técnica 01/2026 · Funcionamiento general', 'institucional', 'pdf',
		 'Cómo funciona la escuela: referentes, aspectos de enseñanza, documentación administrativa y pedagógica, convivencia y los ejes de trabajo del año.',
		 '/docs/circular-01-2026.pdf', 'Escuela · 2026'],
		['Circular técnica 02/2026 · Fechas del cuatrimestre', 'institucional', 'pdf',
		 'Cuadro de días de clase y todas las fechas institucionales del primer cuatrimestre. Ya está volcada al calendario de Areal.',
		 '/docs/circular-02-2026.pdf', 'Escuela · 9 de marzo de 2026'],
		['Mapa de Área · el molde', 'institucional', 'docx',
		 'El formato que usa la escuela para los mapas de área y las planificaciones de proyecto. Es la estructura que replica la sección EPA de Areal.',
		 '', 'Drive institucional · Planificaciones y Mapas de área 2026'],
		['PCA de otras áreas', 'institucional', 'docx',
		 'Las Planificaciones Curriculares de Área de Naturales y de Sociales, útiles como referencia de extensión y tono.',
		 '', 'Drive institucional · PCA ÁREAS'],

		['Res. 1381/22 · Secuenciación', 'normativa', 'pdf',
		 'Criterios y secuenciación de conocimientos y saberes, y los ocho componentes de la Planificación Curricular de Área. Es la que se usa para programar.',
		 '', 'CPE Neuquén'],
		['Res. 1463/18 · Diseño Curricular', 'normativa', 'pdf',
		 'Nueva Escuela Secundaria Neuquina. Los nudos del área y los vínculos entre disciplinas.', '', 'CPE Neuquén'],
		['Res. 1044/19 · Ciclo Orientado', 'normativa', 'pdf',
		 'Los nudos del Ciclo Orientado. El Anexo XIII es el de Bachiller en Turismo.', '', 'CPE Neuquén'],
		['Res. 1578/26 · Conocimientos y Saberes', 'normativa', 'pdf',
		 'Conocimientos y saberes del Ciclo Orientado, por cuatrimestre. Define el EPA Matemática/Informática con nudos propios.', '', 'CPE Neuquén'],
		['Res. 1399/24 · Coordinaciones de Área', 'normativa', 'pdf',
		 'Funciones, elección y designación de las coordinaciones de área.', '', 'CPE Neuquén'],
		['Res. 1673/19 · Regulaciones', 'normativa', 'pdf',
		 'Regulaciones político pedagógicas. La Revisión Crítica y los equipos de trabajo escolar.', '', 'CPE Neuquén'],

		['Tecnologías para el territorio', 'app', 'app',
		 'Salas de conceptos de programación en pseudocódigo, autocorregidas, con escenario animado y modo Jr. Taller de robótica por unidades con placa simulada.',
		 'https://ysyry.github.io/tecnologias-territoriales/', 'Del área · software libre'],
		['Explorando datos', 'app', 'app',
		 'Armar consultas sobre un CSV paso a paso, con filtros encadenados, y ver el Python real de cada consulta.',
		 'https://ysyry.github.io/explorando-datos-edu/', 'Del área · software libre'],

		['Scratch', 'herramienta', 'web', 'Primeros programas, laberintos, historia animada, videojuego.', 'https://scratch.mit.edu', ''],
		['Wokwi', 'herramienta', 'web', 'Simulador de Arduino con protoboard, antes de tocar el hardware.', 'https://wokwi.com', ''],
		['Tinkercad Circuits', 'herramienta', 'web', 'Alternativa a Wokwi, con vista de protoboard más visual.', 'https://www.tinkercad.com/circuits', ''],
		['Teachable Machine', 'herramienta', 'web', 'Entrenar un clasificador sin código y ver cómo se equivoca.', 'https://teachablemachine.withgoogle.com', ''],
		['ArgentiNat', 'herramienta', 'web', 'Datos reales de biodiversidad: nativas, exóticas, Isla Victoria.', 'https://www.argentinat.org', ''],
		['OpenStreetMap', 'herramienta', 'web', 'Mapeo del territorio para el EPA.', 'https://www.openstreetmap.org', ''],
		['Pandalyze', 'herramienta', 'web', 'Análisis de datos con bloques sobre pandas. Hecho en la UNLP, software libre.', '', 'UNLP']
	];

	await db.insert(s.recurso).values(recursos.map(([titulo, categoria, formato, descripcion, enlace, fuente], i) => ({
		tenantId: tenant, titulo, categoria, formato, descripcion, enlace, fuente, orden: i
	})));

	/* ─────── Bitácora de coordinación ─────── */

	const [r1] = await db.insert(s.reunion).values({
		tenantId: tenant, areaEscuelaId: ae.id, fecha: '2026-08-28',
		titulo: 'Primera reunión de coordinación',
		participantes: `Asesora pedagógica · Coordinación de Lenguajes · ${nom('programacion')} (coordinadora de Matemática e Informática)`,
		caracter: 'Puesta en marcha de la figura de coordinación. Buena parte del tiempo fue definir qué hace falta construir antes de poder coordinar: hoy la coordinación no tiene instrumentos propios.',
		notas: [
			'LOS DOS OBJETIVOS QUE ORDENAN EL TRABAJO',
			'1. Mejorar la articulación entre profes del área.',
			'2. Que haya un hito en el cuatrimestre donde los estudiantes vivencien la articulación del área: no que exista en los papeles, sino que se note en el aula.',
			'',
			'El segundo objetivo es el que da la vara. Si al terminar el cuatrimestre no hubo un momento en que los estudiantes sintieron que las dos materias eran una sola cosa, la articulación no ocurrió, por más que esté escrita en las planificaciones.',
			'',
			'EL HITO DE ARTICULACIÓN · CANDIDATOS',
			'1º y 2º — la propuesta articulada del cuatrimestre con corte evaluativo. Es obligación de la Res. 1381/22 y hoy no está definida.',
			'3º — la calibración del sensor del 30/09, en dupla con Matemática. Es el momento en que la función lineal y la función del programa son literalmente el mismo objeto, con el aparato sobre la mesa.',
			'4º — la unidad de modelado y publicación de datos, con probabilidad y estadística en paralelo.',
			'Transversal — Paseo Don Jaime, octubre. Ya es institucional y ya tiene público externo.',
			'Vertical — el traspaso de datos de 3º a 4º. Un curso produce para otro.',
			'',
			'CRITERIO PARA ELEGIR: que el estudiante pueda contar qué pasó sin usar la palabra articulación. Si hay que explicárselo, no fue un hito.',
			'',
			'OBSERVACIÓN',
			'Hay dos áreas construyendo lo mismo al mismo tiempo, Matemática e Informática y Lenguajes. Las herramientas del bloque 2 no son específicas de un área: conviene diseñarlas una sola vez con Dani y que cada área las llene.'
		].join('\n')
	}).returning();

	const acuerdos: [string, string, string, boolean, string][] = [
		// bloque, texto, detalle, hecho, cómo se resolvió
		['Saber quiénes somos', 'Mapa de profes del área',
		 'Quién da qué materia, en qué cursos, con qué carga horaria.', true,
		 'En Areal: las cuatro docentes con su espacio curricular y sus bloques.'],
		['Saber quiénes somos', 'Grilla de horarios del área',
		 'Para ver dónde hay coincidencias posibles de encuentro.', true,
		 'En Areal: los dieciséis bloques reales, pintados en el calendario. Apareció la ventana de los miércoles 9:35 a 10:50, con las cuatro libres.'],
		['Saber quiénes somos', 'Datos de contacto y canal de comunicación del área', '', false, ''],
		['Herramientas de la coordinación', 'Recursero',
		 'Índice compartido por curso y por nudo, con enlace a cada recurso y quién lo hizo.', true,
		 'En Areal: veintidós entradas en cuatro grupos. Falta la parte de por nudo y quién lo hizo.'],
		['Herramientas de la coordinación', 'Bitácoras',
		 'Una entrada por reunión, con tareas y responsables.', true,
		 'Esta sección.'],
		['Herramientas de la coordinación', 'Actualizador',
		 'Un canal único de novedades del área con formato fijo: qué cambió, desde cuándo, a quién afecta.', false, ''],
		['Herramientas de la coordinación', 'Planillas',
		 'Estado de planificaciones, asistencia a reuniones, seguimiento de acuerdos.', false, ''],
		['Formación', 'Buscar formaciones para el área',
		 'Acordado: primero el mapa y las herramientas, después la formación.', false, ''],
		['A definir con la asesora', 'Frecuencia y día de las reuniones de coordinación', '', false, ''],
		['A definir con la asesora', 'Si la bitácora se comparte con dirección, y en qué formato', '', false, ''],
		['A definir con la asesora', 'Qué se espera como producto de la coordinación al cierre del cuatrimestre', '', false, ''],
		['A definir con la asesora', 'Si hay horas institucionales asignadas a la coordinación, y cuántas', '', false, ''],
		['Próximos pasos', 'Acordar con Dani el formato común de las herramientas', '', false, ''],
		['Próximos pasos', 'Llevar el hito de articulación elegido, con fecha y con quiénes lo sostienen', '', false, '']
	];

	await db.insert(s.acuerdo).values(acuerdos.map(([bloque, texto, detalle, hecho, como], i) => ({
		tenantId: tenant, reunionId: r1.id, bloque, texto, detalle, hecho,
		comoSeResolvio: como, responsable: 'Flor', orden: i
	})));

	console.log(`\nEscuela: ${esc.nombre}`);
	console.log(`  ${docs.length} docentes · ${cursos.length} cursos · ${grilla.length} bloques · ${agenda.length} eventos · ${recursos.length} recursos · ${acuerdos.length} acuerdos`);

	const nudos = await db.select().from(s.nudo);
	const ncs = await db.select().from(s.nudoCuatrimestre);
	console.log(`\n${nudos.length} nudos · ${ncs.length} filas nudo×cuatrimestre · ` +
	            `${VINCULOS.length} vínculos (${conDetalle} con la traducción escrita)`);
	await sql.end();
}

main().catch(async (e) => { console.error(e); await sql.end(); process.exit(1); });
