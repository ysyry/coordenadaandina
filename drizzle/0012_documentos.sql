CREATE TABLE "documento" (
	"tenant_id" uuid NOT NULL,
	"archivo" text NOT NULL,
	"tipo" text NOT NULL,
	"peso" integer NOT NULL,
	"contenido" "bytea" NOT NULL,
	"subido" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documento_tenant_id_archivo_pk" PRIMARY KEY("tenant_id","archivo")
);
