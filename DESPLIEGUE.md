# Poner Areal en internet · Railway + coordenadaandina.ar

Todo lo que hace falta del lado del código **ya está hecho y probado**. Lo que queda son
clicks en Railway y dos registros de DNS.

---

## Lo que ya quedó listo

| | |
|---|---|
| **Adaptador** | `@sveltejs/adapter-node`: el build genera `build/` y arranca con `node build` |
| **Migraciones en el arranque** | `npm start` es `node scripts/migrar.mjs && node build`: cada deploy aplica lo que falte antes de levantar. Usa el migrador de `drizzle-orm`, que es dependencia de producción, y no `drizzle-kit` |
| **Config de Railway** | `railway.json`: healthcheck en la portada y reinicio ante fallo. El arranque va en el `start` del `package.json`, que es lo que Railway ejecuta de verdad |
| **Portada pública + login** | `/` es una presentación que puede ver cualquiera. Todo lo demás pide cuenta: correo y clave propios, sesión guardada en la base, 30 días |
| **Usuarias** | Se dan de alta desde `/usuarias` (sólo quien administra) o desde la terminal con `npm run usuaria`. No hay registro abierto |
| **Documentos institucionales** | No van al repositorio: viven en la base y se sirven en `/docs/<archivo>` sólo con sesión abierta. Se cargan con `npm run docs -- subir` |
| **Probado** | Build local OK · portada pública 200 · sin sesión todo redirige a `/entrar` · clave mal no entra · clave bien abre y guarda la sesión · alta de usuarias y guardado de respuestas, funcionando |

**Por qué el login:** adentro hay horarios, acuerdos del área y planificaciones. La portada es
pública porque no dice nada privado; el resto, no.

**Primera cuenta**, una sola vez, desde tu máquina contra la base de Railway:

```bash
DATABASE_URL="…la URL pública de Railway…" npm run usuaria -- alta tu@correo "Tu nombre" "una clave larga"
```

La primera queda como administradora y desde ahí sumás a las demás en `/usuarias`.

---

## Cómo quedó · 25/09/2026

| | |
|---|---|
| **Proyecto** | `coordenada-andina` en Railway |
| **Servicios** | `areal` (la app) y `Postgres` |
| **En internet** | **https://coordenadaandina.ar** · `www` redirige a la raíz con 308 · el dominio de Railway, `areal-production.up.railway.app`, sigue respondiendo pero los formularios ahí dan 403, porque `ORIGIN` es el dominio propio |
| **Base** | Las doce migraciones aplicadas en el primer arranque |
| **Repositorio** | `git@github.com:ysyry/coordenadaandina.git`, rama `main`, **público** |

**La historia empieza en un commit.** Los 49 commits de armado local tenían nombres de las
compañeras y el repositorio es público: quedaron en la rama local `historia-completa`, que
no se sube. El `.env` y `documentos/` tampoco se versionan.

**El deploy se hace por CLI** (`railway up`) hasta que se conecte la cuenta de GitHub a
Railway. Con eso conectado, cada `git push` despliega solo.

---

## 1 · Subir el repo

```bash
cd ~/Proyectos/areal
git push origin main
```

---

## 2 · Railway

Esto ya está hecho; queda acá por si hay que rehacerlo o montarlo en otra escuela.

1. **New Project → Deploy from GitHub repo → `coordenadaandina`**, o desde la terminal:
   `railway init` · `railway add --database postgres` · `railway add --service areal` · `railway up`.
2. **New → Database → Add PostgreSQL.** Queda en el mismo proyecto.
3. En el servicio de la app, pestaña **Variables**:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — referencia a la base del proyecto |
| `ORIGIN` | La dirección con la que se entra, tal cual. **Hasta que el dominio resuelva va la de Railway**, `https://…up.railway.app`; después, `https://coordenadaandina.ar` |
| `ADDRESS_HEADER` | `x-forwarded-for` |
| `XFF_DEPTH` | `1` |

> `ADDRESS_HEADER` y `XFF_DEPTH` son para que el freno a la fuerza bruta de `/entrar` vea
> la dirección de quien entra y no la del proxy de Railway. Sin eso, todas las visitas
> comparten dirección.

> **`ORIGIN` no es opcional.** Sin eso, los formularios —entrar, cargar una reunión, el
> checklist— fallan con 403: SvelteKit no puede verificar de dónde viene el POST. Es el error
> más común al pasar de local a servidor.

