/**
 * Los puestos del área, no las personas.
 *
 * En la base no hay nombres propios: hay roles. Quién ocupa cada rol se sabe por
 * las cuentas de usuaria, donde cada una carga su nombre. Así la grilla, los EPA
 * y la bitácora siguen teniendo sentido aunque cambie el plantel, y el
 * repositorio no lleva datos personales de nadie.
 */
export type Puesto = {
	/** Clave estable con la que el seed arma la grilla. No cambiarla. */
	clave: 'mate-basico' | 'mate-orientado' | 'programacion' | 'diseno';
	nombre: string;
	email: string;
	rol?: 'coordinacion' | 'docente';
};

export const PERSONAS: Puesto[] = [
	{ clave: 'mate-basico',    nombre: 'Matemática · 1º 2º 3º 5º',   email: 'mate-basico@areal.local' },
	{ clave: 'mate-orientado', nombre: 'Matemática · 4º',            email: 'mate-orientado@areal.local' },
	{ clave: 'programacion',   nombre: 'Informática · Programación', email: 'programacion@areal.local', rol: 'coordinacion' },
	{ clave: 'diseno',         nombre: 'Informática · Diseño',       email: 'diseno@areal.local' }
];
