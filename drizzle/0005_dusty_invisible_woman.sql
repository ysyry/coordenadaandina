CREATE TABLE "respuesta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"formulario" text NOT NULL,
	"usuario_id" uuid NOT NULL,
	"pregunta" text NOT NULL,
	"valor" text DEFAULT '' NOT NULL,
	"actualizado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "respuesta" ADD CONSTRAINT "respuesta_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "respuesta_idx" ON "respuesta" USING btree ("formulario","usuario_id","pregunta");--> statement-breakpoint
CREATE INDEX "respuesta_form_idx" ON "respuesta" USING btree ("formulario");