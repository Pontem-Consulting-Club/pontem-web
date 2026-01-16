<script setup lang="ts">
interface Props {
  logos: string[]
  title?: string
  description?: string
  animationDuration?: number
}

withDefaults(defineProps<Props>(), {
  title: 'Consultoras que impulsan el talento',
  description: 'Gracias a nuestra colaboración con estas consultoras líderes, ofrecemos a los estudiantes oportunidades de desarrollo profesional y la posibilidad de trabajar en proyectos que impactan en el mundo real.',
  animationDuration: 30
})
</script>

<template>
  <div>
    <!-- Header section -->
    <div v-if="title || description" class="w-full bg-black/10 mt-12 clip-path-[ellipse(150%_70%_at_40%_70%)]">
      <div class="text-center py-12 px-4">
        <h3 v-if="title" class="text-2xl font-semibold mb-4">
          {{ title }}
        </h3>
        <p v-if="description" class="max-w-3xl mx-auto">
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Infinite slider -->
    <div class="overflow-hidden bg-black/10">
      <div class="flex animate-scroll py-4" :style="{ animationDuration: `${animationDuration}s` }">
        <div v-for="(logo, index) in [...logos, ...logos, ...logos]" :key="index" class="shrink-0 mr-24 my-6">
          <img :src="logo" :alt="`Logo ${index}`" class="h-[65px] w-auto">
        </div>
      </div>
    </div>

    <!-- Padding slider section -->
    <div aria-hidden="true" class="w-full bg-black/10"
      style="padding-top: 5%; clip-path: ellipse(80% 70% at 30% 0%);" />
  </div>
</template>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-33.33%);
  }
}

.animate-scroll {
  animation: scroll linear infinite;
  width: max-content;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
</style>
