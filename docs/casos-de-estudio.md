# Casos de Estudio

Documentación de la sección de casos de estudio: modelo de datos, API, vistas y el flujo para
llevar el esquema de local a producción.

Antes de esta sección, `/material-estudio` era una página estática servida desde
`app/assets/data/studyMaterials.json`. Ahora convive ese contenido estático (ruta de postulación,
link al Drive, case books) con una biblioteca de casos que se consume desde Supabase, con sus
documentos guardados en Storage.

---

## Modelo de datos

Migración: `supabase/migrations/20260901120000_case_studies.sql`.

### Enums

| Enum | Valores |
|---|---|
| `CaseCategory` | `ESTRATEGIA`, `OPERACIONES`, `FINANZAS`, `MARKETING`, `IMPACTO_SOCIAL` |
| `CaseDifficulty` | `FACIL`, `MEDIO`, `DIFICIL`, `EXPERTO` |
| `CaseResourceKind` | `APUNTE`, `DATASET`, `MASTERCLASS` |

Como pasa con `ClubCoordination`, estos enums están **espejados a mano** en el código y no se
derivan solos. Si se agrega un valor en Postgres hay que actualizar también:

- `app/constants/caseStudies.ts` — arrays de orden, labels, iconos, opciones y validadores del front.
- `server/utils/caseStudies.ts` — validadores del server.
- `app/composables/useCaseStudyColors.ts` — el color de la categoría o dificultad nueva.

### `CaseStudies`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint identity | PK |
| `title` | text NOT NULL | |
| `company` | text | Empresa o consultora del caso |
| `company_logo_url` | text | Path en el bucket `images` (prefijo `cases/`) o ruta de `public/` |
| `category` | `CaseCategory` NOT NULL | |
| `difficulty` | `CaseDifficulty` | |
| `duration_minutes` | integer | Se muestra como "45 min" |
| `case_type` | text | Texto libre: "Case Interview", "Frameworks", … |
| `summary` | text | Párrafo destacado del planteamiento |
| `problem_statement` | text | Qué se le pide resolver al equipo consultor |
| `document_url` | text | Path en el bucket `documents` (prefijo `casos/`) |
| `document_name` | text | Nombre original del archivo, para mostrarlo |
| `document_size_bytes` | bigint | Se formatea a MB en la UI |
| `published_date` | date | |
| `created_at` | timestamptz | default `now()` |

### `CaseStudyResources`

Recursos complementarios de un caso (apuntes, datasets, masterclasses).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint identity | PK |
| `case_study_id` | bigint NOT NULL | FK a `CaseStudies(id)` **`ON DELETE CASCADE`** |
| `kind` | `CaseResourceKind` NOT NULL | Define icono y color en la UI |
| `title` | text NOT NULL | |
| `link` | text | URL externa |
| `document_url` | text | Archivo en `documents/casos/recursos/` |
| `position` | integer NOT NULL | Orden de despliegue, default 0 |
| `created_at` | timestamptz | default `now()` |

Un recurso apunta a un enlace **o** a un archivo; el formulario exige al menos uno de los dos.

### RLS

Mismo patrón que el resto del esquema: `SELECT USING (true)` para todos y acceso completo para
`authenticated` sin distinción de rol.

---

## Storage

| Bucket | Público | Contenido | Migración que lo crea |
|---|---|---|---|
| `images` | sí | Logos de empresas en `cases/` | `20260903140000_images_storage_bucket.sql` |
| `documents` | sí | PDFs en `casos/` y `casos/recursos/` | `20260901120000_case_studies.sql` |

Los dos buckets se crean por SQL y no en `supabase/config.toml`, para que el workflow de migraciones
los replique en canary y producción sin que nadie los cree a mano desde el dashboard. Los inserts son
idempotentes (`ON CONFLICT DO NOTHING`); las políticas de `storage.objects` de `documents` son copia
de las de `images`.

> No declarar un bucket en los dos lados a la vez: si está en `config.toml` **y** en una migración,
> `supabase db reset` se queda esperando una respuesta ("Do you want to overwrite its properties?")
> en cada corrida.

Los PDFs son de **descarga pública**. El botón "Acceso Socios" que aparece en los mockups no se
implementó como restricción: hoy el modelo de auth no tiene roles, así que cualquier usuario
autenticado puede editar todo el contenido del sitio. Restringir las descargas a socios implicaría
antes separar "socio con acceso de lectura" de "editor", y eso es una decisión de producto pendiente.

