# El modelo de Areal — diseño para que todo se pueda cruzar

**Diseño del 22/09/2026 · ejecutado el 23/09/2026.**

**Estado:** hechas las fases 1 (catálogo), 2 (quién da qué, salvo la pantalla del perfil),
3 (temas de marzo como unidades), 5 (formularios dinámicos, con Bases del área migrada) y
6 (página Trayecto). Pendiente: que `TENANT` salga de la sesión, pasar el perfil de
`usuario_anio` a dictados declarados, `rol_area` desde la pantalla de usuarias, y
`vinculo_concepto` (qué vínculo de área encarna cada cruce), que pide una lectura del área.

## Qué pedimos

> Que tal usuaria matchee que da tal curso, que tiene tales nudos y da tales cosas. Poder listar
> los nudos de Matemática de 3º **esperables**, después los **planificados** y después los que
> **se dieron**. Y que sirva para cualquier escuela: el currículo de Neuquén es el mismo para
> todas.

Hoy la app tiene buena parte del modelo, pero **las piezas no se tocan entre sí**:

| Lo que hay | El problema |
|---|---|
| Nudos y saberes por cuatrimestre en la base | Bien. Es lo único que ya se referencia por id |
| Perspectivas, vínculos de área, objetivos, categorías en `marco.ts` | Son texto en el código, con la decisión escrita de que «nada lo referencia por id». No se pueden elegir, contar ni cruzar |
| Materias como texto suelto (`bloque.espacio = 'Programación'`) | «Programación» no está atado a Informática ni a sus nudos. `plan_materia` repite el mismo texto |
| `docente` es un **puesto**, `usuario.docenteId` lo une a **una** persona | Una persona no puede tener dos puestos, ni un puesto dos personas (las duplas) |
| `usuario_anio` (el perfil nuevo) declara años | Es una segunda fuente de «qué da cada una», aparte del horario, y sin materia |
| Los temas de marzo y los cruces del formulario escritos en `bases2026.ts` | Duplican lo que ya está en la base (`vinculo`) o lo que debería estarlo (`unidad`) |
| Las respuestas son `valor` de texto con claves como `t07.estado` | No se puede preguntar «qué se dijo sobre MAT-ALG» |
| `TENANT` constante y `CICLO` con las fechas de 2026 en el código | Una sola escuela, un solo año |

## Seis principios

1. **Tres capas, y cada tabla sabe en cuál está.** **Norma** (de la jurisdicción, igual para
   todas las escuelas) · **Escuela** (cómo la encarna cada una) · **Trabajo** (lo que hacen las
   docentes). Las cuentas de las personas van aparte.
2. **Todo lo que se nombra tiene id y código estable.** No sólo los nudos: también cada
   perspectiva, cada vínculo de área, cada espacio curricular. Si se puede elegir en un
   formulario, tiene que ser una fila.
3. **Una misma llave une lo esperable, lo planificado y lo dado:** el **tramo**, que es un nudo
   en un cuatrimestre (`nudo_cuatrimestre`, que ya existe). La norma lo prescribe, una unidad lo
   planifica, una clase registrada o una respuesta sobre esa unidad dice si se dio.
4. **Norma y lectura propia no se mezclan.** Toda fila del marco dice si es texto de una
   resolución o una lectura del área (los cruces, los ejes institucionales, los criterios). Las
   lecturas llevan `tenant_id`; la norma no lo lleva.
5. **Persona ≠ puesto ≠ dictado.** La persona *ocupa* un puesto; el puesto *dicta* un espacio
   en un curso. «Qué da cada una» no se declara aparte: sale de ahí.
6. **Los formularios preguntan *sobre* cosas del modelo.** Una respuesta guarda quién, qué
   pregunta, **sobre qué** (este tramo, este cruce, esta unidad) y, si eligió opciones del
   modelo, **sus ids**. Algunas preguntas **escriben directo en el modelo** (el estado de una
   unidad no es una opinión: es un dato).

---

## Capa 1 · La norma (sin `tenant_id`)

