CREATE TABLE "acuerdo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"reunion_id" uuid,
	"bloque" text DEFAULT '' NOT NULL,
	"texto" text NOT NULL,
	"detalle" text DEFAULT '' NOT NULL,
	"responsable" text DEFAULT '' NOT NULL,
	"hecho" boolean DEFAULT false NOT NULL,
	"como_se_resolvio" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diseno_id" uuid NOT NULL,
	"nombre" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "area_escuela" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"escuela_id" uuid NOT NULL,
	"area_id" uuid NOT NULL,
	"reunion_dia" integer,
	"reunion_desde" text,
	"reunion_hasta" text,
	"reunion_frecuencia" text
);
--> statement-breakpoint
CREATE TABLE "bloque" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"curso_id" uuid NOT NULL,
	"docente_id" uuid,
	"dia" integer NOT NULL,
	"desde" text NOT NULL,
	"hasta" text NOT NULL,
	"espacio" text DEFAULT 'Matemática' NOT NULL,
	"disciplina" text DEFAULT 'matematica' NOT NULL,
	"apareado_con" uuid
);
--> statement-breakpoint
CREATE TABLE "checklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"area_escuela_id" uuid NOT NULL,
	"periodo" text NOT NULL,
	"fecha" date,
	"participantes" text DEFAULT '' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checklist_id" uuid NOT NULL,
	"clave" text NOT NULL,
	"marcado" boolean DEFAULT false NOT NULL,
	"comentario" text DEFAULT '' NOT NULL,
	"enlace" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clase_dada" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"curso_id" uuid NOT NULL,
	"docente_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"nudo_id" uuid,
	"situacion_id" uuid,
	"notas" text DEFAULT '' NOT NULL,
	"como_vino" text,
	"se_dio" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "componente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"planificacion_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	"contenido" text DEFAULT '' NOT NULL,
	"actualizado_por" uuid,
	"actualizado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"escuela_id" uuid NOT NULL,
	"anio_escolar" integer NOT NULL,
	"division" text,
	"etiqueta" text
);
--> statement-breakpoint
CREATE TABLE "diseno" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiccion_id" uuid NOT NULL,
	"resolucion" text NOT NULL,
	"anio" integer NOT NULL,
	"nombre" text NOT NULL,
	"vigencia_desde" date,
	"vigencia_hasta" date
);
--> statement-breakpoint
CREATE TABLE "docente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "epa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"area_escuela_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"curso_id" uuid,
	"cuatrimestre" integer,
	"anio_calendario" integer NOT NULL,
	"estado" text DEFAULT 'idea' NOT NULL,
	"docentes" text DEFAULT '' NOT NULL,
	"proposito" text DEFAULT '' NOT NULL,
	"nucleos" text DEFAULT '' NOT NULL,
	"saberes" text DEFAULT '' NOT NULL,
	"perspectivas" text DEFAULT '' NOT NULL,
	"capacidades" text DEFAULT '' NOT NULL,
	"mapa_proyecto" text DEFAULT '' NOT NULL,
	"producto_final" text DEFAULT '' NOT NULL,
	"productos_intermedios" text DEFAULT '' NOT NULL,
	"revision_critica" text DEFAULT '' NOT NULL,
	"criterios_informes" text DEFAULT '' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "epa_nudo" (
	"epa_id" uuid NOT NULL,
	"nudo_id" uuid NOT NULL,
	CONSTRAINT "epa_nudo_epa_id_nudo_id_pk" PRIMARY KEY("epa_id","nudo_id")
);
--> statement-breakpoint
CREATE TABLE "epa_objetivo" (
	"epa_id" uuid NOT NULL,
	"clave" text NOT NULL,
	"como" text DEFAULT '' NOT NULL,
	CONSTRAINT "epa_objetivo_epa_id_clave_pk" PRIMARY KEY("epa_id","clave")
);
--> statement-breakpoint
CREATE TABLE "escuela" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"jurisdiccion_id" uuid NOT NULL,
	"dominio_workspace" text
);
--> statement-breakpoint
CREATE TABLE "evento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"escuela_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"hasta" date,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"nota" text DEFAULT '' NOT NULL,
	"curso_id" uuid,
	"afecta_clases" boolean DEFAULT false NOT NULL,
	"creado_por" uuid,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurisdiccion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"codigo" text NOT NULL,
	CONSTRAINT "jurisdiccion_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "membresia" (
	"docente_id" uuid NOT NULL,
	"area_escuela_id" uuid NOT NULL,
	"rol" text DEFAULT 'docente' NOT NULL,
	"desde" date,
	"hasta" date,
	CONSTRAINT "membresia_docente_id_area_escuela_id_pk" PRIMARY KEY("docente_id","area_escuela_id")
);
--> statement-breakpoint
CREATE TABLE "nudo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"disciplina" text NOT NULL,
	"transversal" boolean DEFAULT false NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nudo_cuatrimestre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nudo_id" uuid NOT NULL,
	"cuatrimestre" integer NOT NULL,
	"anio_escolar" integer NOT NULL,
	"titulo" text,
	"saberes" text NOT NULL,
	"repite_anterior" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planificacion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"area_escuela_id" uuid NOT NULL,
	"cuatrimestre" integer NOT NULL,
	"anio_calendario" integer NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planilla_escuela" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"curso_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"drive_file_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "precedencia" (
	"antes_id" uuid NOT NULL,
	"despues_id" uuid NOT NULL,
	CONSTRAINT "precedencia_antes_id_despues_id_pk" PRIMARY KEY("antes_id","despues_id")
);
--> statement-breakpoint
CREATE TABLE "recurso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"categoria" text NOT NULL,
	"formato" text DEFAULT 'pdf' NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"enlace" text DEFAULT '' NOT NULL,
	"fuente" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reunion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"area_escuela_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"titulo" text NOT NULL,
	"caracter" text DEFAULT '' NOT NULL,
	"participantes" text DEFAULT '' NOT NULL,
	"notas" text DEFAULT '' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revision_critica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"planificacion_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"participantes" text DEFAULT '' NOT NULL,
	"acuerdos" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "situacion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"planificacion_id" uuid NOT NULL,
	"titulo" text DEFAULT '' NOT NULL,
	"problema" text DEFAULT '' NOT NULL,
	"medio" text DEFAULT '' NOT NULL,
	"institucionalizacion" text DEFAULT '' NOT NULL,
	"semana_desde" integer,
	"semana_hasta" integer,
	"pos_x" integer,
	"pos_y" integer,
	"orden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "situacion_nudo" (
	"situacion_id" uuid NOT NULL,
	"nudo_id" uuid NOT NULL,
	CONSTRAINT "situacion_nudo_situacion_id_nudo_id_pk" PRIMARY KEY("situacion_id","nudo_id")
);
--> statement-breakpoint
CREATE TABLE "vinculo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nudo_a" uuid NOT NULL,
	"nudo_b" uuid NOT NULL,
	"cuatrimestre" integer NOT NULL,
	"titulo" text NOT NULL,
	"resumen" text NOT NULL,
	"idioma_a" text,
	"idioma_b" text,
	"trampa" text,
	"falso_amigo" text,
	"clase_a" text,
	"clase_b" text,
	"pregunta" text,
	"por_que" text,
	"vocab_a" text,
	"vocab_b" text
);
--> statement-breakpoint
ALTER TABLE "acuerdo" ADD CONSTRAINT "acuerdo_reunion_id_reunion_id_fk" FOREIGN KEY ("reunion_id") REFERENCES "public"."reunion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "area" ADD CONSTRAINT "area_diseno_id_diseno_id_fk" FOREIGN KEY ("diseno_id") REFERENCES "public"."diseno"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "area_escuela" ADD CONSTRAINT "area_escuela_escuela_id_escuela_id_fk" FOREIGN KEY ("escuela_id") REFERENCES "public"."escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "area_escuela" ADD CONSTRAINT "area_escuela_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloque" ADD CONSTRAINT "bloque_curso_id_curso_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."curso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloque" ADD CONSTRAINT "bloque_docente_id_docente_id_fk" FOREIGN KEY ("docente_id") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist" ADD CONSTRAINT "checklist_area_escuela_id_area_escuela_id_fk" FOREIGN KEY ("area_escuela_id") REFERENCES "public"."area_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_checklist_id_checklist_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."checklist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD CONSTRAINT "clase_dada_curso_id_curso_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."curso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD CONSTRAINT "clase_dada_docente_id_docente_id_fk" FOREIGN KEY ("docente_id") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD CONSTRAINT "clase_dada_nudo_id_nudo_id_fk" FOREIGN KEY ("nudo_id") REFERENCES "public"."nudo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD CONSTRAINT "clase_dada_situacion_id_situacion_id_fk" FOREIGN KEY ("situacion_id") REFERENCES "public"."situacion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componente" ADD CONSTRAINT "componente_planificacion_id_planificacion_id_fk" FOREIGN KEY ("planificacion_id") REFERENCES "public"."planificacion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "componente" ADD CONSTRAINT "componente_actualizado_por_docente_id_fk" FOREIGN KEY ("actualizado_por") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso" ADD CONSTRAINT "curso_escuela_id_escuela_id_fk" FOREIGN KEY ("escuela_id") REFERENCES "public"."escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseno" ADD CONSTRAINT "diseno_jurisdiccion_id_jurisdiccion_id_fk" FOREIGN KEY ("jurisdiccion_id") REFERENCES "public"."jurisdiccion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa" ADD CONSTRAINT "epa_area_escuela_id_area_escuela_id_fk" FOREIGN KEY ("area_escuela_id") REFERENCES "public"."area_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa" ADD CONSTRAINT "epa_curso_id_curso_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."curso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa_nudo" ADD CONSTRAINT "epa_nudo_epa_id_epa_id_fk" FOREIGN KEY ("epa_id") REFERENCES "public"."epa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa_nudo" ADD CONSTRAINT "epa_nudo_nudo_id_nudo_id_fk" FOREIGN KEY ("nudo_id") REFERENCES "public"."nudo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa_objetivo" ADD CONSTRAINT "epa_objetivo_epa_id_epa_id_fk" FOREIGN KEY ("epa_id") REFERENCES "public"."epa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escuela" ADD CONSTRAINT "escuela_jurisdiccion_id_jurisdiccion_id_fk" FOREIGN KEY ("jurisdiccion_id") REFERENCES "public"."jurisdiccion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evento" ADD CONSTRAINT "evento_escuela_id_escuela_id_fk" FOREIGN KEY ("escuela_id") REFERENCES "public"."escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evento" ADD CONSTRAINT "evento_curso_id_curso_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."curso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evento" ADD CONSTRAINT "evento_creado_por_docente_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membresia" ADD CONSTRAINT "membresia_docente_id_docente_id_fk" FOREIGN KEY ("docente_id") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membresia" ADD CONSTRAINT "membresia_area_escuela_id_area_escuela_id_fk" FOREIGN KEY ("area_escuela_id") REFERENCES "public"."area_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudo" ADD CONSTRAINT "nudo_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudo_cuatrimestre" ADD CONSTRAINT "nudo_cuatrimestre_nudo_id_nudo_id_fk" FOREIGN KEY ("nudo_id") REFERENCES "public"."nudo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planificacion" ADD CONSTRAINT "planificacion_area_escuela_id_area_escuela_id_fk" FOREIGN KEY ("area_escuela_id") REFERENCES "public"."area_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planilla_escuela" ADD CONSTRAINT "planilla_escuela_curso_id_curso_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."curso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precedencia" ADD CONSTRAINT "precedencia_antes_id_situacion_id_fk" FOREIGN KEY ("antes_id") REFERENCES "public"."situacion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "precedencia" ADD CONSTRAINT "precedencia_despues_id_situacion_id_fk" FOREIGN KEY ("despues_id") REFERENCES "public"."situacion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reunion" ADD CONSTRAINT "reunion_area_escuela_id_area_escuela_id_fk" FOREIGN KEY ("area_escuela_id") REFERENCES "public"."area_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revision_critica" ADD CONSTRAINT "revision_critica_planificacion_id_planificacion_id_fk" FOREIGN KEY ("planificacion_id") REFERENCES "public"."planificacion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "situacion" ADD CONSTRAINT "situacion_planificacion_id_planificacion_id_fk" FOREIGN KEY ("planificacion_id") REFERENCES "public"."planificacion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "situacion_nudo" ADD CONSTRAINT "situacion_nudo_situacion_id_situacion_id_fk" FOREIGN KEY ("situacion_id") REFERENCES "public"."situacion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "situacion_nudo" ADD CONSTRAINT "situacion_nudo_nudo_id_nudo_id_fk" FOREIGN KEY ("nudo_id") REFERENCES "public"."nudo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinculo" ADD CONSTRAINT "vinculo_nudo_a_nudo_id_fk" FOREIGN KEY ("nudo_a") REFERENCES "public"."nudo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinculo" ADD CONSTRAINT "vinculo_nudo_b_nudo_id_fk" FOREIGN KEY ("nudo_b") REFERENCES "public"."nudo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "acuerdo_idx" ON "acuerdo" USING btree ("tenant_id","hecho");--> statement-breakpoint
CREATE INDEX "ae_tenant_idx" ON "area_escuela" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checklist_periodo_idx" ON "checklist" USING btree ("area_escuela_id","periodo");--> statement-breakpoint
CREATE UNIQUE INDEX "checklist_item_idx" ON "checklist_item" USING btree ("checklist_id","clave");--> statement-breakpoint
CREATE INDEX "clase_curso_idx" ON "clase_dada" USING btree ("tenant_id","curso_id","fecha");--> statement-breakpoint
CREATE UNIQUE INDEX "comp_idx" ON "componente" USING btree ("planificacion_id","numero");--> statement-breakpoint
CREATE INDEX "curso_tenant_idx" ON "curso" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "diseno_res_idx" ON "diseno" USING btree ("jurisdiccion_id","resolucion");--> statement-breakpoint
CREATE UNIQUE INDEX "docente_email_idx" ON "docente" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "epa_tenant_idx" ON "epa" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "escuela_tenant_idx" ON "escuela" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "evento_idx" ON "evento" USING btree ("tenant_id","fecha");--> statement-breakpoint
CREATE UNIQUE INDEX "nudo_codigo_idx" ON "nudo" USING btree ("area_id","codigo");--> statement-breakpoint
CREATE UNIQUE INDEX "nc_idx" ON "nudo_cuatrimestre" USING btree ("nudo_id","cuatrimestre");--> statement-breakpoint
CREATE INDEX "plan_tenant_idx" ON "planificacion" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "recurso_tenant_idx" ON "recurso" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "reunion_idx" ON "reunion" USING btree ("tenant_id","fecha");