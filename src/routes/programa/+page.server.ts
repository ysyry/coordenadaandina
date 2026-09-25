import { db, schema as s } from '$lib/server/db';
import { asc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const filas = await db
		.select({
			codigo: s.nudo.codigo,
			nombre: s.nudo.nombre,
			disciplina: s.nudo.disciplina,
			transversal: s.nudo.transversal,
			orden: s.nudo.orden,
			cuatrimestre: s.nudoCuatrimestre.cuatrimestre,
			anioEscolar: s.nudoCuatrimestre.anioEscolar,
			titulo: s.nudoCuatrimestre.titulo,
			saberes: s.nudoCuatrimestre.saberes,
			repite: s.nudoCuatrimestre.repiteAnterior
		})
		.from(s.nudoCuatrimestre)
		.innerJoin(s.nudo, eq(s.nudo.id, s.nudoCuatrimestre.nudoId))
		.orderBy(asc(s.nudoCuatrimestre.cuatrimestre), asc(s.nudo.orden));

	const cruces = await db
		.select({
			cuatrimestre: s.vinculo.cuatrimestre,
			titulo: s.vinculo.titulo,
			resumen: s.vinculo.resumen,
			escrito: s.vinculo.falsoAmigo,
			nudoA: s.vinculo.nudoA,
			nudoB: s.vinculo.nudoB
		})
		.from(s.vinculo)
		.orderBy(asc(s.vinculo.cuatrimestre));

	const nudos = await db.select({ id: s.nudo.id, codigo: s.nudo.codigo }).from(s.nudo);
	const cod = new Map(nudos.map((n) => [n.id, n.codigo]));

	return {
		filas,
		cruces: cruces.map((c) => ({
			cuatrimestre: c.cuatrimestre,
			titulo: c.titulo,
			resumen: c.resumen,
			escrito: !!c.escrito,
			a: cod.get(c.nudoA) ?? '?',
			b: cod.get(c.nudoB) ?? '?'
		}))
	};
};
