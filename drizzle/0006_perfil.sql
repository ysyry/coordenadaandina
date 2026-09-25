CREATE TABLE "usuario_anio" (
	"usuario_id" uuid NOT NULL,
	"anio" integer NOT NULL,
	CONSTRAINT "usuario_anio_usuario_id_anio_pk" PRIMARY KEY("usuario_id","anio")
);
--> statement-breakpoint
CREATE TABLE "usuario_aviso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"email" text NOT NULL,
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usuario_anio" ADD CONSTRAINT "usuario_anio_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_aviso" ADD CONSTRAINT "usuario_aviso_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "aviso_idx" ON "usuario_aviso" USING btree ("usuario_id","email");