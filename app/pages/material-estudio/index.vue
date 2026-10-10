<script setup lang="ts">
import studyMaterials from '~/assets/data/studyMaterials.json'
import type { CaseStudyRecord } from '~/types/content'
import type { CaseStudyTab } from '~/constants/caseStudies'
import { getCaseCategoryLabel } from '~/constants/caseStudies'

useHead({
  title: studyMaterials.title
})

const stages = studyMaterials.stages
const caseBooks = studyMaterials.caseBooks

const { isEditor } = useProfile()

const { data: caseStudies, status } = await useFetch<CaseStudyRecord[]>('/api/case-studies', {
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

const openDrive = () => {
  window.open(studyMaterials.driveLink, '_blank')
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
          <UInput v-model="search" icon="i-lucide-search" size="lg" class="md:w-96"
            placeholder="Buscar por empresa, área o palabra clave..." />
          <UButton v-if="isEditor" to="/material-estudio/casos/nuevo" icon="i-lucide-plus"
            size="lg" class="shrink-0">
            Agregar
          </UButton>
        </div>
      </div>

      <CaseStudyCategoryFilter v-model="selectedCategory" :counts="tabCounts" :total="caseStudies.length" />

      <LoadingSpinner v-if="status === 'pending'" />

      <UEmpty v-else-if="filteredCaseStudies.length === 0" icon="i-lucide-folder-search"
        :message="caseStudies.length === 0
          ? 'Todavía no hay casos de estudio publicados'
          : 'Ningún caso coincide con tu búsqueda'" />

      <UPageGrid v-else>
        <CaseStudyCard v-for="caseStudy in filteredCaseStudies" :key="caseStudy.id" :case-study="caseStudy" />
      </UPageGrid>
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
          <button class="flex-1 w-full flex items-center justify-center cursor-pointer group" aria-label="Abrir Drive de Estudio" @click="openDrive">
            <img src="/drive-logo.png" alt="Google Drive" class="h-16 w-auto group-hover:scale-105 transition-transform">
          </button>
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
