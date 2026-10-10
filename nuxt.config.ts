// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

// Para las vistas previas al compartir: og:image tiene que ser una URL absoluta.
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://www.pontemcc.cl'
const siteDescription = 'Club de consultoría de estudiantes: proyectos de consultoría social, '
  + 'eventos con consultoras y material para preparar entrevistas.'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Valores por defecto de todas las páginas; cada página pone su título y su
  // descripción con usePageMeta.
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'description', content: siteDescription },
        { property: 'og:site_name', content: 'Pontem Consulting Club' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_CL' },
        { property: 'og:description', content: siteDescription },
        { property: 'og:image', content: `${siteUrl}/og-pontem.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Logo de Pontem Consulting Club' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ]
    }
  },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxt/eslint',
    '@nuxt/image',
  ],

  // El sitio solo tiene diseño claro. Con el modo de color activo, un sistema en
  // modo oscuro ponía <html class="dark"> y los textos sin color propio (como el
  // título del formulario de eventos) quedaban blancos sobre tarjetas blancas.
  ui: {
    colorMode: false,
    theme: {
      // `tertiary` (morado de marca) se suma a los colores de Nuxt UI; su paleta
      // se asigna en app/theme/colors.ts.
      colors: ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
    }
  },

  // Raleway desde Google, descargada en el build y servida desde el sitio (WOFF2).
  fonts: {
    families: [{
      name: 'Raleway',
      provider: 'google',
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext']
    }]
  },

  supabase: {
    key: process.env.SUPABASE_PUBLISHABLE_KEY, // Esta llave se llama así en la integración de Supabase para Vercel
    // Solo la usa el servidor para invitar cuentas (FR-02). El módulo la busca
    // por defecto en SUPABASE_SERVICE_KEY, pero aquí la llave se llama
    // SUPABASE_SECRET_KEY, igual que en la integración de Vercel.
    serviceKey: process.env.SUPABASE_SECRET_KEY,
    // El sitio es publico: la redirección global del módulo queda apagada y cada
    // página protegida declara su propio middleware (`auth` o `admin`). Antes esto
    // se conseguía con `include: ['']`, que funcionaba de casualidad porque el
    // plugin ignora los patrones vacíos; con una lista vacía de verdad el módulo
    // protege TODO y el sitio público deja de verse.
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/',
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})