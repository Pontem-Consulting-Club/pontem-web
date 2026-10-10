<template>
  <div>
    <PageBanner title="Consultoría Social" image="/BienvenidaConsultores.jpg" :description="intro" :links="callsToAction" />

    <UPageSection v-if="error">
      <LoadError title="No pudimos cargar los proyectos" :retry="refresh" />
    </UPageSection>

    <template v-else>
      <!-- Proyectos activos. Sin ninguno, los visitantes no ven la sección (antes era
           lo primero de la página, vacío); quien edita la ve para poder agregar. -->
      <UPageSection v-if="activeProjects.length > 0 || isEditor" title="Proyectos activos" :headline="activeSemester"
        :links="isEditor ? [{ label: 'Agregar', icon: 'i-lucide-plus', disabled: editorOpen, onClick: startCreate }] : []"
        class="bg-muted">
        <UEmpty v-if="activeProjects.length === 0 && !isCreating" icon="i-lucide-inbox" title="No hay proyectos activos"
          description="Mientras no haya ninguno, los visitantes no ven esta sección." />
        <UPageGrid v-else :class="gridClass(activeProjects.length + (isCreating ? 1 : 0))">
          <!-- El borrador ocupa el primer lugar de la grilla, como una tarjeta más. -->
          <ProjectCard v-if="isCreating && draftProject" :project="draftProject" :is-new="true" @created="handleCreated"
            @cancel-create="cancelCreate" @updated="refresh" />
          <ProjectCard v-for="project in activeProjects" :key="project.id" :project="project" @updated="refresh" />
        </UPageGrid>
      </UPageSection>

      <UPageSection title="Proyectos anteriores">
        <UEmpty v-if="pastProjects.length === 0" icon="i-lucide-archive" title="Todavía no hay proyectos anteriores" />
        <UPageGrid v-else :class="gridClass(pastProjects.length)">
          <ProjectCard v-for="project in pastProjects" :key="project.id" :project="project" show-semester
            @updated="refresh" />
        </UPageGrid>
      </UPageSection>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { ProjectRecord } from '~/types/content'

usePageMeta({
  title: 'Consultoría Social - Pontem',
  description: 'Proyectos de consultoría que equipos de estudiantes de Pontem desarrollan con fundaciones y organizaciones sociales.'
})

const intro = 'Trabajamos con organizaciones, fundaciones y empresas con fines sociales en estrategia, finanzas y '
  + 'operaciones. Nuestros consultores desarrollan habilidades clave mientras fortalecen organizaciones que trabajan '
  + 'por el bien de la sociedad.'

// Uno para cada público: organizaciones que buscan apoyo y estudiantes.
const callsToAction: ButtonProps[] = [
  { label: 'Escríbenos', icon: 'i-lucide-mail', to: 'mailto:clubconsultoria.uc@gmail.com' },
  { label: 'Conoce el club', trailingIcon: 'i-lucide-arrow-right', to: '/nosotros' }
]

// Mientras hay un formulario abierto, "Agregar" queda desactivado.
const { anyOpen: editorOpen } = useEditorSlot()

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

// Con una o dos tarjetas, la grilla de tres dejaba el resto de la fila vacío:
// se angosta y se centra.
const gridClass = (count: number) => {
  if (count === 1) return 'sm:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto w-full'
  if (count === 2) return 'lg:grid-cols-2 max-w-4xl mx-auto w-full'
  return undefined
}

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
