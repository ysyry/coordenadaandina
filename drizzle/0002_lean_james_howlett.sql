ALTER TABLE "planificacion" ALTER COLUMN "cuatrimestre" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "planificacion" ADD COLUMN "ciclo" text DEFAULT 'basico' NOT NULL;--> statement-breakpoint
ALTER TABLE "planificacion" ADD COLUMN "situacion_inicial" text DEFAULT '' NOT NULL;