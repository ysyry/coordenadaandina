CREATE TABLE "criterio_area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"area_escuela_id" uuid NOT NULL,
	"concepto_id" uuid,
	"nombre" text NOT NULL,
	"que_se_evalua" text DEFAULT '' NOT NULL,
	"quien_participa" text DEFAULT '' NOT NULL,
	"lugar_acreditacion" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"vigente_desde" integer,
	"vigente_hasta" integer
);
--> statement-breakpoint
CREATE TABLE "epa_concepto" (
	"epa_id" uuid NOT NULL,
	"concepto_id" uuid NOT NULL,
	CONSTRAINT "epa_concepto_epa_id_concepto_id_pk" PRIMARY KEY("epa_id","concepto_id")
);
--> statement-breakpoint
CREATE TABLE "epa_dictado" (
	"epa_id" uuid NOT NULL,
	"dictado_id" uuid NOT NULL,
	CONSTRAINT "epa_dictado_epa_id_dictado_id_pk" PRIMARY KEY("epa_id","dictado_id")
);
--> statement-breakpoint
CREATE TABLE "planilla_seguimiento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dictado_id" uuid,
	"epa_id" uuid,
	"periodo_id" uuid NOT NULL,
	"items_areales" text DEFAULT '' NOT NULL,
	"categorias" text DEFAULT '' NOT NULL,
	"practicas" text DEFAULT '' NOT NULL,
	"conocimientos_clave" text DEFAULT '' NOT NULL,
	"formatos" text DEFAULT '' NOT NULL,
	"producciones" text DEFAULT '' NOT NULL,
	"sugerencias" text DEFAULT '' NOT NULL,
	"presencialidades" text DEFAULT '' NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "epa" ADD COLUMN "problematica" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "epa" ADD COLUMN "formato" text DEFAULT 'taller' NOT NULL;--> statement-breakpoint
ALTER TABLE "epa" ADD COLUMN "interareal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "unidad_nudo" ADD COLUMN "modo" text DEFAULT 'da' NOT NULL;--> statement-breakpoint
ALTER TABLE "criterio_area" ADD CONSTRAINT "criterio_area_area_escuela_id_area_escuela_id_fk" FOREIGN KEY ("area_escuela_id") REFERENCES "public"."area_escuela"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criterio_area" ADD CONSTRAINT "criterio_area_concepto_id_concepto_id_fk" FOREIGN KEY ("concepto_id") REFERENCES "public"."concepto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa_concepto" ADD CONSTRAINT "epa_concepto_epa_id_epa_id_fk" FOREIGN KEY ("epa_id") REFERENCES "public"."epa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa_concepto" ADD CONSTRAINT "epa_concepto_concepto_id_concepto_id_fk" FOREIGN KEY ("concepto_id") REFERENCES "public"."concepto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa_dictado" ADD CONSTRAINT "epa_dictado_epa_id_epa_id_fk" FOREIGN KEY ("epa_id") REFERENCES "public"."epa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "epa_dictado" ADD CONSTRAINT "epa_dictado_dictado_id_dictado_id_fk" FOREIGN KEY ("dictado_id") REFERENCES "public"."dictado"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planilla_seguimiento" ADD CONSTRAINT "planilla_seguimiento_dictado_id_dictado_id_fk" FOREIGN KEY ("dictado_id") REFERENCES "public"."dictado"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planilla_seguimiento" ADD CONSTRAINT "planilla_seguimiento_epa_id_epa_id_fk" FOREIGN KEY ("epa_id") REFERENCES "public"."epa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planilla_seguimiento" ADD CONSTRAINT "planilla_seguimiento_periodo_id_periodo_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."periodo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "criterio_area_idx" ON "criterio_area" USING btree ("tenant_id","area_escuela_id");--> statement-breakpoint
CREATE INDEX "planilla_idx" ON "planilla_seguimiento" USING btree ("tenant_id","periodo_id");