// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxt/eslint',
    '@nuxt/image',
  ],

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