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
    <div class="bg-elevated pt-16 pb-8 clip-wave-top">
      <UContainer class="flex flex-col gap-4">
        <h2 class="text-title text-highlighted">Consultoras que impulsan el talento</h2>
        <p class="max-w-3xl text-lg text-toned">
          Gracias a nuestra colaboración con estas consultoras, los estudiantes acceden a oportunidades de desarrollo
          profesional y a proyectos con impacto real.
        </p>
      </UContainer>
    </div>

    <!-- La franja repite los logos para el efecto continuo; los lectores de pantalla
         leen la lista de nombres una sola vez. -->
    <ul class="sr-only">
      <li v-for="logo in logos" :key="logo.name">{{ logo.name }}</li>
    </ul>
    <UMarquee pause-on-hover aria-hidden="true" class="bg-elevated"
      :ui="{ root: '[--duration:45s] [--gap:--spacing(24)]' }">
      <img v-for="logo in logos" :key="logo.name" :src="logo.src" :alt="logo.name" class="my-6 h-16 w-auto">
    </UMarquee>
    <div aria-hidden="true" class="bg-elevated pt-[5%] clip-wave-bottom" />
  </section>
</template>
