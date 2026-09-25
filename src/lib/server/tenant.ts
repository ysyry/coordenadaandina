/**
 * La escuela con la que trabaja esta instancia.
 *
 * El esquema tiene `tenant_id` en todas las tablas de institución desde la
 * primera migración: el día que Areal sirva a más de una escuela, esto sale
 * de la sesión y no de una constante.
 */
export const TENANT = '00000000-0000-4000-8000-000000000001';
