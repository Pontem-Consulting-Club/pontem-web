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
  <UContainer class="py-16 flex flex-col gap-20">
    <!-- Encabezado editorial -->
    <section class="flex flex-col items-center text-center gap-4 pt-4">
      <div
        class="inline-flex items-center gap-2 bg-secondary-50 text-secondary-800 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full border border-secondary-100">
        <span class="size-2 rounded-full bg-secondary-300" />
        Learning &amp; Development
      </div>
      <h1 class="mt-2 text-display text-highlighted">
        Material de <span class="text-primary">Estudio</span>
      </h1>
      <p class="text-lg text-muted max-w-xl">
        Accede a nuestra biblioteca de recursos curados para dominar entrevistas estructuradas y potenciar
        tu perfil consultor.
      </p>
    </section>

    <!-- 01 · Ruta de postulación -->
    <section class="flex flex-col gap-8">
      <StudySectionLabel number="01" label="Ruta de postulación" />
      <StudyRouteTimeline :stages="stages" />
    </section>

    <!-- 02 · Biblioteca de casos -->
    <section class="flex flex-col gap-8">
      <StudySectionLabel number="02" label="Biblioteca" />

      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <h2 class="text-title text-highlighted">Casos de Estudio</h2>
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

        <div class="flex flex-col items-center gap-3">
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

    <!-- 03 · Recursos complementarios -->
    <section class="flex flex-col gap-8">
      <StudySectionLabel number="03" label="Recursos" />

      <div class="grid md:grid-cols-2 gap-6">
        <UCard :ui="{ body: 'flex flex-col items-center gap-4 text-center' }">
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
          <h3 class="text-center text-subheading text-highlighted">Case Books Recomendados</h3>
          <p class="text-sm text-muted text-center">
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
</template>
