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