CREATE TABLE "sesion" (
	"huella" text PRIMARY KEY NOT NULL,
	"usuario_id" uuid NOT NULL,
	"expira" timestamp with time zone NOT NULL,
	"creada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"docente_id" uuid,
	"email" text NOT NULL,
	"nombre" text NOT NULL,
	"clave" text NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL,
	"ultimo_ingreso" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sesion" ADD CONSTRAINT "sesion_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_docente_id_docente_id_fk" FOREIGN KEY ("docente_id") REFERENCES "public"."docente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sesion_usuario_idx" ON "sesion" USING btree ("usuario_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuario_email_idx" ON "usuario" USING btree ("email");