<script setup lang="ts">
import type { CaseStudyDetail } from '~/types/content'
import type { CaseStudyFiles } from '~/composables/useCaseStudyForm'
import { CASE_CATEGORY_ICONS, CASE_CATEGORY_LABELS, CASE_DIFFICULTY_LABELS } from '~/constants/caseStudies'

const route = useRoute()
const router = useRouter()
const idParam = route.params.id as string
const numericId = Number(idParam)
const isValidId = !Number.isNaN(numericId)

const { isAuthenticated } = useAuth()
const { getCategoryBadge, getCategoryText, getDifficultyText } = useCaseStudyColors()
const { formatDate } = useDateFormatting()

if (!isValidId) {
  await navigateTo('/material-estudio', { replace: true })
}

const { data: caseStudy, status, error, refresh } = await useFetch<CaseStudyDetail>(
  `/api/case-studies/${numericId}`,
  { immediate: isValidId }
)

useHead({
  title: computed(() => caseStudy.value?.title
    ? `${caseStudy.value.title} - Pontem`
    : 'Caso de estudio - Pontem')
})

const isEditMode = computed(() => {
  const editQuery = route.query.edit
  return editQuery === '1' || editQuery === 'true'
})

const { form, formError, isSaving, isDeleting, update, remove } = useCaseStudyForm()

// El formulario se rehidrata desde el caso cargado cada vez que cambia.
watch(caseStudy, (value) => {
  if (!value) return
  const { resources: _resources, ...fields } = value
  form.value = { ...fields }
  formError.value = ''
}, { immediate: true })

watchEffect(() => {
  if (isEditMode.value && !isAuthenticated.value) {
    router.replace(`/material-estudio/casos/${idParam}`)
  }
})

const documentUrl = useStorageFile(computed(() => caseStudy.value?.document_url ?? null))

const documentSize = computed(() => {
  const bytes = caseStudy.value?.document_size_bytes
  if (!bytes) return null
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

const publishedLabel = computed(() => {
  const value = caseStudy.value?.published_date
  return value ? formatDate(value) : null
})

const handleSubmit = async (files: CaseStudyFiles) => {
  const saved = await update(numericId, files)
  if (!saved) return
  await refresh()
  router.push(`/material-estudio/casos/${idParam}`)
}

const handleCancel = () => {
  router.push(`/material-estudio/casos/${idParam}`)
}

const handleDelete = async () => {
  const deleted = await remove(numericId)
  if (deleted) {
    router.push('/material-estudio')
  }
}
</script>

<template>
  <UContainer class="py-16">
    <LoadingSpinner v-if="status === 'pending'" />

    <NotFoundState v-else-if="error || !caseStudy" icon="i-lucide-file-x" title="Caso de estudio no encontrado"
      button-text="Volver a Material de Estudio" button-link="/material-estudio" />

    <CaseStudyEditForm v-else-if="isEditMode && isAuthenticated" v-model:form="form" :is-saving="isSaving" :is-deleting="isDeleting"
      :form-error="formError" @submit="handleSubmit" @cancel="handleCancel" @delete="handleDelete" />

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Columna principal -->
      <div class="lg:col-span-8 flex flex-col gap-8">
        <div class="flex flex-col gap-4">
          <!-- Migas -->
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <NuxtLink to="/material-estudio" class="hover:text-primary transition-colors">Casos</NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
            <span class="text-gray-600">{{ CASE_CATEGORY_LABELS[caseStudy.category] }}</span>
          </div>

          <div class="flex items-start justify-between gap-4">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {{ caseStudy.title }}
            </h1>
            <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="md" color="primary" variant="soft"
              class="shrink-0" :to="`/material-estudio/casos/${idParam}?edit=1`">
              Editar
            </UButton>
          </div>

          <!-- Metadatos -->
          <div class="flex flex-wrap gap-3">
            <span v-if="caseStudy.company"
              class="bg-pontempurple-50 text-pontempurple-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
              <UIcon name="i-lucide-building-2" class="w-3.5 h-3.5" />
              {{ caseStudy.company }}
            </span>
            <span class="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
              :class="getCategoryBadge(caseStudy.category)">
              <UIcon :name="CASE_CATEGORY_ICONS[caseStudy.category]" class="w-3.5 h-3.5" />
              {{ CASE_CATEGORY_LABELS[caseStudy.category] }}
            </span>
            <span v-if="publishedLabel"
              class="bg-pontemred-50 text-pontemred-600 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
              {{ publishedLabel }}
            </span>
            <span v-if="caseStudy.duration_minutes"
              class="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
              <UIcon name="i-lucide-timer" class="w-3.5 h-3.5" />
              {{ caseStudy.duration_minutes }} min
            </span>
            <span v-if="caseStudy.difficulty"
              class="bg-gray-100 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
              :class="getDifficultyText(caseStudy.difficulty)">
              <UIcon name="i-lucide-signal" class="w-3.5 h-3.5" />
              Dificultad: {{ CASE_DIFFICULTY_LABELS[caseStudy.difficulty] }}
            </span>
          </div>
        </div>

        <!-- Planteamiento -->
        <div v-if="caseStudy.summary || caseStudy.problem_statement"
          class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full" :class="getCategoryBadge(caseStudy.category)" />
          <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-lightbulb" :class="getCategoryText(caseStudy.category)" class="w-5 h-5" />
            Planteamiento del Problema
          </h3>
          <p v-if="caseStudy.summary" class="text-base text-gray-600 leading-relaxed mb-4 text-justify">
            {{ caseStudy.summary }}
          </p>
          <p v-if="caseStudy.problem_statement" class="text-sm text-gray-500 leading-relaxed text-justify">
            {{ caseStudy.problem_statement }}
          </p>
        </div>

        <CaseStudyPdfViewer :document-path="caseStudy.document_url" :document-name="caseStudy.document_name" />
      </div>

      <!-- Barra lateral -->
      <aside class="lg:col-span-4 flex flex-col gap-6">
        <div v-if="documentUrl"
          class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <div class="w-16 h-16 bg-pontemred-50 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-download" class="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">Descargar Caso Completo</h3>
            <p class="text-sm text-gray-500">
              Descarga el documento para revisarlo con calma o imprimirlo.
            </p>
          </div>
          <UButton :to="documentUrl" target="_blank" rel="noopener" external download block size="lg"
            trailing-icon="i-lucide-arrow-right" class="mt-2">
            Descargar PDF{{ documentSize ? ` (${documentSize})` : '' }}
          </UButton>
        </div>

        <CaseStudyResourceList :resources="caseStudy.resources ?? []" @deleted="refresh" />

        <CaseStudyResourceForm v-if="isAuthenticated" :case-study-id="caseStudy.id" @created="refresh" />
      </aside>
    </div>
  </UContainer>
</template>
