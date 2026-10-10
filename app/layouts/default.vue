<template>
  <!-- Textos propios de Nuxt UI (cerrar, abrir menú, siguiente...) en español. -->
  <UApp :locale="es">
    <div class="flex min-h-screen flex-col bg-brand-wash">
      <AppNavbar />
      <UMain class="grow">
        <slot />
      </UMain>
      <AppFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { es } from '@nuxt/ui/locale'
</script>