```
jurisdiccion ── diseno (la resolución, con ciclo y vigencia)
                  └── area ── espacio_curricular ── nudo ── nudo_cuatrimestre  («tramo»)
                         └── concepto  (perspectivas, vínculos de área, objetivos…)
nudo ──< vinculo >── nudo           (los cruces: lectura, no norma)
```

| Tabla | Estado | Qué cambia |
|---|---|---|
| `jurisdiccion` | existe | — |
| `diseno` | existe | **+ `ciclo`** (`basico` \| `orientado`). Hoy el ciclo se deduce del nombre |
| `area` | existe | — |
| **`espacio_curricular`** | **nueva** | `area_id`, `codigo` (`MAT`, `INF`, `EPA-MI`), `nombre`, `disciplina`, `anios int[]`. En el Básico: Matemática e Informática. En el Orientado, tres: Matemática, Informática y el EPA con nudos propios (Res. 1578/26) |
| `nudo` | existe | **+ `espacio_id`**. Hoy sólo tiene `disciplina`; el EPA del Orientado queda bien ubicado |
| `nudo_cuatrimestre` | existe | Es el **tramo**. No cambia: ya tiene nudo, cuatrimestre corrido, año y saberes |
| **`concepto`** | **nueva** | Todo el marco que hoy vive en `marco.ts`. `tipo`, `codigo`, `nombre`, `texto`, `diseno_id?`, `tenant_id?`, `orden`, `vigente_desde/hasta` |
| `vinculo` | existe | **+ `origen`** (`lectura`) y **+ `tenant_id?`**. Hoy dice cruces sin decir de quién es la lectura |
| **`vinculo_concepto`** | **nueva** | Qué vínculo de área (de los cuatro normativos) encarna cada cruce. Es el filtro de «cruces decorativos» que ya está escrito en `marco.ts` |

**Los tipos de `concepto`** — la misma tabla sirve para todo lo que se elige de una lista:

| `tipo` | Qué es | Origen |
|---|---|---|
| `perspectiva` | Las cinco Perspectivas (DDHH, Género, Interculturalidad, Ambiental, Inclusión) | norma · 1463/18 |
| `vinculo_area` | Los cuatro vínculos entre Matemática e Informática | norma |
| `objetivo_area`, `objetivo_disciplina` | Los objetivos del área y de cada disciplina | norma |
| `categoria` | saber/poder, capitalismo, soberanía tecnológica, etnomatemática… | norma · 1044/19 |
| `nucleo_problematico` | Los núcleos que el área eligió | escuela |
| `eje_institucional` | Los cuatro ejes de la escuela para 2026 | escuela, con vigencia |
| `criterio_evaluacion` | Los cinco criterios del mapa de área (y los que reemplacen) | escuela, con vigencia |
| `componente_pca`, `item_checklist` | Los ocho componentes y los siete ítems del checklist | norma / escuela |

Con eso, «¿qué Perspectivas aparecen en tu materia?» deja de guardar `"Género · Ambiental"` y
guarda dos ids. Y se puede contar cuántas docentes dicen trabajar la perspectiva Ambiental, en
qué años y en qué unidades.

## Capa 2 · La escuela (con `tenant_id`)

```
escuela ── ciclo_lectivo ── periodo (cuatrimestres o trimestres, con fechas)
   ├── curso (año, división, año calendario)
   ├── espacio_escuela (cómo dicta la escuela cada espacio: ramas)
   ├── puesto (hoy «docente»)
   └── dictado = curso × espacio_escuela × puesto        ← la pieza que falta
          └── bloque (día y hora)
usuario ──< ocupacion >── puesto        (quién ocupa qué, desde cuándo, con qué rol)
usuario ──< rol_area >── area_escuela   (coordinación, asesoría, dirección)
```

