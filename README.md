# Aplicación Web Pontem

Aplicación web de Pontem construida con Nuxt 4, Nuxt UI, Tailwind CSS y el backend de Nitro. La autenticación, la base de datos y el almacenamiento se gestionan con Supabase.

## Requisitos

- Node.js 20 o superior.
- pnpm.
- Docker Desktop o Docker Engine para ejecutar Supabase localmente.
- Supabase CLI.
- Un archivo `.env` en la raíz del proyecto.

## Configuración local

1. Instala las dependencias:

```bash
pnpm install
```

1. Inicia el servicio local de Supabase:

```bash
pnpm supabase login
pnpm supabase start
```

1. Crea el archivo `.env` con las variables del entorno que usa Nuxt y Supabase:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
```

Si trabajas con un proyecto alojado en Supabase en lugar del servicio local, usa la URL y las claves de ese proyecto. Nuxt carga este archivo automáticamente en desarrollo y durante el build.

1. Ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

1. Genera la versión de producción:

```bash
pnpm build
```

1. Previsualiza la compilación de producción:

```bash
pnpm preview
```

## Supabase en local

- La configuración local vive en `supabase/config.toml`.
- Las migraciones están en `supabase/migrations/`.
- Si necesitas recrear la base local desde cero, ejecuta `supabase db reset`.
- La pila local expone la API en `http://127.0.0.1:54321`, la base de datos en `54322` y Supabase Studio en `54323`.
- Usa `supabase status` para revisar los valores locales de URL y claves después de iniciar la pila.

## Funcionalidades

- **Nuxt 4** - Framework principal de la aplicación.
- **Nuxt UI** - Componentes accesibles y listos para producción.
- **Tailwind CSS** - Estilos utilitarios.
- **Nitro** - Rutas de API integradas en el servidor de Nuxt.
- **Supabase Auth y Base de Datos** - Acceso tipado a autenticación y Postgres.
- **Supabase Storage** - Soporte para almacenamiento de imágenes.

## API

Todas las rutas están bajo `/api/`.

### Públicas

- `GET /api/health` - Estado de salud de la aplicación.
- `GET /api/events` - Lista de eventos.
- `GET /api/events/scheduled` - Eventos programados.
- `GET /api/news` - Lista de noticias.
- `GET /api/news/:id` - Detalle de una noticia.
- `GET /api/projects` - Lista de proyectos.
- `GET /api/projects/social-consulting` - Proyectos de consultoría social.
- `GET /api/team` - Lista del equipo.
- `GET /api/team/coordinations` - Coordinaciones del equipo.

### Administrativas

Las siguientes rutas requieren autenticación:

- `POST /api/admin/events` - Crear evento.
- `PUT /api/admin/events/:id` - Actualizar evento.
- `DELETE /api/admin/events/:id` - Eliminar evento.
- `POST /api/admin/news` - Crear noticia.
- `PUT /api/admin/news/:id` - Actualizar noticia.
- `DELETE /api/admin/news/:id` - Eliminar noticia.
- `POST /api/admin/projects` - Crear proyecto.
- `PUT /api/admin/projects/:id` - Actualizar proyecto.
- `DELETE /api/admin/projects/:id` - Eliminar proyecto.
- `POST /api/admin/team` - Crear miembro del equipo.
- `PUT /api/admin/team/:id` - Actualizar miembro del equipo.
- `DELETE /api/admin/team/:id` - Eliminar miembro del equipo.
- `PUT /api/admin/team/coordinations/:coordination` - Actualizar una coordinación.
