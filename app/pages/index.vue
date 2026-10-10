<template>
  <div>
    <!-- Las portadas rotan; el título de la página no puede depender de cuál se ve. -->
    <h1 class="sr-only">Pontem Consulting Club</h1>
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