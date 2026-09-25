import { db, schema as s } from '$lib/server/db';
import { asc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

/** Un nudo a lo largo de todos los cuatrimestres en que la norma lo prescribe. */
export interface Pista {
	codigo: string;
	nombre: string;
	disciplina: string;
	transversal: boolean;
	orden: number;
	pasos: {
		c: number;
		anio: number;
		titulo: string | null;
		saberes: string;
		repite: boolean;
		nombre: string;
		resolucion: string;
	}[];
}

export const load: PageServerLoad = async () => {
	const filas = await db
		.select({
			id: s.nudo.id,
			continuaDe: s.nudo.continuaDe,
			codigo: s.nudo.codigo,
			nombre: s.nudo.nombre,
			disciplina: s.nudo.disciplina,
			transversal: s.nudo.transversal,
			orden: s.nudo.orden,
			anioDiseno: s.diseno.anio,
			resolucion: s.diseno.resolucion,
			c: s.nudoCuatrimestre.cuatrimestre,
			anio: s.nudoCuatrimestre.anioEscolar,
			titulo: s.nudoCuatrimestre.titulo,
			saberes: s.nudoCuatrimestre.saberes,
			repite: s.nudoCuatrimestre.repiteAnterior
		})
		.from(s.nudoCuatrimestre)
		.innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
		.innerJoin(s.area, eq(s.area.id, s.nudo.areaId))
		.innerJoin(s.diseno, eq(s.diseno.id, s.area.disenoId))
		.orderBy(asc(s.nudoCuatrimestre.cuatrimestre));

	// Un mismo nudo cruza de ciclo: MAT-GEO en 2º y en 4º es el mismo, complejizado.
	// Quién continúa a quién lo dice `nudo.continua_de`, no la coincidencia de códigos:
	// entre ciclos cambian los nombres y los códigos podrían cambiar también.
	const raiz = new Map<string, string>();
	for (const f of filas) raiz.set(f.id, f.continuaDe ?? f.id);
	const tronco = (id: string): string => {
		const arriba = raiz.get(id);
		return !arriba || arriba === id ? id : tronco(arriba);
	};

	const pistas = new Map<string, Pista>();
	for (const f of filas) {
		const llave = tronco(f.id);
		let p = pistas.get(llave);
		if (!p) {
			p = {
				codigo: f.codigo,
				nombre: f.nombre,
				disciplina: f.disciplina,
				transversal: f.transversal,
				// El orden del Ciclo Básico manda; los que sólo existen en el Orientado van después.
				orden: f.anioDiseno === 2022 ? f.orden : 100 + f.orden,
				pasos: []
			};
			pistas.set(llave, p);
		} else if (f.anioDiseno === 2022) {
			p.nombre = f.nombre;
			p.orden = f.orden;
			p.transversal = p.transversal || f.transversal;
		}
		p.pasos.push({
			c: f.c,
			anio: f.anio,
			titulo: f.titulo,
			saberes: f.saberes,
			repite: f.repite,
			nombre: f.nombre,
			resolucion: f.resolucion
		});
	}

	const nudos = await db.select({ id: s.nudo.id, codigo: s.nudo.codigo }).from(s.nudo);
	const cod = new Map(nudos.map((n) => [n.id, n.codigo]));

	const hilos = await db.select().from(s.vinculo).orderBy(asc(s.vinculo.cuatrimestre));

	return {
		pistas: [...pistas.values()].sort((x, y) => x.orden - y.orden),
		hilos: hilos.map((v) => ({
			c: v.cuatrimestre,
			a: cod.get(v.nudoA) ?? '?',
			b: cod.get(v.nudoB) ?? '?',
			titulo: v.titulo,
			resumen: v.resumen,
			idiomaA: v.idiomaA,
			idiomaB: v.idiomaB,
			trampa: v.trampa,
			falsoAmigo: v.falsoAmigo,
			claseA: v.claseA,
			claseB: v.claseB,
			pregunta: v.pregunta,
			porQue: v.porQue,
			vocabA: v.vocabA,
			vocabB: v.vocabB
		}))
	};
};
