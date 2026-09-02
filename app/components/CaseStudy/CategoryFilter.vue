<script setup lang="ts">
import type { CaseCategory } from '~/constants/caseStudies'
import { CASE_CATEGORIES, CASE_CATEGORY_LABELS } from '~/constants/caseStudies'

/**
 * Filtro de una sola seleccion (a diferencia de NewsFilterPills, que es multi-select):
 * `null` representa la opcion "Todas".
 */
const modelValue = defineModel<CaseCategory | null>({ default: null })

const { getCategoryBadge, getCategoryBorder } = useCaseStudyColors()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="px-4 py-2 rounded-full text-xs font-semibold border transition-colors" :class="modelValue === null
      ? 'bg-primary text-white border-primary'
      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'" @click="modelValue = null">
      Todas
    </button>

    <button v-for="category in CASE_CATEGORIES" :key="category" type="button"
      class="px-4 py-2 rounded-full text-xs font-semibold border transition-colors" :class="modelValue === category
        ? `${getCategoryBadge(category)} ${getCategoryBorder(category)}`
        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'"
      @click="modelValue = category">
      {{ CASE_CATEGORY_LABELS[category] }}
    </button>
  </div>
</template>