---

## API

### Públicas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/case-studies` | Lista, ordenada por `published_date` descendente |
| GET | `/api/case-studies/:id` | Detalle con los recursos anidados, ordenados por `position`. 404 si no existe |

### Administrativas (requieren sesión)

| Método | Ruta |
|---|---|
| POST | `/api/admin/case-studies` |
| PUT | `/api/admin/case-studies/:id` |
| DELETE | `/api/admin/case-studies/:id` |
| POST | `/api/admin/case-studies/resources` |
| DELETE | `/api/admin/case-studies/resources/:id` |

Todas abren con `requireUser(event)` y responden 401 sin sesión. Validan título obligatorio y que
los enums recibidos sean válidos (400 si no).

### Manejo de archivos

Los endpoints de creación y edición aceptan `multipart/form-data` con **dos** campos de archivo:
`logo` (imagen) y `document` (PDF). Si el request llega como JSON, se procesa igual sin archivos.

Esa lógica vive en `server/utils/uploads.ts`, que extrae el parseo multipart que en las otras
entidades (eventos, noticias, proyectos, hero slides) está repetido inline en cada handler:

- `parsePayload(event, fileFields)` — lee multipart o JSON indistintamente.
- `uploadToBucket(supabase, bucket, folder, file)` — sube como `<folder>/<uuid>.<ext>`.
- `removeFromBucket(supabase, bucket, path)` — borra respetando `isStorageKey`, para no tocar
  archivos que en realidad viven en `public/` o en una URL externa.

Reglas de limpieza de archivos:

- **PUT**: compara el path guardado con el resultante y borra el anterior si cambió. Cubre tanto el
  reemplazo de un archivo como el caso de que el formulario lo haya quitado (si solo se mirara "vino
  un archivo nuevo", quitar el PDF dejaría la fila en `null` y el archivo huérfano en el bucket).
  El borrado ocurre **después** del update, para no dejar la fila apuntando a un archivo inexistente
  si el update falla.
- **DELETE**: borra el logo, el PDF del caso y los archivos de todos sus recursos. Las filas de
  `CaseStudyResources` caen solas por el `ON DELETE CASCADE`, pero sus archivos no.

---

## Vistas

| Ruta | Archivo |
|---|---|
| `/material-estudio` | `app/pages/material-estudio/index.vue` |
| `/material-estudio/casos/:id` | `app/pages/material-estudio/casos/[id].vue` |
| `/material-estudio/casos/nuevo` | `app/pages/material-estudio/casos/nuevo.vue` |

### Biblioteca (`/material-estudio`)

Secciones, en orden: encabezado editorial, `01 · Ruta de postulación` (las 5 etapas del JSON como
timeline), `02 · Biblioteca` (buscador + filtro de categoría + grilla), banner del casebook
destacado, y `03 · Recursos` (Drive y case books). El buscador y el filtro trabajan **en cliente**
sobre la lista completa, igual que el filtro de noticias.

### Detalle (`/material-estudio/casos/:id`)

Grilla de 12 columnas: 8 de contenido (migas, título, pills de metadata, planteamiento y visor de
PDF) y 4 de barra lateral (descarga, recursos relacionados y, con sesión, el formulario para agregar
un recurso). Con `?edit=1` monta el formulario de edición en lugar del detalle, igual que
`noticias/[id].vue`.

El PDF se embebe con `<object type="application/pdf">` sobre la **URL pública** del bucket, que
resuelve el composable `useStorageFile`. Es distinto de `useStorageImage`, que descarga el blob y
crea un object URL: para un PDF eso obligaría a bajar el archivo entero antes de mostrar nada.

### Componentes

- `app/components/CaseStudy/` — `Card`, `CategoryFilter` (selección única, a diferencia de
  `News/FilterPills` que es multi-select), `EditForm`, `PdfViewer`, `ResourceList`, `ResourceForm`.
- `app/components/Study/` — `SectionLabel` (el rótulo `01 · …`), `RouteTimeline`, `FeaturedCasebook`.

La validación, el armado del `FormData` y las llamadas de crear/editar/borrar están en
`app/composables/useCaseStudyForm.ts`, compartido por la página de alta y la de edición.

### Sobre el diseño

Los mockups venían con su propio sistema de diseño (paleta Material 3, fuentes Sora/Inter/IBM Plex
Mono, iconos Material Symbols). Se respetaron el layout y la jerarquía, pero mapeados al sistema del
sitio para no dejar una sección que parezca de otra web:

| Mockup | Pontem |
|---|---|
| `primary #ab2f01` | `pontemred-500/600` |
| `tertiary #006855` | `pontemteal-700/800` |
| `secondary #1f6392` | `pontempurple-500` |
| Sora / Inter / IBM Plex Mono | Raleway; los labels mono como `uppercase tracking-widest text-xs` |
| Material Symbols | Lucide (`i-lucide-*`) |

Quedó fuera el módulo "Tu progreso" del mockup de detalle: necesita tracking por usuario y hoy no
hay perfiles (la tabla `Users` es legacy y no se usa). También se omitió la barra decorativa
"Análisis → Estrategia → Implementación", porque representa un estado que no existe en los datos.

---

## Desarrollo local

```bash
pnpm install
pnpm supabase start
pnpm supabase db reset   # aplica migraciones + seed
pnpm dev
```

`supabase/seed.sql` es el seed compartido del proyecto: además del resto del contenido de prueba,
carga 4 casos de estudio con sus recursos para poder ver la UI sin cargar datos a mano. Lo consume
`supabase db reset` (`config.toml` → `[db.seed]`) y **no** es una migración, así que el workflow
nunca lo lleva a producción.

Trae una guarda: aborta si la tabla `Team` ya tiene filas, para que nadie vacíe una base con
contenido por accidente. Si de verdad hay que re-sembrar, correr antes
`set pontem.allow_reseed = 'on';`. Al agregar una tabla nueva hay que sumarla al `truncate` del
comienzo del archivo.

Para probar la edición hace falta un usuario: crearlo en Studio (`http://127.0.0.1:54323`) en
Authentication → Users, y entrar por `/login`.

### Si `pnpm supabase` no encuentra el binario

Síntoma: `pnpm install` avisa `Failed to create bin at node_modules/.bin/supabase` y después
`pnpm supabase start` falla.

El postinstall de `supabase` es el que descarga la CLI, y pnpm no corre scripts de instalación si
el paquete no está autorizado en `pnpm-workspace.yaml`. pnpm 11 renombró esa clave de
`onlyBuiltDependencies` a `allowBuilds`, así que el archivo declara **las dos** y hay que mantenerlas
sincronizadas al agregar una dependencia con scripts. Si el archivo quedó con valores de plantilla
(`set this to true or false`, que es lo que escribe pnpm 11 cuando encuentra paquetes sin decidir),
reemplazarlos por `true` y reinstalar.

### Si el storage responde 502

Cuando los contenedores se reinician, Kong puede quedar apuntando a la IP anterior del contenedor de
storage y devolver 502 en todo `/storage/v1/*`:

```bash
docker restart supabase_kong_pontem-web
```

---

## Cómo llegan las migraciones a canary y producción

Ya **no** es un paso manual: lo hace el workflow `.github/workflows/supabase-migrations.yml`, que
corre `supabase db push` en cada push que toque `supabase/migrations/**` o `supabase/config.toml`.

| Rama | Proyecto Supabase |
|---|---|
| `develop` | Pontem Web - Canary (`gwlfogchwhaimsxjvikj`) |
| `main` | Pontem Web - Prod (`equfcqojbefvynuppxoq`) |

Canary ya no comparte base con producción: tiene su propio proyecto. Esto reemplaza lo que dice la
sección 4 del documento de traspaso TI, escrita cuando el push era manual y los dos ambientes
compartían la base.

Qué implica para esta sección:

- Al mergear a `develop`, las tablas de casos de estudio se crean solas en canary. Al mergear a
  `main`, en producción.
- El workflow se dispara **solo** si el push toca `supabase/`. Un cambio que use una columna nueva
  sin tocar migraciones no dispara nada.
- El deploy del código (Vercel) y el de migraciones (Actions) siguen siendo procesos separados y no
  hay gate que los ordene: si el deploy del código gana la carrera, la sección va a fallar hasta que
  termine el workflow.
- El seed **no** viaja por este camino. Canary arranca sin casos de estudio hasta que se carguen a
  mano o se aplique `seed.sql` contra ese proyecto a propósito.

Después de cambiar el esquema en local, regenerar los tipos (sigue siendo manual, no hay script):

```bash
pnpm supabase gen types typescript --local > app/types/database.types.ts
```
