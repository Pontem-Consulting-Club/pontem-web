<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

useHead({
  title: 'Consultoría Social - Pontem'
})

const { data: projects, status, refresh } = await useFetch<ProjectRecord[]>('/api/projects/social-consulting', {
  default: () => []
})

const { isAuthenticated } = useAuth()
const isCreating = ref(false)
const draftProject = ref<ProjectRecord | null>(null)

const startCreate = () => {
  isCreating.value = true
  draftProject.value = {
    id: 0,
    title: '',
    subtitle: null,
    description: null,
    image_url: null,
    link: null,
    link_text: null
  }
}

const cancelCreate = () => {
  isCreating.value = false
  draftProject.value = null
}

const handleCreated = () => {
  cancelCreate()
}
</script>

<template>
  <div>
    <PageHeader title="Consultoría Social" background-image="/BienvenidaConsultores.jpg" />

    <UContainer class="py-16">
      <div v-if="isAuthenticated" class="flex justify-end mb-6">
        <UButton icon="i-lucide-plus" variant="soft" color="primary" size="md" :disabled="isCreating"
          @click="startCreate">
          Agregar
        </UButton>
      </div>
      <div class="text-center mb-12">
        <SectionHeader title="Nuestros Proyectos" centered />
        <SectionDescription
          text="Trabajamos con organizaciones sin fines de lucro para generar impacto social positivo." />
      </div>

      <LoadingSpinner v-if="status === 'pending'" />

      <div v-if="isCreating && draftProject" class="flex flex-col gap-10 mb-10">
        <ProjectCard :project="draftProject" :is-new="true" @created="handleCreated" @cancel-create="cancelCreate"
          @updated="refresh" />
      </div>

      <EmptyState v-else-if="projects && projects.length === 0" message="No hay proyectos disponibles" />

      <div v-else class="flex flex-col gap-10">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" @updated="refresh" />
      </div>
    </UContainer>
  </div>
</template>