4. El primer deploy corre las migraciones solo, porque están en el `start`.

5. **Abrir la base al exterior**, una sola vez: servicio **Postgres → Settings → Networking →
   TCP Proxy**, puerto `5432`. Railway agrega entonces la variable `DATABASE_PUBLIC_URL`, que
   es la que usan los comandos de acá abajo. Sin eso, desde tu máquina no se llega a la base:
   `postgres.railway.internal` sólo existe dentro de Railway.

6. **Cargar el catálogo curricular**, una sola vez. Desde tu máquina, con esa URL pública:

```bash
cd ~/Proyectos/areal
DATABASE_URL="postgresql://…la URL pública de Railway…" npm run db:seed
DATABASE_URL="postgresql://…la URL pública de Railway…" npm run db:estructura
```

7. **Subir los documentos institucionales** (el GPS y las circulares), también una sola vez.
   Están en `documentos/`, que no se versiona; si no hacés esto, los cinco enlaces propios
   del recursero dan 404:

```bash
DATABASE_URL="postgresql://…la URL pública de Railway…" npm run docs -- subir
```

---

## 3 · El dominio · hecho el 25/09/2026

DNS en **Cloudflare** (cuenta de Flor), delegado desde **NIC.ar** por Trámites a Distancia
→ *Delegaciones* → los dos nameservers que dio Cloudflare, sin IP en las columnas IPv4/IPv6.
Tardó alrededor de media hora en propagar. En Cloudflare, cuatro registros: los dos CNAME que
pidió Railway —raíz y `www`, **los dos en gris, DNS only**— y los dos TXT `_railway-verify`.
Cloudflare aplana el CNAME de la raíz, que es exactamente lo que NIC.ar no permite hacer solo.
El certificado de Let's Encrypt lo emite Railway sin que haya que hacer nada.

Lo de abajo es el paso a paso, por si hay que repetirlo en otra escuela.

### Cómo se hizo

Railway da un dominio propio (algo como `areal-production.up.railway.app`). Para usar
**coordenadaandina.ar** hay un problema clásico: **en el dominio raíz no se puede poner un
CNAME**, y Railway no da IPs fijas para un registro A.

**La salida limpia: DNS en Cloudflare, que es gratis y sí permite CNAME en la raíz.**

1. Crear cuenta en Cloudflare y agregar `coordenadaandina.ar`.
2. Cloudflare da dos nameservers. **En NIC.ar**, en la administración del dominio, cambiar los
   servidores DNS por esos dos. *(Tarda entre minutos y algunas horas.)*
3. En Railway, servicio de la app → **Settings → Networking → Custom Domain**, agregar
   `coordenadaandina.ar` y también `www.coordenadaandina.ar`. Railway muestra el destino CNAME.
4. En Cloudflare, dos registros, **los dos en gris (DNS only), no naranja**:

| Tipo | Nombre | Destino |
|---|---|---|
| CNAME | `@` | el destino que da Railway |
| CNAME | `www` | el mismo destino |

5. Cuando resuelva, cambiar `ORIGIN` a `https://coordenadaandina.ar` y volver a desplegar.
   **Si `ORIGIN` no coincide con la dirección por la que se entra, todos los formularios
   dan 403.**

> **Si preferís no meter Cloudflare:** usar sólo `www.coordenadaandina.ar` (CNAME común, entra
> en cualquier DNS) y en NIC.ar dejar la raíz redirigida a www, si la ofrecen.

---

## 4 · Lo que conviene saber del costo

Railway no tiene plan gratis real: son unos **5 dólares por mes** de plan Hobby, y el consumo
de la app y la base se descuentan de ahí. **No se duerme** — que es lo que pasaba con el
backend de Pandalyze.

---

## 5 · Después de que esté arriba

- Probar en el celular: entrar, ver el calendario y contestar un bloque del formulario.
- Pasar el link y la clave inicial de cada una **por el grupo de WhatsApp**, no por mail.
- Si hay que sacar a alguien: `/usuarias` → *Dar de baja*. Se le cierran las sesiones al instante.

## 6 · Comandos útiles

| | |
|---|---|
| `npm run dev` | Local |
| `npm run usuaria -- lista` | Ver las cuentas |
| `npm run docs -- lista` | Ver los documentos cargados en la base |
| `npm run build && node build` | Probar el build de producción en la máquina |
| `node scripts/migrar.mjs` | Aplicar migraciones con dependencias de producción |
| `npm run db:studio` | Ver la base |
