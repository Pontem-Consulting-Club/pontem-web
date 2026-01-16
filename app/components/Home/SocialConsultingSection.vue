<script setup lang="ts">
</script>

<template>
  <section class="relative py-16 md:py-24 rounded-[48px] mx-2 md:mx-6">
    <UContainer class="text-center">
      <h3 class="text-3xl md:text-4xl font-bold mb-4">
        Consultoría Social
      </h3>
      <p class="text-base max-w-3xl mx-auto text-justify leading-relaxed font-medium pb-4 px-8">
        Aplicamos nuestras habilidades de consultoría para generar impacto social positivo,
        trabajando con organizaciones sin fines de lucro y proyectos comunitarios.
      </p>

      <div class="grid md:grid-cols-3 gap-8 mt-12 px-4">
        <FeatureCard icon="i-lucide-users" title="Trabajo en Equipo"
          description="Colaboramos en equipos multidisciplinarios para resolver problemas complejos."
          icon-color="text-pontemred-500" />

        <FeatureCard icon="i-lucide-lightbulb" title="Innovación"
          description="Desarrollamos soluciones creativas e innovadoras para cada proyecto."
          icon-color="text-pontemteal-500" />

        <FeatureCard icon="i-lucide-heart" title="Impacto Social"
          description="Generamos cambios positivos en la comunidad a través de nuestro trabajo."
          icon-color="text-pontempurple-500" />
      </div>
    </UContainer>
  </section>
</template>
