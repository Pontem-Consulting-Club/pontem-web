<template>
  <section class="relative h-[80vh] w-full overflow-hidden">
    <!-- Slides -->
    <div v-for="(slide, index) in slides" :key="slide.id" class="absolute inset-0 transition-opacity duration-1000"
      :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'">
      <!-- Background Image with Grayscale -->
      <div class="absolute inset-0 bg-cover bg-center grayscale"
        :style="{ backgroundImage: `url(${slide.imageUrl})` }" />

      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-black/60" />

      <!-- Content -->
      <div class="relative z-20 h-full flex items-center">
        <div class="container mx-auto px-4 md:px-8 lg:px-32">
          <div class="max-w-2xl text-white">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {{ slide.title }}
            </h1>
            <h5 class="text-lg md:text-xl mb-8 opacity-90">
              {{ slide.subtitle }}
            </h5>
            <!-- Button for links -->
            <div class="bg-abstract-gradient h-full w-fit rounded-lg">
            <NuxtLink :id="`hero-cta-${slide.id}`" :to="slide.link"
            class="inline-flex items-center justify-center rounded-lg px-6 py-3 text-lg font-semibold bg-white/20 hover:bg-white/30 transition-colors relative overflow-hidden">
              <span class="relative z-20">{{ slide.buttonText }}</span>
              <span aria-hidden="true" class="absolute inset-0 z-10 pointer-events-none hero-cta-overlay" />
            </NuxtLink>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide Indicators -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
      <button v-for="(slide, index) in slides" :key="slide.id" class="w-4 h-2 rounded-lg transition-all duration-300"
        :class="currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'"
        :aria-label="`Go to slide ${index + 1}`" @click="goToSlide(index)" />
    </div>
  </section>
</template>

<script setup lang="ts">

interface Slide {
  id: number
  title: string
  subtitle: string
  buttonText: string
  imageUrl: string
  link: string
  external: boolean
}

interface Props {
  slides: Slide[]
  autoplayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoplayInterval: 6000
})

const currentSlide = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null



const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.slides.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

onMounted(() => {
  intervalId = setInterval(nextSlide, props.autoplayInterval)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

</script>
