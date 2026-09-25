CREATE TABLE "plan_materia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"curso_id" uuid NOT NULL,
	"espacio" text NOT NULL,
	"disciplina" text NOT NULL,
	"cuatrimestre" integer NOT NULL,
	"anio_calendario" integer NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"proposito" text DEFAULT '' NOT NULL,
	"criterios" text DEFAULT '' NOT NULL,
	"acreditacion" text DEFAULT '' NOT NULL,
	"notas" text DEFAULT '' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unidad" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"titulo" text NOT NULL,
	"busca" text DEFAULT '' NOT NULL,
	"clases" integer DEFAULT 0 NOT NULL,
	"producto" text DEFAULT '' NOT NULL,
	"criterios" text DEFAULT '' NOT NULL,
	"epa_id" uuid
);
--> statement-breakpoint
CREATE TABLE "unidad_nudo" (
	"unidad_id" uuid NOT NULL,
	"nudo_id" uuid NOT NULL,
	CONSTRAINT "unidad_nudo_unidad_id_nudo_id_pk" PRIMARY KEY("unidad_id","nudo_id")
);
--> statement-breakpoint
ALTER TABLE "plan_materia" ADD CONSTRAINT "plan_materia_curso_id_curso_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."curso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidad" ADD CONSTRAINT "unidad_plan_id_plan_materia_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plan_materia"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidad" ADD CONSTRAINT "unidad_epa_id_epa_id_fk" FOREIGN KEY ("epa_id") REFERENCES "public"."epa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidad_nudo" ADD CONSTRAINT "unidad_nudo_unidad_id_unidad_id_fk" FOREIGN KEY ("unidad_id") REFERENCES "public"."unidad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidad_nudo" ADD CONSTRAINT "unidad_nudo_nudo_id_nudo_id_fk" FOREIGN KEY ("nudo_id") REFERENCES "public"."nudo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pm_idx" ON "plan_materia" USING btree ("curso_id","espacio","cuatrimestre","anio_calendario");--> statement-breakpoint
CREATE INDEX "pm_tenant_idx" ON "plan_materia" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "unidad_plan_idx" ON "unidad" USING btree ("plan_id");