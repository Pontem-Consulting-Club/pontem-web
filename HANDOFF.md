# Documentación de traspaso — Pontem Web

> Guía para el equipo que recibe el proyecto: arquitectura y setup técnico, API y modelo de datos, y despliegue/accesos/operación. No reemplaza al README (guía rápida de arranque); este documento da el contexto necesario para operar el proyecto con autonomía.

## 1. Visión general

Sitio web institucional de Pontem Consulting Club: páginas públicas (inicio, eventos, noticias, proyectos/consultoría social, equipo, material de estudio) más edición de contenido inline para usuarios autenticados. No hay un panel de administración separado; la edición ocurre sobre las mismas tarjetas del sitio público.

**Repositorio:** [Pontem-Consulting-Club/pontem-web](https://github.com/Pontem-Consulting-Club/pontem-web)

## 2. Stack y arquitectura técnica

- **Nuxt 4** (Vue 3) — SSR/SPA framework principal.
- **Nuxt UI 4** — librería de componentes (basada en Tailwind + Reka UI).
- **Tailwind CSS 4** — vía `@tailwindcss/vite`.
- **Nitro** — servidor integrado de Nuxt; todas las rutas de API viven en `server/api/`.
- **Supabase** (`@nuxtjs/supabase`) — Auth, base de datos Postgres y Storage.
- **pnpm** como package manager (hay `pnpm-workspace.yaml`, no es un monorepo real, solo config de pnpm).
- **TypeScript**, ESLint (`@nuxt/eslint`), `vue-tsc` para chequeo de tipos.

### Estructura de carpetas

```text
app/
  components/     # Componentes Vue, organizados por dominio (Event, News, Project, Team, Home, About, App)
  composables/     # useAuth, useStorageImage, useDateFormatting, useNavigation, useNewsTypeColor, useTimeAgo
  constants/       # teamRoles.ts (enum de coordinaciones del club, espejo del enum de Postgres)
  layouts/         # default.vue
  pages/           # index, eventos, noticias, consultoria-social, material-estudio, nosotros, login
  types/           # database.types.ts (tipos generados desde Supabase), content.ts
server/
  api/             # Rutas Nitro (públicas y /admin/*)
  utils/           # requireUser (guard de auth), teamRoles (validación de enum)
supabase/
  config.toml      # Config del stack local de Supabase
  migrations/      # Migraciones SQL (fuente de verdad del esquema)
public/            # Assets estáticos (imágenes institucionales, logos, PDFs)
```

### Modelo de autenticación / edición de contenido

- No hay roles de usuario ni panel admin separado: **cualquier usuario autenticado en Supabase Auth tiene permiso de editar todo el contenido** (eventos, noticias, proyectos, equipo). Es un modelo de "usuarios de confianza" (miembros del club con cuenta), no un sistema de permisos granular.
- `useAuth()` ([app/composables/useAuth.ts](app/composables/useAuth.ts)) expone `login`, `logout`, `isAuthenticated`, `user` sobre el cliente de Supabase.
- En el front, los componentes de tarjeta (`Event/Card.vue`, `News/Card.vue`, `Project/Card.vue`, `Team/Card.vue`) muestran botones de editar/eliminar cuando `isAuthenticated` es `true`, y llaman directo a los endpoints `/api/admin/*` vía `$fetch`.
- En el server, cada ruta `/api/admin/*` llama a `requireUser(event)` ([server/utils/requireUser.ts](server/utils/requireUser.ts)), que valida la sesión de Supabase y lanza 401 si no hay usuario. **La autorización real está en el server** — el `v-if` del front es solo cosmético, no un control de seguridad. Tenlo presente si se agregan features nuevas.
- No hay middleware de rutas ni `definePageMeta` protegiendo páginas completas. La única redirección configurada es `redirectOptions` en `nuxt.config.ts` (login page `/login`, callback `/`).

## 3. API y modelo de datos

Todas las rutas están bajo `/api/`. Implementadas como archivos Nitro (`server/api/**/*.get.ts`, `.post.ts`, etc.), sin capa de validación de esquema — usan checks manuales, ej. `if (!body.title || !body.date)`.

### Rutas públicas (sin auth)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/events` | Lista de eventos |
| GET | `/api/events/scheduled` | Eventos programados/próximos |
| GET | `/api/news` | Lista de noticias |
| GET | `/api/news/:id` | Detalle de noticia |
| GET | `/api/projects` | Lista de proyectos |
| GET | `/api/projects/social-consulting` | Proyectos de consultoría social |
| GET | `/api/team` | Lista del equipo |
| GET | `/api/team/coordinations` | Listado de coordinaciones |

### Rutas administrativas (requieren sesión de Supabase vía `requireUser`)

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST/PUT/DELETE | `/api/admin/events`, `/api/admin/events/:id` | CRUD de eventos |
| POST/PUT/DELETE | `/api/admin/news`, `/api/admin/news/:id` | CRUD de noticias |
| POST/PUT/DELETE | `/api/admin/projects`, `/api/admin/projects/:id` | CRUD de proyectos |
| POST/PUT/DELETE | `/api/admin/team`, `/api/admin/team/:id` | CRUD de miembros del equipo |
| PUT | `/api/admin/team/coordinations/:coordination` | Actualiza imagen/datos de una coordinación |

Las rutas de creación/edición que llevan imagen (eventos, noticias, proyectos) aceptan `multipart/form-data`: parsean el campo `image` y lo suben a Supabase Storage (bucket `images`, ver abajo) antes de guardar la fila. Ver [server/api/admin/events/index.post.ts](server/api/admin/events/index.post.ts) como referencia del patrón (es el mismo en news/projects).

### Modelo de datos (Postgres vía Supabase)

Fuente de verdad: las migraciones en [supabase/migrations/](supabase/migrations/). Tipos TypeScript generados en [app/types/database.types.ts](app/types/database.types.ts). No hay script en `package.json` para regenerarlos — hacerlo a mano con `supabase gen types typescript` tras cada cambio de esquema (conviene agregar un script, ej. `db:types`).

Tablas (schema `public`):

- **Events**: `id, title, subtitle, description, date, location, image_url, link`
- **News**: `id, title, subtitle, content, author, type, published_date, image_url, link`
- **Projects**: `id, title, subtitle, description, image_url, link, link_text, is_active (boolean, default true), semester (text)`
- **Team**: `id, name, coordination (enum), created_at`
- **TeamCoordination**: `coordination (enum, PK implícita), image_url, created_at`
- **Users**: `id, username, password` — no se usa en el código actual (la auth real es Supabase Auth, no esta tabla). **No eliminar:** está reservada como base para perfiles de usuario Pontem a futuro; confirmar el diseño con el equipo de producto antes de tocarla o migrarla.

> ⚠️ **El esquema real de Postgres puede no coincidir con el contenido de `supabase/migrations/`.** El push de migraciones a producción es manual (ver sección 4), así que es posible pushear una migración desde una máquina local sin comitear el archivo al repo, dejando en el historial remoto una entrada sin archivo local equivalente. Las columnas `Projects.is_active` y `Projects.semester` son un caso de esto: su migración vive en [supabase/migrations/20260503165546_projects_is_active_semester.sql](supabase/migrations/20260503165546_projects_is_active_semester.sql), con el mismo timestamp que la entrada correspondiente en el historial remoto, para que `supabase migration list` quede alineado sin necesidad de reescribir nada en producción. Para verificar que el repo sigue reflejando el esquema real, usar `supabase migration list` (compara historial local vs. remoto) y `supabase db pull` (trae el diff real contra la base remota, requiere Docker) — son más confiables que revisar tabla por tabla a mano.

Enum `ClubCoordination`: `DIRECTORS, COMMS_MKT, SOC_CONSULT, PEOPLE_MGMT, LEARNING_DEV, EXTERNAL_REL, IT, FINANCE`. Está espejado a mano en [app/constants/teamRoles.ts](app/constants/teamRoles.ts) (`TEAM_COORDINATIONS`) — si se agrega un valor al enum en Postgres, hay que actualizar ese archivo también (no se deriva automáticamente).

**RLS (Row Level Security):** habilitado en todas las tablas. Patrón consistente: lectura pública (`SELECT USING (true)`) + escritura solo para usuarios `authenticated` (`USING (true)`, sin distinción de rol/dueño). Igual que con la auth de la app, es un modelo "todo autenticado puede escribir todo", no granular.

**Storage:** bucket `images` — lectura pública, escritura solo `authenticated`. Ahí se guardan las imágenes subidas desde los formularios de eventos/noticias/proyectos/equipo (paths como `events/<uuid>.<ext>`).

## 4. Deploy, accesos y operación

### Cómo encajan las piezas

```text
GitHub (repo + cuenta dueña de la organización)
   │
   ├── push/merge a main    → deploy a producción (pontemcc.cl)
   ├── push/merge a develop → deploy a canary.pontemcc.cl
   └── PR abierto            → preview deployment (URL efímera de Vercel)
   │
   ▼
Vercel (hosting del sitio)
   │
   │  integración oficial "Supabase for Vercel"
   │  (inyecta env vars, no hay vercel.json en el repo)
   ▼
Supabase (Auth + Postgres + Storage, proyecto en la nube)
```

- **Código:** GitHub, repo [Pontem-Consulting-Club/pontem-web](https://github.com/Pontem-Consulting-Club/pontem-web). Rama `develop` además de `main`, y ramas de feature por PR (`refactor-*`, `edit-screen`, etc.).
- **Hosting:** Vercel, conectado directo al repo de GitHub, con el comportamiento default de branch deployments (no hay `vercel.json` en el repo, así que la config de dominios/environments por rama vive en el dashboard de Vercel, no está versionada):
  - `main` → producción, `pontemcc.cl`.
  - `develop` → ambiente canary, publicado en **canary.pontemcc.cl**. Sirve para validar que el código/build funciona en un entorno tipo-Vercel antes de mergear a `main`.
  - PRs → preview deployments automáticos con URL propia.
  - **⚠️ Canary comparte el mismo proyecto de Supabase que producción** (misma base de datos, mismo Storage). No es un ambiente aislado: cualquier prueba en canary que cree, edite o borre contenido lo hace sobre datos reales de producción. **Para probar cambios que toquen datos o schema, usar el stack local de Supabase** (`supabase start`, ver "Desarrollo local" abajo) — no canary.
- **Backend:** Supabase (proyecto en la nube), conectado a Vercel vía la **integración oficial "Supabase" del marketplace de Vercel**. Esa integración inyecta automáticamente `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` (de ahí que esas variables se llamen así y no `SUPABASE_ANON_KEY`, como aclara el comentario en `nuxt.config.ts`) — no hace falta cargarlas a mano en Vercel.

### Accesos — todo cuelga de una cuenta de GitHub

El login a Vercel y a Supabase **no usa cuentas propias en cada plataforma**: ambos autentican con "Continue with GitHub", contra la cuenta de GitHub que actúa como **dueña de la organización** (`Pontem-Consulting-Club`). En la práctica:

- Quien tenga acceso a esa cuenta de GitHub (o sea agregado como miembro/colaborador con permisos suficientes en la org) puede entrar tanto a Vercel como a Supabase.
- No hay usuarios/roles separados por plataforma — es un único punto de entrada.
- **Al traspasar el proyecto se transfiere la cuenta de GitHub dueña completa**, no solo se agregan miembros nuevos. Una vez recibida esa cuenta, el acceso a Vercel y Supabase queda heredado automáticamente. Se recomienda, apenas se reciba, cambiar la contraseña y revisar el 2FA/dispositivos con sesión activa.
- El acceso al dominio (registrador, ver abajo) es independiente de esta cuenta de GitHub y debe gestionarse aparte.

### Dominio y DNS

- Dominio: **pontemcc.cl**, registrado en **NIC Chile**, bajo la cuenta `clubconsultoria.uc@gmail.com`. Ese acceso es independiente de GitHub/Vercel/Supabase y debe transferirse o compartirse por separado — sin él no se puede mover el dominio ni cambiar los nameservers.
- Los DNS ya apuntan a Vercel: `ns1.vercel-dns.com` / `ns2.vercel-dns.com`. La gestión de registros/subdominios (como `canary.pontemcc.cl`) se hace desde el dashboard de Vercel una vez dentro del proyecto; el acceso a NIC Chile solo hace falta para cambios a nivel de registrador (renovación, cambio de nameservers, transferencia del dominio en sí).

### Proyecto de Supabase de producción

El proyecto real de producción (y el que usa canary, ya que comparten base) es **`equfcqojbefvynuppxoq.supabase.co`** — es la fuente de verdad del esquema. Antes de enlazar un checkout nuevo o de confiar en el `.env` de una máquina de desarrollo, verificar que `SUPABASE_URL` apunte a este proyecto o al stack local (`http://127.0.0.1:54321`) — no a un ref antiguo o pausado.

### Variables de entorno

Definidas en `.env` (no versionado, ver [.env.example](.env.example)):

```text
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`: usadas por el módulo `@nuxtjs/supabase` en cliente y servidor (config en `nuxt.config.ts`). En producción las setea sola la integración Vercel↔Supabase; en local se obtienen con `supabase status` una vez levantado el stack local, o desde el dashboard de Supabase si se apunta al proyecto en la nube.
- `SUPABASE_SECRET_KEY`: no se lee en ningún lado del código actual (no hay uso de `serverSupabaseServiceRole` ni similar). La integración "Supabase for Vercel" la setea automáticamente junto con el resto de las variables, así que está disponible aunque hoy no se use — reservada para un eventual uso con permisos de service role (por ejemplo, saltarse RLS desde el servidor). No quitarla de `.env.example`/Vercel sin confirmar que nada la necesite.

**Variables adicionales que setea la integración "Supabase for Vercel"** (no están en `.env.example` pero sí llegan a Vercel): `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` — acceso directo a Postgres, útil si en algún momento se necesita conectar con un ORM tipo Prisma o correr SQL directo sin pasar por el cliente de Supabase. Ninguna se usa hoy en el código, pero están disponibles en el dashboard de Vercel (Settings → Environment Variables).

### Desarrollo local

```bash
pnpm install
pnpm supabase login
pnpm supabase start        # levanta Postgres, Auth, Storage y Studio local (requiere Docker)
pnpm dev
```

- Supabase local: API en `http://127.0.0.1:54321`, Postgres en `54322`, Studio en `54323`. Credenciales locales con `supabase status`.
- `supabase db reset` recrea la base local desde las migraciones en `supabase/migrations/`.
- Scripts disponibles: `dev`, `build`, `generate`, `preview`, `lint` (`vue-tsc && eslint . --fix`). No hay tests automatizados en el repo (no hay carpeta `test/` ni dependencias de testing en `package.json`).

### Flujo Supabase: local → producción

Cada máquina de desarrollo debe enlazarse individualmente al proyecto remoto (`supabase link`); ese estado se guarda en `supabase/.temp/` y `supabase/.branches/`, ambos en `.gitignore`, así que no viaja con el repo y hay que rehacerlo en cada clon nuevo. Flujo para cambios de esquema:

1. **Trabajar en local:** con el stack local corriendo (`supabase start`), hacer los cambios de schema en la base local (por Studio en `54323` o SQL directo).
2. **Generar la migración:** `supabase migration new <nombre>` para crearla a mano, o `supabase db diff -f <nombre>` para que la CLI infiera el diff contra el estado local y lo escriba en `supabase/migrations/`.
3. **Probar localmente:** `supabase db reset` aplica todas las migraciones desde cero sobre la base local, para verificar que corren limpio antes de tocar producción.
4. **Enlazar el proyecto remoto** (una vez por máquina/entorno nuevo): `supabase link --project-ref equfcqojbefvynuppxoq`, tras `supabase login` con la cuenta de GitHub que tiene acceso al proyecto.
5. **Aplicar a producción:** `supabase db push` sube las migraciones pendientes al proyecto remoto. **Es un paso manual y siempre lo es** — no hay workflow de GitHub Actions ni hook en Vercel que corra migraciones automáticamente al hacer deploy, y **no se usa branching de Supabase** (el proyecto está en el plan gratuito, que no lo permite). El cambio siempre debe haberse probado antes en local (`supabase db reset` limpio) antes de pushear a producción, dado que canary comparte la misma base.
6. **Regenerar tipos:** tras aplicar el cambio, correr `supabase gen types typescript` y actualizar [app/types/database.types.ts](app/types/database.types.ts) a mano — no hay script en `package.json` para esto.

**Riesgo a tener presente:** el deploy del código (Vercel, automático) y el push de migraciones (Supabase CLI, manual) son procesos separados y desacoplados. Es posible mergear código que espera una columna/tabla nueva sin haber corrido `db push` todavía, o viceversa. No hay gate automático que lo impida.

### Ambiente de staging

Existió un intento de staging aislado (proyecto de Supabase propio, separado de prod), pensado como alternativa al branding nativo de Supabase, que es una función de pago. Ese staging está pausado por inactividad y debe recrearse si se necesita — hoy, en la práctica, los únicos ambientes disponibles son producción, canary (comparte base con prod) y local. Si el equipo va a mergear seguido a `develop`, recrear ese staging (o adoptar Supabase branching de pago) reduce el riesgo de que una prueba en canary toque datos reales.

### Operación / mantenimiento

- **CI:** no hay workflows de GitHub Actions ni pipeline configurado en el repo — el único gate de calidad hoy es lo que corra Vercel en el build (`nuxt build`) más lint/type-check manual local. No hay CI que corra migraciones ni valide que el schema remoto está al día con `supabase/migrations/`.
- **Buenas prácticas de credenciales:** rotar las claves de Supabase (publishable/secret) si en algún momento se sospecha que una quedó expuesta fuera de un gestor de secretos (por ejemplo, compartida por un canal no seguro). Nunca commitear `.env` ni pegar claves en documentación o tickets.

## 5. Pendientes y seguimiento

- **Recrear el ambiente de staging**, o evaluar pasar a un plan de Supabase con branching, para dejar de depender de que canary y producción compartan base de datos.
- **Definir el diseño de perfiles de usuario Pontem** antes de decidir qué hacer con la tabla `Users` legacy.
- Agregar un script en `package.json` para regenerar `app/types/database.types.ts` (hoy es un paso manual).
