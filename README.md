# Areal

Herramienta de trabajo para un área de **Matemática e Informática** de escuela
secundaria, en la provincia del Neuquén.

Sirve para lo que un área tiene que hacer y siempre termina disperso entre carpetas,
grupos de WhatsApp y documentos sueltos: saber qué prescribe el diseño curricular,
planificar sobre eso, acordar entre quienes dan clase, y poder decir al final del
cuatrimestre qué se dio y qué quedó.

La idea de fondo es que **todo se pueda cruzar**. El diseño curricular está cargado como
datos —no como texto— con sus nudos, sus saberes cuatrimestre por cuatrimestre y los
vínculos entre las dos disciplinas. Encima de eso, cada materia planifica, cada docente
declara qué da, y las respuestas de los formularios quedan atadas a la unidad, al nudo o
al cruce sobre el que hablan. De ahí salen las tres preguntas que hoy no tienen respuesta
en ninguna escuela: **qué esperaba el diseño, qué planificamos y qué se dio.**

## Para qué escuela

Para cualquiera de la provincia. El diseño curricular es el mismo en todas, así que el
catálogo —resoluciones, nudos, saberes— viene cargado y no se toca. Lo que cambia por
escuela son los cursos, los horarios, quién da qué y lo que se planifica: eso lleva
`tenant_id` desde la primera migración.

El área es Matemática e Informática. Las otras usan el mismo diseño curricular con otros
nudos, así que el modelo las admitiría, pero el catálogo que está cargado es el de esta.

## Software libre

Se escribió para una escuela pública y se publica para que otra la use, la cambie o la
copie. No tiene servicios de pago, no manda datos a ningún lado y se despliega entero
desde este repositorio. Ver `DESPLIEGUE.md`.

## Qué hay adentro

| | |
|---|---|
| **El programa** | Los saberes que prescribe el diseño, cuatrimestre por cuatrimestre, con el texto de la resolución |
| **Mapa del área** | Los nudos de 1º a 5º en una grilla, y los cruces donde las dos disciplinas tocan lo mismo |
| **Planificaciones** | La del área por ciclo, la de cada materia por cuatrimestre, los EPA, las reuniones con sus acuerdos, el checklist institucional y los formularios |
| **Trayecto** | Para un año y una materia: lo que el diseño espera, lo que se planificó y lo que se dio |
| **Calendario** | Los días de clase reales, lo que se pierde por feriados y jornadas, y quién está en cada horario |
| **Recursero** | Normativa, papeles de la escuela y herramientas de aula |
| **Mi perfil** | Qué materias da cada una, con qué rol, y a qué correos quiere que le lleguen avisos |

## Arrancar

```bash
npm install
cp .env.example .env
npm run db:up        # Postgres en Docker, puerto 5433
npm run db:migrate
npm run db:seed      # carga el catálogo de Neuquén
npm run db:estructura  # espacios, dictados, conceptos, temas de marzo y Bases del área
npm run dev
```

## Comandos

| | |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run db:up` / `db:down` | Levantar o bajar Postgres |
| `npm run db:generate` | Generar migración a partir del esquema |
| `npm run db:migrate` | Aplicar migraciones pendientes |
| `npm run db:seed` | Cargar el catálogo curricular |
| `npm run db:estructura` | Completar la estructura: conceptos, espacios, dictados, unidades, encuestas. No borra nada |
| `npm run db:studio` | Ver la base en el navegador |
| `npm run docs -- subir` | Subir a la base los documentos institucionales de `documentos/` |
| `npm run db:reset` | Borrar todo y volver a sembrar |
| `npm run check` | Chequeo de tipos |

## Cómo está armado

| Capa | |
|---|---|
| Framework | SvelteKit 2 · Svelte 5 · TypeScript |
| Base | PostgreSQL 17 en Docker, puerto **5433** |
| ORM | Drizzle, migraciones versionadas en `drizzle/` |
| Driver | postgres-js |
| Estilos | CSS propio con tokens en `src/app.css` |

```
src/
  lib/
    catalogo/neuquen.ts        el diseño curricular como datos
    server/db/schema.ts        las tablas
    server/db/index.ts         el cliente
  routes/                      las páginas