| Tabla | Estado | Qué cambia |
|---|---|---|
| `escuela` | existe | **+ `orientacion`** (Turismo), `localidad` |
| **`ciclo_lectivo`** + **`periodo`** | **nuevas** | Reemplazan la constante `CICLO`. `periodo` tiene `tipo` (`cuatrimestre` \| `trimestre`), `n`, `desde`, `hasta`. Nos pasó este año: la escuela evalúa por cuatrimestre y los registros estaban por trimestre |
| `curso` | existe | **+ `anio_calendario`**. 3ºA 2026 y 3ºA 2027 son dos grupos distintos |
| **`espacio_escuela`** | **nueva** | `espacio_curricular_id`, `nombre` local, `rama?`. Acá está **Informática rama Programación** e **Informática rama Diseño** en 3º y 4º. En 1º y 2º, Informática sin rama |
| `docente` → **puesto** | existe | Mismo contenido: es el cargo («Matemática · 1º 2º 3º 5º»). Renombrarlo es cosmético y cuesta una migración: se puede dejar el nombre de la tabla y llamarlo puesto en el código |
| **`dictado`** | **nueva** | `curso_id`, `espacio_escuela_id`, `puesto_id`, `horas`, `origen` (`horario` \| `declarado`). **Es la fila que dice «este puesto da Programación en 3º A»** |
| `bloque` | existe | **+ `dictado_id`**. `espacio`, `disciplina` y `docente_id` pasan a derivarse del dictado |
| **`ocupacion`** | **nueva** | `usuario_id`, `puesto_id`, `dictado_id?` (null = todo el puesto), `rol` (`titular` \| `suplente` \| `dupla`), `desde`, `hasta`. Reemplaza `usuario.docente_id`. Quien está en dupla tiene su puesto y sus dictados, como todas |
| **`rol_area`** | **nueva** | Reemplaza `membresia.rol`. La coordinación es de una persona, no de un puesto |
| `usuario_anio` | existe (perfil) | **Se absorbe en `dictado` con `origen = 'declarado'`.** El perfil deja de preguntar años y muestra los dictados de la usuaria: los que salen del horario, más los que ella agrega. Así se resuelve lo que la otra sesión dejó anotado («si hay diferencia con el horario, el perfil la muestra en vez de elegir por ella»): hay una sola lista, y cada fila dice de dónde salió |

**Qué da cada una, en una consulta:**
`usuario → ocupacion → puesto → dictado → (curso.anio, espacio_escuela → espacio_curricular)`.
De ahí salen, sin preguntar nada, sus años, sus materias, **sus tramos esperables** y **sus
cruces**.

## Capa 3 · El trabajo: esperable → planificado → dado

```
nudo_cuatrimestre (esperable)
      ▲
unidad_nudo ── unidad ── plan_materia ── dictado            (planificado)
      ▲
respuesta sobre la unidad  ·  clase_dada                   (dado)
```

| Tabla | Estado | Qué cambia |
|---|---|---|
| `plan_materia` | existe | **+ `dictado_id`**, que reemplaza `curso_id` + `espacio` de texto |
| `unidad`, `unidad_nudo` | existen | Sin cambios de forma. Nudo + cuatrimestre del plan = el tramo |
| **`unidad_concepto`** | **nueva** | Qué Perspectivas, categorías o criterios trabaja la unidad |
| `clase_dada` | existe | **+ `dictado_id`** y **+ `unidad_id`** |
| `planificacion` (PCA), `epa` | existen | `epa` **+ `epa_dictado`**, que reemplaza `curso_id` y el texto libre `docentes` |

**Los temas de marzo** (hoy en `bases2026.ts`) se cargan **como unidades** de los planes de cada
dictado, con sus nudos. Una vez cargados, son el planificado de verdad, y la página de
planificaciones los muestra sin que nadie los escriba de nuevo.

## Capa 4 · Formularios dinámicos

| Tabla | Qué guarda |
|---|---|
| **`encuesta`** | `titulo`, **`motivacion`**, `autora`, `estado` (borrador · abierta · cerrada), `destinatarias` (todas · un rol · ciertos puestos), `periodo_id` |
| **`pregunta`** | `texto`, `ayuda`, `tipo`, `obligatoria`, `clase` (objetivo · subjetivo) **y tres campos que la enganchan al modelo** (abajo) |
| **`respuesta`** | `pregunta_id`, `usuario_id`, **`sobre_tipo` + `sobre_id`**, `valor`. Única por (pregunta, usuaria, sobre) |
| **`respuesta_ref`** | Los ids que eligió (`ref_tipo`, `ref_id`). Es el índice para cruzar |
| **`pregunta_apunta`** | A qué alimenta la pregunta: componente de la PCA, ítem del checklist. Hoy es el «→ PCA 7» escrito a mano |

