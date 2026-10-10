<template>
  <!-- Textos propios de Nuxt UI (cerrar, abrir menú, siguiente...) en español. -->
  <UApp :locale="es">
    <!-- El fundido Pontem va detrás de todo; las bandas grises son translúcidas para que
         se vea a través. -->
    <div class="flex min-h-screen flex-col bg-brand-wash">
      <!-- Para teclado: aparece al recibir el foco y salta la navegación. -->
      <a href="#contenido"
        class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-default focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-highlighted focus:shadow-lg focus:outline-2 focus:outline-primary">
        Saltar al contenido
      </a>
      <AppNavbar />
      <UMain id="contenido" tabindex="-1" class="grow focus:outline-none">
        <slot />
      </UMain>
      <AppFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { es } from '@nuxt/ui/locale'
</script>
