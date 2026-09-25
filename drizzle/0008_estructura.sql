CREATE TABLE "ciclo_lectivo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"escuela_id" uuid NOT NULL,
	"anio" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concepto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"tipo" text NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"resumen" text DEFAULT '' NOT NULL,
	"texto" text DEFAULT '' NOT NULL,
	"disciplina" text,
	"diseno_id" uuid,
	"orden" integer DEFAULT 0 NOT NULL,
	"vigente_desde" integer,
	"vigente_hasta" integer
);
--> statement-breakpoint
CREATE TABLE "dictado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"curso_id" uuid NOT NULL,
	"espacio_escuela_id" uuid NOT NULL,
	"puesto_id" uuid,
	"encuentros" integer DEFAULT 0 NOT NULL,
	"origen" text DEFAULT 'horario' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encuesta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"clave" text,
	"autora_id" uuid,
	"titulo" text NOT NULL,
	"motivacion" text DEFAULT '' NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encuesta_seccion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encuesta_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"titulo" text NOT NULL,
	"apunta" text DEFAULT '' NOT NULL,
	"saber" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "espacio_curricular" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"disciplina" text NOT NULL,
	"anios" integer[] NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "espacio_escuela" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"escuela_id" uuid NOT NULL,
	"espacio_curricular_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"rama" text,
	"anios" integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ocupacion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"puesto_id" uuid NOT NULL,
	"dictado_id" uuid,
	"rol" text DEFAULT 'titular' NOT NULL,
	"desde" date,
	"hasta" date
);
--> statement-breakpoint
CREATE TABLE "periodo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ciclo_lectivo_id" uuid NOT NULL,
	"tipo" text DEFAULT 'cuatrimestre' NOT NULL,
	"n" integer NOT NULL,
	"nombre" text NOT NULL,
	"desde" date NOT NULL,
	"hasta" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pregunta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encuesta_id" uuid NOT NULL,
	"seccion_id" uuid,
	"orden" integer NOT NULL,
	"texto" text NOT NULL,
	"ayuda" text DEFAULT '' NOT NULL,
	"tipo" text DEFAULT 'parrafo' NOT NULL,
	"obligatoria" boolean DEFAULT false NOT NULL,
	"clase" text,
	"por" text DEFAULT 'nada' NOT NULL,
	"alcance" text DEFAULT 'mios' NOT NULL,
	"opciones_de" text DEFAULT 'manual' NOT NULL,
	"opciones" text DEFAULT '' NOT NULL,
	"con_otra" boolean DEFAULT false NOT NULL,
	"muestra" text
);
--> statement-breakpoint
CREATE TABLE "respuesta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pregunta_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"sobre_tipo" text DEFAULT '' NOT NULL,
	"sobre_id" text DEFAULT '' NOT NULL,
	"valor" text DEFAULT '' NOT NULL,
	"otro" text DEFAULT '' NOT NULL,
	"actualizado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respuesta_ref" (
	"respuesta_id" uuid NOT NULL,
	"ref_tipo" text NOT NULL,
	"ref_id" text NOT NULL,
	CONSTRAINT "respuesta_ref_respuesta_id_ref_tipo_ref_id_pk" PRIMARY KEY("respuesta_id","ref_tipo","ref_id")
);
--> statement-breakpoint
CREATE TABLE "rol_area" (
	"usuario_id" uuid NOT NULL,
	"area_escuela_id" uuid NOT NULL,
	"rol" text NOT NULL,
	"desde" date,
	"hasta" date,
	CONSTRAINT "rol_area_usuario_id_area_escuela_id_rol_pk" PRIMARY KEY("usuario_id","area_escuela_id","rol")
);
--> statement-breakpoint
CREATE TABLE "unidad_concepto" (
	"unidad_id" uuid NOT NULL,
	"concepto_id" uuid NOT NULL,
	CONSTRAINT "unidad_concepto_unidad_id_concepto_id_pk" PRIMARY KEY("unidad_id","concepto_id")
);
--> statement-breakpoint
CREATE TABLE "vinculo_concepto" (
	"vinculo_id" uuid NOT NULL,
	"concepto_id" uuid NOT NULL,
	CONSTRAINT "vinculo_concepto_vinculo_id_concepto_id_pk" PRIMARY KEY("vinculo_id","concepto_id")
);
--> statement-breakpoint
ALTER TABLE "bloque" ADD COLUMN "dictado_id" uuid;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD COLUMN "dictado_id" uuid;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD COLUMN "unidad_id" uuid;--> statement-breakpoint
ALTER TABLE "curso" ADD COLUMN "anio_calendario" integer;--> statement-breakpoint
ALTER TABLE "diseno" ADD COLUMN "ciclo" text DEFAULT 'basico' NOT NULL;--> statement-breakpoint
ALTER TABLE "escuela" ADD COLUMN "orientacion" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "escuela" ADD COLUMN "localidad" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "nudo" ADD COLUMN "espacio_id" uuid;--> statement-breakpoint
ALTER TABLE "plan_materia" ADD COLUMN "dictado_id" uuid;--> statement-breakpoint
ALTER TABLE "vinculo" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "vinculo" ADD COLUMN "origen" text DEFAULT 'lectura' NOT NULL;--> statement-breakpoint
ALTER TABLE "ciclo_lectivo" ADD CONSTRAINT "ciclo_lectivo_escuela_id_escuela_id_fk" FOREIGN KEY ("escuela_id") REFERENCES "public"."escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concepto" ADD CONSTRAINT "concepto_diseno_id_diseno_id_fk" FOREIGN KEY ("diseno_id") REFERENCES "public"."diseno"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictado" ADD CONSTRAINT "dictado_curso_id_curso_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."curso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictado" ADD CONSTRAINT "dictado_espacio_escuela_id_espacio_escuela_id_fk" FOREIGN KEY ("espacio_escuela_id") REFERENCES "public"."espacio_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictado" ADD CONSTRAINT "dictado_puesto_id_docente_id_fk" FOREIGN KEY ("puesto_id") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encuesta" ADD CONSTRAINT "encuesta_autora_id_usuario_id_fk" FOREIGN KEY ("autora_id") REFERENCES "public"."usuario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encuesta_seccion" ADD CONSTRAINT "encuesta_seccion_encuesta_id_encuesta_id_fk" FOREIGN KEY ("encuesta_id") REFERENCES "public"."encuesta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "espacio_curricular" ADD CONSTRAINT "espacio_curricular_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "espacio_escuela" ADD CONSTRAINT "espacio_escuela_escuela_id_escuela_id_fk" FOREIGN KEY ("escuela_id") REFERENCES "public"."escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "espacio_escuela" ADD CONSTRAINT "espacio_escuela_espacio_curricular_id_espacio_curricular_id_fk" FOREIGN KEY ("espacio_curricular_id") REFERENCES "public"."espacio_curricular"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocupacion" ADD CONSTRAINT "ocupacion_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocupacion" ADD CONSTRAINT "ocupacion_puesto_id_docente_id_fk" FOREIGN KEY ("puesto_id") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocupacion" ADD CONSTRAINT "ocupacion_dictado_id_dictado_id_fk" FOREIGN KEY ("dictado_id") REFERENCES "public"."dictado"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periodo" ADD CONSTRAINT "periodo_ciclo_lectivo_id_ciclo_lectivo_id_fk" FOREIGN KEY ("ciclo_lectivo_id") REFERENCES "public"."ciclo_lectivo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregunta" ADD CONSTRAINT "pregunta_encuesta_id_encuesta_id_fk" FOREIGN KEY ("encuesta_id") REFERENCES "public"."encuesta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregunta" ADD CONSTRAINT "pregunta_seccion_id_encuesta_seccion_id_fk" FOREIGN KEY ("seccion_id") REFERENCES "public"."encuesta_seccion"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuesta" ADD CONSTRAINT "respuesta_pregunta_id_pregunta_id_fk" FOREIGN KEY ("pregunta_id") REFERENCES "public"."pregunta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuesta" ADD CONSTRAINT "respuesta_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuesta_ref" ADD CONSTRAINT "respuesta_ref_respuesta_id_respuesta_id_fk" FOREIGN KEY ("respuesta_id") REFERENCES "public"."respuesta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_area" ADD CONSTRAINT "rol_area_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_area" ADD CONSTRAINT "rol_area_area_escuela_id_area_escuela_id_fk" FOREIGN KEY ("area_escuela_id") REFERENCES "public"."area_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidad_concepto" ADD CONSTRAINT "unidad_concepto_unidad_id_unidad_id_fk" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidad_concepto" ADD CONSTRAINT "unidad_concepto_concepto_id_concepto_id_fk" FOREIGN KEY ("concepto_id") REFERENCES "public"."concepto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinculo_concepto" ADD CONSTRAINT "vinculo_concepto_vinculo_id_vinculo_id_fk" FOREIGN KEY ("vinculo_id") REFERENCES "public"."vinculo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinculo_concepto" ADD CONSTRAINT "vinculo_concepto_concepto_id_concepto_id_fk" FOREIGN KEY ("concepto_id") REFERENCES "public"."concepto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cl_idx" ON "ciclo_lectivo" USING btree ("escuela_id","anio");--> statement-breakpoint
CREATE UNIQUE INDEX "concepto_codigo_idx" ON "concepto" USING btree ("tenant_id","tipo","codigo");--> statement-breakpoint
CREATE INDEX "concepto_tipo_idx" ON "concepto" USING btree ("tipo");--> statement-breakpoint
CREATE UNIQUE INDEX "dictado_idx" ON "dictado" USING btree ("curso_id","espacio_escuela_id","puesto_id");--> statement-breakpoint
CREATE INDEX "dictado_tenant_idx" ON "dictado" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "encuesta_clave_idx" ON "encuesta" USING btree ("tenant_id","clave");--> statement-breakpoint
CREATE INDEX "encuesta_tenant_idx" ON "encuesta" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "es_encuesta_idx" ON "encuesta_seccion" USING btree ("encuesta_id","orden");--> statement-breakpoint
CREATE UNIQUE INDEX "ec_codigo_idx" ON "espacio_curricular" USING btree ("area_id","codigo");--> statement-breakpoint
CREATE UNIQUE INDEX "ee_idx" ON "espacio_escuela" USING btree ("escuela_id","espacio_curricular_id","nombre");--> statement-breakpoint
CREATE INDEX "ocupacion_usuario_idx" ON "ocupacion" USING btree ("usuario_id");--> statement-breakpoint
CREATE UNIQUE INDEX "periodo_idx" ON "periodo" USING btree ("ciclo_lectivo_id","tipo","n");--> statement-breakpoint
CREATE INDEX "pregunta_encuesta_idx" ON "pregunta" USING btree ("encuesta_id","orden");--> statement-breakpoint
CREATE UNIQUE INDEX "respuesta_idx" ON "respuesta" USING btree ("pregunta_id","usuario_id","sobre_tipo","sobre_id");--> statement-breakpoint
CREATE INDEX "respuesta_sobre_idx" ON "respuesta" USING btree ("sobre_tipo","sobre_id");--> statement-breakpoint
CREATE INDEX "rr_ref_idx" ON "respuesta_ref" USING btree ("ref_tipo","ref_id");--> statement-breakpoint
ALTER TABLE "bloque" ADD CONSTRAINT "bloque_dictado_id_dictado_id_fk" FOREIGN KEY ("dictado_id") REFERENCES "public"."dictado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD CONSTRAINT "clase_dada_dictado_id_dictado_id_fk" FOREIGN KEY ("dictado_id") REFERENCES "public"."dictado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clase_dada" ADD CONSTRAINT "clase_dada_unidad_id_unidad_id_fk" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidad"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudo" ADD CONSTRAINT "nudo_espacio_id_espacio_curricular_id_fk" FOREIGN KEY ("espacio_id") REFERENCES "public"."espacio_curricular"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_materia" ADD CONSTRAINT "plan_materia_dictado_id_dictado_id_fk" FOREIGN KEY ("dictado_id") REFERENCES "public"."dictado"("id") ON DELETE no action ON UPDATE no action;