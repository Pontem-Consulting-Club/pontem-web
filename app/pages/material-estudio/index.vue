<script setup lang="ts">
import studyMaterials from '~/assets/data/studyMaterials.json'
import type { CaseStudyRecord } from '~/types/content'
import type { CaseStudyTab } from '~/constants/caseStudies'
import { getCaseCategoryLabel } from '~/constants/caseStudies'

usePageMeta({
  title: studyMaterials.title,
  description: 'Casos de estudio, casebooks y recursos para preparar entrevistas de consultoría, ordenados por etapa de la postulación.'
})

const stages = studyMaterials.stages
const caseBooks = studyMaterials.caseBooks

const { isEditor } = useProfile()
const { isAuthenticated } = useAuth()
const { canTrack } = useMyCaseProgress()

const { data: caseStudies, error, refresh } = await useFetch<CaseStudyRecord[]>('/api/case-studies', {
  default: () => []
})

const search = ref('')
const selectedCategory = ref<CaseStudyTab | null>(null)

// Un caso sin categoria es un casebook: va en su propia pestana.
const tabOf = (caseStudy: CaseStudyRecord): CaseStudyTab => caseStudy.category ?? 'casebooks'

const tabCounts = computed(() => {
  const counts: Partial<Record<CaseStudyTab, number>> = {}
  for (const caseStudy of caseStudies.value || []) {
    const tab = tabOf(caseStudy)
    counts[tab] = (counts[tab] ?? 0) + 1
  }
  return counts
})

const filteredCaseStudies = computed(() => {
  const term = search.value.trim().toLowerCase()

  return (caseStudies.value || []).filter((caseStudy) => {
    if (selectedCategory.value && tabOf(caseStudy) !== selectedCategory.value) {
      return false
    }

    if (!term) return true

    const haystack = [
      caseStudy.title,
      caseStudy.company,
      caseStudy.case_type,
      caseStudy.summary,
      getCaseCategoryLabel(caseStudy.category)
    ]

    return haystack.some(value => value?.toLowerCase().includes(term))
  })
})

// Se muestran de a 12: con los 50 casos de una vez, el casebook destacado y los
// recursos quedaban al fondo de una lista muy larga. Al filtrar se vuelve a 12.
const PAGE_SIZE = 12
const visibleCount = ref(PAGE_SIZE)
watch([search, selectedCategory], () => { visibleCount.value = PAGE_SIZE })
const visibleCaseStudies = computed(() => filteredCaseStudies.value.slice(0, visibleCount.value))
const remaining = computed(() => filteredCaseStudies.value.length - visibleCaseStudies.value.length)

const clearFilters = () => {
  search.value = ''
  selectedCategory.value = null
}
</script>

<template>
  <div>
  <!-- Como las demás secciones públicas: banner con foto y solo el título. -->
  <PageBanner title="Material de Estudio" page="material-estudio" />

  <UContainer class="py-12 sm:py-16 flex flex-col gap-20">
    <p class="max-w-3xl text-lg/relaxed text-toned">
      Casos de estudio, casebooks y recursos para preparar las entrevistas de consultoría, ordenados por etapa de
      la postulación.
    </p>

    <!-- Registro abierto: el progreso es la razón para crear una cuenta. -->
    <UAlert v-if="!isAuthenticated" icon="i-lucide-chart-no-axes-column" color="primary" variant="soft"
      title="Guarda tu progreso"
      description="Crea una cuenta gratis para marcar los casos que resolviste, autoevaluarte y tomar notas."
      :actions="[
        { label: 'Crear cuenta', to: '/registro?redirect=/material-estudio' },
        { label: 'Iniciar sesión', to: '/login?redirect=/material-estudio', variant: 'ghost', color: 'neutral' }
      ]" class="-mt-12" />
    <div v-else-if="canTrack" class="-mt-12">
      <UButton to="/mi-progreso" icon="i-lucide-chart-no-axes-column" variant="outline">
        Ver mi progreso
      </UButton>
    </div>

    <section class="flex flex-col gap-8">
      <h2 class="text-title text-highlighted">Ruta de postulación</h2>
      <StudyRouteTimeline :stages="stages" />
    </section>

    <section class="flex flex-col gap-8">

      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <h2 class="text-title text-highlighted">Casos de estudio</h2>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <UInput v-model="search" icon="i-lucide-search" size="lg" class="md:w-96" type="search"
            aria-label="Buscar casos de estudio"
            placeholder="Buscar por empresa, área o palabra clave..." />
          <UButton v-if="isEditor" to="/material-estudio/casos/nuevo" icon="i-lucide-plus"
            size="lg" class="shrink-0">
            Agregar
          </UButton>
        </div>
      </div>

      <CaseStudyCategoryFilter v-model="selectedCategory" :counts="tabCounts" :total="caseStudies.length" />

      <LoadError v-if="error" title="No pudimos cargar los casos de estudio" :retry="refresh" />

      <UEmpty v-else-if="caseStudies.length === 0" icon="i-lucide-folder-search"
        title="Todavía no hay casos de estudio publicados" />

      <UEmpty v-else-if="filteredCaseStudies.length === 0" icon="i-lucide-folder-search"
        title="Ningún caso coincide con tu búsqueda"
        description="Prueba con otra palabra o mira todas las categorías."
        :actions="[{ label: 'Limpiar búsqueda', icon: 'i-lucide-x', onClick: clearFilters }]" />

      <template v-else>
        <UPageGrid>
          <CaseStudyCard v-for="caseStudy in visibleCaseStudies" :key="caseStudy.id" :case-study="caseStudy" />
        </UPageGrid>

        <div class="flex flex-wrap items-center gap-4">
          <p class="text-sm text-muted" aria-live="polite">
            Mostrando {{ visibleCaseStudies.length }} de {{ filteredCaseStudies.length }} casos
          </p>
          <UButton v-if="remaining > 0" color="neutral" variant="outline" icon="i-lucide-chevron-down"
            @click="visibleCount += PAGE_SIZE">
            Mostrar {{ Math.min(remaining, PAGE_SIZE) }} más
          </UButton>
        </div>
      </template>
    </section>

    <!-- Recurso destacado -->
    <StudyFeaturedCasebook />

    <!-- Recursos complementarios -->
    <section class="flex flex-col gap-8">
      <h2 class="text-title text-highlighted">Recursos</h2>

      <div class="grid md:grid-cols-2 gap-6">
        <UCard :ui="{ body: 'flex flex-col items-start gap-4' }">
          <h3 class="text-subheading text-highlighted">Drive de Estudio</h3>
          <p class="text-sm text-muted">
            Solicita acceso a nuestro Drive con todo el material de estudio.
          </p>
          <img src="/drive-logo.png" alt="" class="h-16 w-auto">
          <!-- Antes el único control era el logo, sin texto. -->
          <UButton :to="studyMaterials.driveLink" target="_blank" variant="solid" trailing-icon="i-lucide-external-link"
            aria-label="Abrir el Drive de estudio (se abre en otra pestaña)">
            Abrir el Drive
          </UButton>
        </UCard>

        <UCard :ui="{ body: 'flex flex-col gap-4' }">
          <h3 class="text-subheading text-highlighted">Case Books Recomendados</h3>
          <p class="text-sm text-muted">
            Recursos externos para practicar casos de consultoría.
          </p>
          <div class="flex flex-col gap-3 mt-2">
            <ResourceCard v-for="book in caseBooks" :key="book" icon="i-lucide-book-open" :title="book"
              description="Casos prácticos de entrevistas" />
          </div>
        </UCard>
      </div>
    </section>
  </UContainer>
  </div>
</template>
