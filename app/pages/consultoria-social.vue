<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

useHead({
  title: 'Consultoría Social - Pontem'
})

const { data: projects, status, refresh } = await useFetch<ProjectRecord[]>('/api/projects/social-consulting', {
  default: () => []
})
</script>

<template>
  <div>
    <PageHeader title="Consultoría Social" background-image="/BienvenidaConsultores.jpg" />

    <UContainer class="py-16">
      <div class="text-center mb-12">
        <SectionHeader title="Nuestros Proyectos" centered />
        <SectionDescription
          text="Trabajamos con organizaciones sin fines de lucro para generar impacto social positivo." />
      </div>

      <LoadingSpinner v-if="status === 'pending'" />

      <EmptyState v-else-if="projects && projects.length === 0" message="No hay proyectos disponibles" />

      <div v-else class="flex flex-col gap-10">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" @updated="refresh" />
      </div>
    </UContainer>
  </div>
</template>