scripts/seed.ts                carga el catálogo
drizzle/                       migraciones
```

## Quién entra

La portada es pública: cuenta qué es el área y nada más. Todo lo demás pide cuenta propia
—correo y clave— con la sesión guardada en la base. No hay registro abierto: las cuentas se
dan de alta desde `/usuarias`, o desde la terminal con `npm run usuaria`.

**En la base no hay nombres propios de docentes: hay puestos** —«Matemática · 1º 2º 3º 5º»,
«Informática · Programación»—. Los nombres viven en las cuentas, que cada una carga.

## Formularios y trayecto

`/formularios` tiene las encuestas del área. **Cualquiera puede armar una** con el constructor:
cada encuesta tiene su **Motivación**, secciones y preguntas. Una pregunta puede repetirse por
cada materia y curso, por tema planificado, por cruce entre materias o por nudo, y sus opciones
pueden salir del modelo (Perspectivas, vínculos de área, criterios, compañeras, nudos). Cada
respuesta guarda sobre qué es y los ids de lo que se eligió, así se cruza con todo lo demás.
Las respuestas se descargan en CSV. **Bases del área** es una encuesta más, sembrada por
`npm run db:estructura`.

`/trayecto` muestra, para un año y un espacio, los nudos que el diseño espera, las unidades que
los planifican y lo que se contestó sobre cada una.

El modelo que hace posible los cruces está en **`MODELO.md`**.

## Tres decisiones de esquema que no se tocan

1. **`tenant_id`** en todas las tablas de institución y trabajo, desde la primera
   migración. El multi-escuela sale de acá.
2. **`vigencia_desde` / `vigencia_hasta`** en el diseño curricular. Las resoluciones se
   reemplazan; una planificación vieja tiene que seguir siendo legible.
3. **`continua_de` en el nudo.** Un nudo del Ciclo Orientado apunta al del Básico que
   continúa. Entre ciclos cambia el nombre —«Algoritmos y Programación» pasa a
   «Programación»— y el código podría cambiar también, así que la trayectoria de un nudo
   de 1º a 5º se sigue por esa clave foránea y no por coincidencia de texto.

Y una que es una ausencia: **no hay columna `es_epa`**. El EPA se deriva de
`situacion_nudo` — si una situación toca nudos de las dos disciplinas, es un EPA.
Si fuera una columna, podría mentir.

## Los documentos institucionales

El GPS y las circulares técnicas **no están en el repositorio**: hablan de protección de
estudiantes y son internas. Se traen del Drive a `documentos/` —que está en el
`.gitignore`— con `./scripts/traer-docs.sh`, y de ahí van a la base con
`npm run docs -- subir`. Areal los entrega en `/docs/<archivo>`, y esa ruta pasa por la
misma puerta que el resto: sin sesión no se abren. En `static/` no pueden estar, porque
ahí los serviría el servidor de archivos antes de que corra el control de sesión.

## Datos de estudiantes

**No hay, y no va a haber en esta etapa.** El seguimiento del estudiantado vive en el
Drive de la escuela, donde la responsable de esos datos sigue siendo la escuela.
La tabla `planilla_escuela` guarda el identificador del archivo, nunca su contenido.

## El catálogo

- **Res. 1381/22** → 1º a 3º. Doce nudos con su secuenciación por cuatrimestre. Los
  saberes son el texto de la resolución, extraído del PDF columna por columna y cotejado
  nudo por nudo.
- **Res. 1044/19** → los nudos del Ciclo Orientado: tres de Matemática, cuatro propios de
  Informática y los tres del EPA, que ahí tiene espacio curricular propio.
- **Res. 1578/26** → los saberes de 4º y 5º, cuatrimestre por cuatrimestre.

Dos cosas del catálogo son lectura nuestra y están marcadas como tales en el código: el
reparto de los saberes de la 1578/26 entre los nudos —la resolución los lista por
cuatrimestre sin asignarlos— y los **cruces** entre disciplinas, que no salen de ninguna
resolución: de la norma sale sólo que dos nudos caen en el mismo cuatrimestre.

**Pendiente:** los saberes de 4º y 5º todavía no pasaron por el cotejo contra el PDF que
sí tienen los de 1º a 3º.
