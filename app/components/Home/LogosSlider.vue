<script setup lang="ts">
interface Logo {
  name: string
  src: string
}

defineProps<{ logos: Logo[] }>()
</script>

<template>
  <!-- Tres franjas del mismo fondo: borde curvo arriba, logos y borde curvo abajo. -->
  <section class="mt-12">
    <div class="bg-accented/60 px-4 py-12 text-center clip-wave-top">
      <h2 class="text-heading">
        Consultoras que impulsan el talento
      </h2>
      <p class="mx-auto max-w-3xl">
        Gracias a nuestra colaboración con estas consultoras líderes, ofrecemos a los estudiantes oportunidades de
        desarrollo profesional y la posibilidad de trabajar en proyectos que impactan en el mundo real:
      </p>
    </div>

    <!-- La franja repite los logos para el efecto continuo; los lectores de pantalla
         leen la lista de nombres una sola vez. -->
    <ul class="sr-only">
      <li v-for="logo in logos" :key="logo.name">{{ logo.name }}</li>
    </ul>
    <UMarquee pause-on-hover aria-hidden="true" class="bg-accented/60"
      :ui="{ root: '[--duration:45s] [--gap:--spacing(24)]' }">
      <img v-for="logo in logos" :key="logo.name" :src="logo.src" :alt="logo.name" class="my-6 h-16 w-auto">
    </UMarquee>
    <div aria-hidden="true" class="bg-accented/60 pt-[5%] clip-wave-bottom" />
  </section>
</template>
