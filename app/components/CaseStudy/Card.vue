<script setup lang="ts">
import type { CaseStudyRecord } from '~/types/content'
import { CASE_CATEGORY_LABELS, CASE_DIFFICULTY_LABELS } from '~/constants/caseStudies'

const props = defineProps<{
  caseStudy: CaseStudyRecord
}>()

const { isAuthenticated } = useAuth()
const { getCategoryAccent, getCategoryBadge, getCategoryText, getDifficultyText } = useCaseStudyColors()

const { url: logoUrl } = useStorageImage(computed(() => props.caseStudy.company_logo_url ?? null))

const detailLink = computed(() => `/material-estudio/casos/${props.caseStudy.id}`)

const duration = computed(() => {
  const minutes = props.caseStudy.duration_minutes
  return minutes ? `${minutes} min` : null
})
</script>

<template>
  <article
    class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative">
    <!-- Barra de acento segun categoria -->
    <div class="h-1.5 w-full" :class="getCategoryAccent(caseStudy.category)" />

    <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="primary" variant="ghost"
      class="absolute top-4 right-3 z-10" aria-label="Editar caso" :to="`${detailLink}?edit=1`" />

    <div class="p-6 flex flex-col gap-4 flex-1">
      <div class="flex justify-between items-start gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="logoUrl" :src="logoUrl" :alt="caseStudy.company ?? 'Empresa'" class="w-full h-full object-contain p-1">
            <UIcon v-else name="i-lucide-building-2" class="w-4 h-4 text-gray-300" />
          </div>
          <span v-if="caseStudy.company" class="text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">
            {{ caseStudy.company }}
          </span>
        </div>
        <span v-if="duration" class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded shrink-0">
          {{ duration }}
        </span>
      </div>

      <h3 class="text-lg font-bold text-gray-900 leading-snug">
        {{ caseStudy.title }}
      </h3>

      <div class="flex flex-wrap gap-2 mt-auto pt-2">
        <span class="text-xs font-semibold px-2 py-1 rounded" :class="getCategoryBadge(caseStudy.category)">
          {{ CASE_CATEGORY_LABELS[caseStudy.category] }}
        </span>
        <span v-if="caseStudy.case_type" class="text-xs font-semibold px-2 py-1 rounded bg-gray-50 text-gray-500">
          {{ caseStudy.case_type }}
        </span>
      </div>
    </div>

    <div class="border-t border-gray-100 p-4 flex justify-between items-center gap-2">
      <span v-if="caseStudy.difficulty" class="text-xs font-semibold" :class="getDifficultyText(caseStudy.difficulty)">
        Dificultad: {{ CASE_DIFFICULTY_LABELS[caseStudy.difficulty] }}
      </span>
      <span v-else />
      <NuxtLink :to="detailLink"
        class="text-xs font-bold flex items-center gap-1 hover:underline shrink-0"
        :class="getCategoryText(caseStudy.category)">
        Ver caso
        <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
      </NuxtLink>
    </div>
  </article>
</template>
