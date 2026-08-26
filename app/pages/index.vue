<template>
  <div>
    <HomeHero />
    <HomeSocialConsultingSection />
    <HomeLogosSlider :logos="logosForSlider" />
    <HomeNewsSection />
    <HomeNextEvents />
    <HomeSocialMediaLinks />
  </div>
</template>

<script setup lang="ts">
import logosForSlider from '~/assets/data/logos.json'

useHead({
  title: 'Pontem - Inicio'
})
</script>