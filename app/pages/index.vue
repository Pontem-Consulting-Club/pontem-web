<template>
  <div>
    <HomeHero :slides="heroSlides" />
    <HomeSocialConsultingSection />
    <HomeLogosSlider :logos="logosForSlider" />
    <HomeNewsSection />
    <HomeNextEvents />
    <HomeSocialMediaLinks />
  </div>
</template>

<script setup lang="ts">
import heroSlides from '~/assets/data/heroSlides.json'
import logosForSlider from '~/assets/data/logos.json'

useHead({
  title: 'Pontem - Inicio'
})
</script>