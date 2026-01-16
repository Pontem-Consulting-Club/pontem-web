# Aplicación Web Pontem 💻

## Nuxt 4 Application (New) 🚀

This is the new Nuxt 4 + Nuxt UI + TailwindCSS version of the Pontem website. The backend has been migrated to Nuxt's Nitro server.

### Directory: `pontem-nuxt/`

### Setup

1. Install dependencies:

```bash
cd pontem-nuxt
npm install
```

2. Create a `.env` file with the following variables:

```
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

3. Run development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Preview production build:

```bash
npm run preview
```

### Features

- **Nuxt 4** - Latest version of Nuxt framework
- **Nuxt UI** - Beautiful, accessible UI components
- **TailwindCSS** - Utility-first CSS framework
- **Nitro Backend** - Server API routes integrated into Nuxt
- **Supabase Auth & Database** - Managed authentication and Postgres access via `@nuxtjs/supabase`
- **Supabase Storage** - Image storage integration

### API Routes

All API routes are available under `/api/`:

- `GET /api/events/scheduled` - Get all events
- `GET /api/events` - Mirror endpoint for all events
- `GET /api/news/news` - Get all news
- `GET /api/news/:id` - Get news by ID
- `GET /api/projects/social-consulting` - Get all projects
- `GET /api/projects` - Mirror endpoint for all projects
- `GET /api/admin/events` - Admin: Get events (requires auth)
- `POST /api/admin/events` - Admin: Create event (requires auth)
- `PUT /api/admin/events/:id` - Admin: Update event (requires auth)
- `DELETE /api/admin/events/:id` - Admin: Delete event (requires auth)
- Similar routes for projects and news
- `GET /api/health` - Health check endpoint

---

## Legacy Applications (Reference)

The original React frontend and Express backend are kept for reference.

### Front End (Legacy) 🌎

Directory: `pontem-frontend/`

#### To run

1. Install dependencies:

```
npm install --legacy-peer-deps
```

2. Start the application:

```
npm start
```

#### .env Example:

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Back End (Legacy) 🌐

Directory: `pontem-backend/`

#### To run

1. Install dependencies:

```
npm install
```

2. Start the server:

```
node src/index.js
```

#### .env Example:

```
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="mysecretjwt"
PORT=8000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```
