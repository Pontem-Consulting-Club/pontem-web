<template>
  <div>
    <PageBanner title="Consultoría Social" image="/BienvenidaConsultores.jpg" />

    <!-- Métricas -->
    <div class="bg-default border-b border-muted">
      <UContainer>
        <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-muted">
          <div v-for="metric in metrics" :key="metric.label" class="flex flex-col items-center justify-center py-8 px-4 text-center">
            <span class="text-4xl font-bold text-primary-500 leading-none mb-2">{{ metric.value }}</span>
            <span class="text-sm text-muted font-medium">{{ metric.label }}</span>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Proyectos activos -->
    <div class="bg-muted py-16">
      <UContainer>
        <LoadError v-if="error" title="No pudimos cargar los proyectos" :retry="refresh" />
        <template v-else>
          <div class="flex items-center justify-between gap-4 mb-10">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 class="text-title text-highlighted">Proyectos activos</h2>
              <span class="whitespace-nowrap text-xs font-semibold bg-secondary-50 text-secondary-800 border border-secondary-100 rounded-full px-3 py-1">
                {{ activeSemester }}
              </span>
            </div>
            <div v-if="isEditor" class="flex gap-2">
              <UButton icon="i-lucide-plus" color="primary" size="sm" :disabled="isCreating" @click="startCreate">
                Agregar
              </UButton>
            </div>
          </div>

          <div v-if="activeProjects.length === 0 && !isCreating">
            <UEmpty title="No hay proyectos activos" icon="i-lucide-inbox"/>
          </div>
          <UPageGrid v-else>
            <!-- El borrador ocupa el primer lugar de la grilla, como una tarjeta mas. -->
            <ProjectCard v-if="isCreating && draftProject" :project="draftProject" :is-new="true" @created="handleCreated" @cancel-create="cancelCreate" @updated="refresh" />
            <ProjectCard v-for="project in activeProjects" :key="project.id" :project="project" @updated="refresh" />
          </UPageGrid>
        </template>
      </UContainer>
    </div>

    <!-- Historial -->
    <div v-if="!error" class="bg-default py-12">
      <UContainer>
        <h2 class="mb-6 text-heading text-muted">Proyectos anteriores</h2>
        <div class="flex flex-col divide-y divide-muted">
          <ProjectCard v-for="project in pastProjects" :key="project.id" :project="project" layout="row" @updated="refresh" />
          <div v-if="pastProjects.length === 0" class="py-4 text-sm text-muted">
            No hay proyectos anteriores registrados.
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

usePageMeta({
  title: 'Consultoría Social - Pontem',
  description: 'Proyectos de consultoría que equipos de estudiantes de Pontem desarrollan con fundaciones y organizaciones sociales.'
})

const { data, error, refresh } = await useFetch<{ active: ProjectRecord[], past: ProjectRecord[] }>(
  '/api/projects/social-consulting',
  { default: () => ({ active: [], past: [] }) }
)

const activeProjects = computed(() => data.value?.active ?? [])
const pastProjects = computed(() => data.value?.past ?? [])

// El de los proyectos activos; si no tienen, el semestre en curso.
const activeSemester = computed(() =>
  latestSemester(activeProjects.value.map(project => project.semester)) ?? currentSemester()
)

const metrics = [
  { value: '12+', label: 'Proyectos realizados' },
  { value: '10+', label: 'Organizaciones impactadas' },
  { value: '5', label: 'Años de trayectoria' },
  { value: '60+', label: 'Estudiantes participantes' },
]

const { isEditor } = useProfile()
const isCreating = ref(false)
const draftProject = ref<ProjectRecord | null>(null)

const startCreate = () => {
  isCreating.value = true
  draftProject.value = {
    id: 0, title: '', subtitle: null, description: null,
    image_url: null, link: null, link_text: null, is_active: true, semester: currentSemester()
  }
}

const cancelCreate = () => {
  isCreating.value = false
  draftProject.value = null
}

const handleCreated = () => cancelCreate()
</script>
