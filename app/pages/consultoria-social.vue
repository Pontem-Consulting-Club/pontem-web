<template>
  <div>
    <!-- Hero -->
    <div class="relative h-[420px] flex items-center justify-center text-center overflow-hidden">
      <NuxtImg src="/BienvenidaConsultores.jpg" alt="Consultoría Social" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/50" />
      <div class="relative z-10 flex flex-col items-center px-6">
        <h1 class="text-5xl font-bold text-white leading-tight">
          Consultoría Social
        </h1>
      </div>
    </div>

    <!-- Métricas -->
    <div class="bg-white border-b border-gray-100">
      <UContainer>
        <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          <div v-for="metric in metrics" :key="metric.label" class="flex flex-col items-center justify-center py-8 px-4 text-center">
            <span class="text-4xl font-bold text-pontemred-500 leading-none mb-2">{{ metric.value }}</span>
            <span class="text-sm text-gray-400 font-medium">{{ metric.label }}</span>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Proyectos activos -->
    <div class="bg-gray-50 py-16">
      <UContainer>
        <LoadingSpinner v-if="status === 'pending'" />
        <template v-else>
          <div class="flex items-baseline justify-between mb-10">
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-bold text-gray-900">Proyectos activos</h2>
              <span class="text-xs font-semibold bg-pontemteal-50 text-pontemteal-700 border border-pontemteal-200 rounded-full px-3 py-1">
                2026 — S1
              </span>
            </div>
            <div v-if="isAuthenticated" class="flex gap-2">
              <UButton icon="i-lucide-plus" variant="soft" color="primary" size="sm" :disabled="isCreating" @click="startCreate">
                Agregar
              </UButton>
            </div>
          </div>

          <div v-if="isCreating && draftProject" class="mb-10">
            <ProjectCard :project="draftProject" :is-new="true" @created="handleCreated" @cancel-create="cancelCreate" @updated="refresh" />
          </div>

          <div v-if="activeProjects.length === 0 && !isCreating">
            <EmptyState message="No hay proyectos activos" />
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProjectCard v-for="project in activeProjects" :key="project.id" :project="project" @updated="refresh" />
          </div>
        </template>
      </UContainer>
    </div>

    <!-- Historial -->
    <div class="bg-white py-12">
      <UContainer>
        <h2 class="text-base font-semibold text-gray-400 mb-6">Proyectos anteriores</h2>
        <div class="flex flex-col divide-y divide-gray-100">
          <div v-for="project in pastProjects" :key="project.id" class="grid grid-cols-[120px_1fr_2fr] gap-4 py-3 items-center">
            <span class="text-xs font-semibold text-gray-300 uppercase tracking-wide">{{ project.semester }}</span>
            <span class="text-sm font-semibold text-gray-700">{{ project.title }}</span>
            <span class="text-xs text-gray-400 truncate">{{ project.subtitle }}</span>
          </div>
          <div v-if="pastProjects.length === 0" class="py-4 text-sm text-gray-400">
            No hay proyectos anteriores registrados.
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

useHead({ title: 'Consultoría Social - Pontem' })

const { data, status, refresh } = await useFetch<{ active: ProjectRecord[], past: ProjectRecord[] }>(
  '/api/projects/social-consulting',
  { default: () => ({ active: [], past: [] }) }
)

const activeProjects = computed(() => data.value?.active ?? [])
const pastProjects = computed(() => data.value?.past ?? [])

const metrics = [
  { value: '12+', label: 'Proyectos realizados' },
  { value: '10+', label: 'Organizaciones impactadas' },
  { value: '5', label: 'Años de trayectoria' },
  { value: '60+', label: 'Estudiantes participantes' },
]

const { isAuthenticated } = useAuth()
const isCreating = ref(false)
const draftProject = ref<ProjectRecord | null>(null)

const startCreate = () => {
  isCreating.value = true
  draftProject.value = {
    id: 0, title: '', subtitle: null, description: null,
    image_url: null, link: null, link_text: null, is_active: true, semester: '2026 — S1'
  }
}

const cancelCreate = () => {
  isCreating.value = false
  draftProject.value = null
}

const handleCreated = () => cancelCreate()
</script>
