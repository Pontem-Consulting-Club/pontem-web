<template>
  <!-- Textos propios de Nuxt UI (cerrar, anterior, siguiente...) en español. -->
  <UApp :locale="es">
    <div class="flex min-h-screen flex-col bg-brand-wash">
      <AppNavbar />
      <main class="w-full grow mt-20">
        <slot />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { es } from '@nuxt/ui/locale'
</script>
