<script setup lang="ts">
/**
 * Portada de una sección pública: foto oscurecida con el título encima, nada más.
 * La introducción y los llamados a la acción van debajo, en la página. Es una
 * UPageHero dentro del preset onImage (app/theme/presets.ts).
 */
import { onImage } from '~/theme/presets'

defineProps<{
  title: string
  image?: string
}>()
</script>

<template>
  <UTheme :ui="onImage">
    <UPageHero :title="title" :ui="{ container: 'py-20 sm:py-24 lg:py-28' }">
      <template #top>
        <!-- Es lo primero que se ve: va con prioridad. Sin `preload`: NuxtImg precarga
             la variante más grande (3072 px) aunque la pantalla pida otra. -->
        <NuxtImg v-if="image" :src="image" preset="banner" fetchpriority="high"
          alt="" class="absolute inset-0 -z-10 size-full object-cover" />
        <div aria-hidden="true" class="absolute inset-0 -z-10 bg-black/50" />
      </template>
    </UPageHero>
  </UTheme>
</template>
