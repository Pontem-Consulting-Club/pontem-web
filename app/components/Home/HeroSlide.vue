<template>
  <!-- inert: los enlaces de las slides ocultas no reciben el foco del teclado. -->
  <div class="absolute inset-0 transition-opacity duration-1000" :class="isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'"
    :inert="!isActive">
    <!-- La foto pasa por el optimizador. Antes era un fondo CSS: las cuatro se
         descargaban enteras al entrar, también en celular. -->
    <NuxtImg v-if="imageUrl && load" :src="imageUrl" preset="banner" alt=""
      :fetchpriority="priority ? 'high' : undefined" :loading="priority ? 'eager' : 'lazy'"
      class="absolute inset-0 size-full object-cover grayscale" />
    <div v-else class="absolute inset-0 bg-inverted" />

    <!-- Dark Overlay -->
    <div class="absolute inset-0 bg-black/60" />

    <!-- Content -->
    <div class="relative z-20 h-full flex items-center">
      <!-- Mismo contenedor que el resto de la página: el título queda alineado con
           los títulos de las secciones de abajo. -->
      <UContainer class="w-full">
        <div class="max-w-2xl text-white">
          <h2 class="mb-4 text-display">
            {{ slide.title }}
          </h2>
          <p v-if="slide.subtitle" class="mb-8 text-lg opacity-90 md:text-xl">
            {{ slide.subtitle }}
          </p>
          <!-- El fundido Pontem dentro de un vidrio (onImageButton). -->
          <UButton v-if="slide.link && slide.button_text" :id="`hero-cta-${slide.id}`" :to="slide.link"
            :target="isExternalLink ? '_blank' : undefined" size="xl" variant="solid" :class="onImageButton">
            {{ slide.button_text }}
          </UButton>
        </div>
      </UContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeroSlideRecord } from '~/types/content'
import { onImageButton } from '~/theme/presets'

const props = withDefaults(defineProps<{
  slide: HeroSlideRecord
  isActive: boolean
  /** Si ya se puede pedir la foto: la actual y la siguiente (Hero decide). */
  load?: boolean
  /** La primera slide: se pide antes que todo lo demás. */
  priority?: boolean
}>(), {
  load: true,
  priority: false
})

const { url: imageUrl } = useStorageImage(computed(() => props.slide.image_url ?? null))

const isExternalLink = computed(() => props.slide.link?.trim().startsWith('http') ?? false)
</script>
