<script setup lang="ts">
/**
 * Portada de una página interior: foto oscurecida con el título encima. Es una
 * UPageHero dentro del preset onImage (app/theme/presets.ts).
 */
import { onImage } from '~/theme/presets'

defineProps<{
  title: string
  description?: string
  image?: string
}>()
</script>

<template>
  <UTheme :ui="onImage">
    <UPageHero :title="title" :description="description" :ui="{ container: 'py-20 sm:py-24 lg:py-28' }">
      <template #top>
        <NuxtImg v-if="image" :src="image"
          alt="" class="absolute inset-0 -z-10 size-full object-cover" />
        <div aria-hidden="true" class="absolute inset-0 -z-10 bg-black/50" />
      </template>
    </UPageHero>
  </UTheme>
</template>
