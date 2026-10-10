<script setup lang="ts">
import type { CaseStudyRecord } from '~/types/content'
import { CASE_DIFFICULTY_LABELS, getCaseCategoryIcon, getCaseCategoryLabel } from '~/constants/caseStudies'

const props = defineProps<{
  caseStudy: CaseStudyRecord
}>()

const { isEditor } = useProfile()
const { getCategoryAccent, getCategoryBadge, getCategoryText, getDifficultyText } = useCaseStudyColors()

const { url: logoUrl } = useStorageImage(computed(() => props.caseStudy.company_logo_url ?? null))

const detailLink = computed(() => `/material-estudio/casos/${props.caseStudy.id}`)

const duration = computed(() => {
  const minutes = props.caseStudy.duration_minutes
  return minutes ? `${minutes} min` : null
})
</script>

<template>
  <UCard as="article" variant="item" class="relative flex flex-col" :ui="{ body: 'flex flex-1 flex-col gap-4' }">
    <template #header>
      <!-- Barra de acento segun categoria -->
      <div class="h-1.5 w-full" :class="getCategoryAccent(caseStudy.category)" />

      <UButton v-if="isEditor" icon="i-lucide-pencil" size="xs" color="primary" variant="ghost"
        class="absolute top-4 right-3 z-10" aria-label="Editar caso" :to="`${detailLink}?edit=1`" />
    </template>


      <div class="flex justify-between items-start gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div v-if="logoUrl" class="size-10 rounded-full bg-muted border border-muted overflow-hidden shrink-0 flex items-center justify-center">
            <img :src="logoUrl" :alt="caseStudy.company ?? 'Empresa'" class="size-full object-contain p-1">
          </div>
          <div v-else class="size-10 rounded-full shrink-0 flex items-center justify-center"
            :class="getCategoryBadge(caseStudy.category)">
            <UIcon :name="caseStudy.icon || getCaseCategoryIcon(caseStudy.category)" class="size-5" />
          </div>
          <span v-if="caseStudy.company" class="text-xs font-semibold uppercase tracking-wider text-dimmed truncate">
            {{ caseStudy.company }}
          </span>
        </div>
        <span v-if="duration" class="text-xs text-dimmed bg-muted px-2 py-1 rounded-sm shrink-0">
          {{ duration }}
        </span>
      </div>

      <h3 class="text-lg/snug font-bold text-highlighted">
        {{ caseStudy.title }}
      </h3>

      <div class="flex flex-wrap gap-2 mt-auto pt-2">
        <span class="text-xs font-semibold px-2 py-1 rounded-sm" :class="getCategoryBadge(caseStudy.category)">
          {{ getCaseCategoryLabel(caseStudy.category) }}
        </span>
        <span v-if="caseStudy.case_type && caseStudy.category" class="text-xs font-semibold px-2 py-1 rounded-sm bg-muted text-muted">
          {{ caseStudy.case_type }}
        </span>
      </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2">
      <span v-if="caseStudy.difficulty" class="text-xs font-semibold" :class="getDifficultyText(caseStudy.difficulty)">
        Dificultad: {{ CASE_DIFFICULTY_LABELS[caseStudy.difficulty] }}
      </span>
      <span v-else />
      <NuxtLink :to="detailLink"
        class="text-xs font-bold flex items-center gap-1 hover:underline shrink-0"
        :class="getCategoryText(caseStudy.category)">
        Ver caso
        <UIcon name="i-lucide-arrow-right" class="size-3.5" />
      </NuxtLink>
      </div>
    </template>
  </UCard>
</template>