**Los tres campos que enganchan una pregunta:**

| Campo | Valores | Ejemplo de Bases del área |
|---|---|---|
| **`por`** · se repite por cada… | `nada` · `dictado` · `anio` · `tramo` · `vinculo` · `unidad` · `concepto:<tipo>` | La P21 se repite **por cruce**; las P19–20 **por dictado** |
| **`alcance`** · de cuáles | `mios` (los de sus dictados) · `todos` | La P21 sólo muestra **sus** cruces |
| **`opciones_de`** · de dónde salen las opciones | `manual` · `tramo` · `nudo` · `concepto:<tipo>` · `usuaria` · `puesto` | La P15 ofrece las **Perspectivas** de la tabla; la P39, los **ejes institucionales** vigentes |

**Tipos de pregunta:** corta · párrafo · una opción · varias opciones · número · semana.
(La «semana» existe porque la P21 la pide, y así se puede ubicar en el calendario.)

**Bases del área deja de ser código:** se siembra como una encuesta más, con sus preguntas
enganchadas. El constructor sirve para hacerla y para cualquier otra. Lo que hoy es especial
(la planilla, los cruces, el «¿qué das?») pasa a ser **preguntas con `por`**. El «¿qué das?»
desaparece: sale de los dictados.

## Las referencias: cómo se nombra cualquier cosa

Un solo formato, **`tipo:id`**, con un registro de tipos en `src/lib/server/refs.ts` que sabe,
para cada uno, su rótulo, su link y quién lo puede ver:

`nudo` · `tramo` · `concepto` · `espacio` · `dictado` · `curso` · `puesto` · `usuaria` ·
`unidad` · `vinculo` · `epa` · `reunion` · `acuerdo`

**Regla:** las relaciones centrales siguen siendo **tablas tipadas con clave foránea**
(`unidad_nudo`, `epa_nudo`, `dictado`…), porque la base protege la integridad. Las referencias
genéricas se usan **sólo donde el contenido es abierto**: respuestas, y después, si hace falta,
acuerdos, recursos del recursero y eventos del calendario («este acuerdo es sobre MAT-ALG de 3º»).

## Lo que se puede consultar cuando esté

| Pregunta | Cómo se contesta |
|---|---|
| **Nudos de Matemática de 3º esperables** | `nudo_cuatrimestre` con año 3 y espacio MAT, por cuatrimestre |
| **…planificados** | Esos tramos, unidos a `unidad_nudo → unidad → plan_materia → dictado` de 3º |
| **…dados** | Las respuestas sobre esas unidades (estado, tiempo, apropiación), más `clase_dada` |
| **Qué quedó en deuda en el área** | Tramos esperables sin unidad, o con respuesta «no se va a dar» |
| **Quién da 2º y no contestó** | Dictados de 2º → ocupación → usuaria, menos las respuestas |
| **El enlace entre años** | Lo que 3º marca como imprescindible y dice que entrega, contra lo que 4º dice que espera, contra los tramos de 4º |
| **Todo sobre un nudo** | `respuesta_ref` + `unidad_nudo` + `clase_dada` + cruces, sobre ese `nudo` |
| **Los cruces de este cuatrimestre, con su semana de cada lado** | `vinculo` × dictados de los dos nudos × la respuesta «semana» |

Una vista SQL, **`v_trayecto`** (tramo × dictado × planificado × estado × clases), alimenta una
página nueva: **Trayecto**, con filtros de año, espacio y cuatrimestre, y tres columnas:
esperable · planificado · dado. Con el volumen de un área (miles de filas, no millones) alcanza
con índices; no hace falta materializar nada.

## Multi-escuela

- **El catálogo no tiene `tenant_id`.** Una escuela nueva elige jurisdicción, y las normas
  vigentes le traen áreas, espacios, nudos, tramos y conceptos.
