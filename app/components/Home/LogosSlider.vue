<template>
  <div>
    <!-- Header section -->
    <div class="w-full bg-black/10 mt-12 clip-path-[ellipse(150%_70%_at_40%_70%)]">
      <div class="text-center py-12 px-4">
        <h3 class="text-2xl font-semibold">
          Consultoras que impulsan el talento
        </h3>
        <p class="max-w-3xl mx-auto">
          Gracias a nuestra colaboración con estas consultoras líderes, ofrecemos a los estudiantes oportunidades de
          desarrollo profesional y la posibilidad de trabajar en proyectos que impactan en el mundo real:
        </p>
      </div>
    </div>

    <!-- Infinite slider -->
    <div class="overflow-hidden bg-black/10">
      <div class="flex animate-scroll py-4" :style="{ animationDuration: `45s` }">
        <div v-for="(logo, index) in repeatedLogos" :key="`${index}-${logo}`" class="shrink-0 mr-24 my-6">
          <img :src="logo" :alt="`Logo ${index}`" class="h-[65px] w-auto">
        </div>
      </div>
    </div>

    <!-- Padding slider section -->
    <div aria-hidden="true" class="w-full bg-black/10"
      style="padding-top: 5%; clip-path: ellipse(80% 70% at 30% 0%);" />
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  logos: {
    type: Array as () => string[],
    required: true
  },
})

const repeatedLogos = computed(() => {
  return Array(2).fill(null).flatMap(() => props.logos)
})
</script>

<style scoped>
@keyframes scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
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