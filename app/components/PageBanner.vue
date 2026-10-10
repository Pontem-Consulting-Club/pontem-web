<script setup lang="ts">
/**
 * Portada de una página interior: foto oscurecida con el título encima. Es una
 * UPageHero dentro del preset onImage (app/theme/presets.ts).
 */
import type { ButtonProps } from '@nuxt/ui'
import { onImage } from '~/theme/presets'

defineProps<{
  title: string
  description?: string
  image?: string
  /** Llamados a la acción bajo la descripción. */
  links?: ButtonProps[]
}>()
</script>

<template>
  <UTheme :ui="onImage">
    <UPageHero :title="title" :description="description" :links="links" :ui="{ container: 'py-20 sm:py-24 lg:py-28' }">
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