- **Lo que personaliza cada escuela:** su orientación, su ciclo lectivo y sus períodos, sus
  cursos, cómo dicta cada espacio (las ramas), sus puestos, sus conceptos propios (ejes,
  criterios, núcleos elegidos), sus lecturas de cruces y sus encuestas.
- **`TENANT` deja de ser una constante:** sale de la sesión (`locals.usuario.tenantId`). Hoy la
  usan nueve rutas: calendario, checklist, epa, planificaciones, recursero y reuniones.
- **Alta de una escuela:** escuela → ciclo lectivo y períodos → cursos → espacios con sus ramas
  → puestos → dictados (se pueden importar del horario) → cuentas.

---

## En qué orden se ejecuta

Cada fase termina con la app andando. Ninguna borra datos: las columnas viejas conviven hasta
que nadie las lee.

| Fase | Qué | Tablas | Toca |
|:-:|---|---|---|
| **1** | **Catálogo estructurado** | `espacio_curricular`, `concepto`, `vinculo_concepto`; `nudo.espacio_id`, `diseno.ciclo`, `vinculo.origen` | seed, `/programa`, `/mapa`. `marco.ts` pasa a la base |
| **2** | **Quién da qué** | `ciclo_lectivo`, `periodo`, `espacio_escuela`, `dictado`, `ocupacion`, `rol_area`; `bloque.dictado_id`, `curso.anio_calendario` | seed, `/calendario`, **`/perfil`**, `/usuarias`, `TENANT` |
| **3** | **Planificado** | `plan_materia.dictado_id`, `unidad_concepto`; se cargan los temas de marzo como unidades | `/planificaciones` |
| **4** | **Dado** | `clase_dada.dictado_id/unidad_id` | `/planificaciones` |
| **5** | **Formularios dinámicos** | `encuesta`, `pregunta`, `respuesta` (nueva), `respuesta_ref`, `pregunta_apunta` | `/formularios`: constructor, contestar, respuestas. Bases se siembra como encuesta |
| **6** | **Trayecto** | vista `v_trayecto` | página nueva, y «todo sobre un nudo» |

Si el apuro es el formulario para el encuentro del 7–8/10, el camino corto es **1 → 2 → 5**, con
la planilla del nudo B como preguntas «por unidad».

## Decisiones tomadas (23/09/2026)

1. **Quien da una materia en dupla es del área, sin diferencia con las demás.** Tiene su
   puesto y sus dictados como cualquiera. No hay rol de «invitada».
2. **Los temas de marzo se reparten por cuatrimestre** según el nudo que les toca en el diseño.
   Después el área corrige lo que haya quedado mal ubicado.
3. **Los cruces son de cada escuela** (`vinculo.tenant_id`). Más adelante, un «publicar» para
   ofrecerlos como propuesta a las demás.
4. **Los formularios NO escriben en el modelo: todo queda como respuesta**, con `sobre` y
   `respuesta_ref`. El campo `destino` de la pregunta se saca del diseño, y la tabla
   `seguimiento` también: **el «dado» se lee de las respuestas** (sobre cada unidad), más
   `clase_dada`. La vista `v_trayecto` junta las dos fuentes.
5. **`docente` no se renombra:** en el código se llama puesto.

## Coordinación con la otra sesión

- **La fase 2 toca lo que la otra sesión acaba de hacer:** `usuario_anio` y la pantalla del
  perfil, y el calendario (`bloque`). Conviene que **una sola sesión** haga las fases 1 y 2, y que
  la otra no genere migraciones mientras tanto: dos `drizzle-kit generate` en paralelo producen
  dos `0007` y el journal se rompe.
- **Ya pasó una vez:** la otra sesión hace `git add -A`, y en el commit `a5d9137` (el del
  calendario) se llevó una migración `0007_encuestas` que armé esta noche para un constructor
  provisorio. **La deshice** porque este diseño la reemplaza: en el árbol de trabajo figura
  borrada, y también saqué su fila del registro de migraciones de la base local. No se desplegó
  nada, porque el repo no tiene remoto.
