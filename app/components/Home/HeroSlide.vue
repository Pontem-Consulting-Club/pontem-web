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
      <div class="container mx-auto px-4 md:px-8 lg:px-32">
        <div class="max-w-2xl text-white">
          <h2 class="mb-4 text-display">
            {{ slide.title }}
          </h2>
          <p v-if="slide.subtitle" class="mb-8 text-lg opacity-90 md:text-xl">
            {{ slide.subtitle }}
          </p>
          <!-- Button for links -->
          <div v-if="slide.link && slide.button_text" class="h-full w-fit rounded-lg bg-brand-wash">
            <NuxtLink :id="`hero-cta-${slide.id}`" :to="slide.link" :target="isExternalLink ? '_blank' : undefined"
              :rel="isExternalLink ? 'noopener' : undefined"
              class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-lg font-semibold bg-white/20 hover:bg-white/30 transition-colors relative overflow-hidden">
              <span class="relative z-20">{{ slide.button_text }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeroSlideRecord } from '~/types/content'

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
