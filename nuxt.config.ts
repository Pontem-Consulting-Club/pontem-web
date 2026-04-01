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
    redirectOptions: {
      login: '/login',
      callback: '/',
      include: [''],
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})