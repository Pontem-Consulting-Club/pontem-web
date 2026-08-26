<template>
  <div class="absolute inset-0 transition-opacity duration-1000" :class="isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'">
    <!-- Background Image with Grayscale -->
    <div v-if="imageUrl" class="absolute inset-0 bg-cover bg-center grayscale"
      :style="{ backgroundImage: `url(${imageUrl})` }" />
    <div v-else class="absolute inset-0 bg-gray-800" />

    <!-- Dark Overlay -->
    <div class="absolute inset-0 bg-black/60" />

    <!-- Content -->
    <div class="relative z-20 h-full flex items-center">
      <div class="container mx-auto px-4 md:px-8 lg:px-32">
        <div class="max-w-2xl text-white">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {{ slide.title }}
          </h1>
          <h5 v-if="slide.subtitle" class="text-lg md:text-xl mb-8 opacity-90">
            {{ slide.subtitle }}
          </h5>
          <!-- Button for links -->
          <div v-if="slide.link && slide.button_text" class="bg-abstract-gradient h-full w-fit rounded-lg">
            <NuxtLink :id="`hero-cta-${slide.id}`" :to="slide.link" :target="isExternalLink ? '_blank' : undefined"
              :rel="isExternalLink ? 'noopener' : undefined"
              class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-lg font-semibold bg-white/20 hover:bg-white/30 transition-colors relative overflow-hidden">
              <span class="relative z-20">{{ slide.button_text }}</span>
              <span aria-hidden="true" class="absolute inset-0 z-10 pointer-events-none hero-cta-overlay" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeroSlideRecord } from '~/types/content'

const props = defineProps<{
  slide: HeroSlideRecord
  isActive: boolean
}>()

const { url: imageUrl } = useStorageImage(computed(() => props.slide.image_url ?? null))

const isExternalLink = computed(() => props.slide.link?.trim().startsWith('http') ?? false)
</script>
