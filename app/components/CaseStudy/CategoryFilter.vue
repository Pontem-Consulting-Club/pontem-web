<script setup lang="ts">
import type { CaseStudyTab } from '~/constants/caseStudies'
import { CASEBOOK_LABEL, CASE_CATEGORIES, CASE_CATEGORY_LABELS } from '~/constants/caseStudies'

/**
 * Filtro de una sola seleccion (a diferencia de NewsFilterPills, que es multi-select):
 * `null` representa la opcion "Todas".
 *
 * Una categoria con menos de MIN_CASES casos no se muestra hasta que se llene (sus
 * casos siguen en "Todas"); asi la navegacion no se llena de pestanas casi vacias.
 */
const props = defineProps<{
  counts: Partial<Record<CaseStudyTab, number>>
  total: number
}>()

const modelValue = defineModel<CaseStudyTab | null>({ default: null })

const MIN_CASES = 3

const visibleCategories = computed(() =>
  CASE_CATEGORIES.filter(category => (props.counts[category] ?? 0) >= MIN_CASES))

const { getCategoryBadge, getCategoryBorder } = useCaseStudyColors()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="px-4 py-2 rounded-full text-xs font-semibold border transition-colors" :class="modelValue === null
      ? 'bg-primary text-white border-primary'
      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'" @click="modelValue = null">
      Todas · {{ total }}
    </button>

    <button v-for="category in visibleCategories" :key="category" type="button"
      class="px-4 py-2 rounded-full text-xs font-semibold border transition-colors" :class="modelValue === category
        ? `${getCategoryBadge(category)} ${getCategoryBorder(category)}`
        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'"
      @click="modelValue = category">
      {{ CASE_CATEGORY_LABELS[category] }} · {{ counts[category] }}
    </button>

    <button v-if="counts.casebooks" type="button"
      class="px-4 py-2 rounded-full text-xs font-semibold border transition-colors" :class="modelValue === 'casebooks'
        ? `${getCategoryBadge(null)} ${getCategoryBorder(null)}`
        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'"
      @click="modelValue = 'casebooks'">
      {{ CASEBOOK_LABEL }} · {{ counts.casebooks }}
    </button>
  </div>
</template>
