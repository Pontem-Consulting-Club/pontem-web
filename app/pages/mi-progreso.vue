<script setup lang="ts">
import type { CaseStudyRecord } from '~/types/content'
import type { CaseActivity, CaseProgress } from '~/composables/useMyCaseProgress'
import {
  CASE_CATEGORIES,
  CASE_CATEGORY_LABELS,
  CASE_PROGRESS_COLORS,
  CASE_PROGRESS_ICONS,
  CASE_PROGRESS_LABELS,
  CASE_PROGRESS_STATUSES,
  getCaseCategoryLabel,
  isCaseProgressDone,
  type CaseProgressStatus
} from '~/constants/caseStudies'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'Mi progreso - Pontem',
  // Como /perfil: datos personales, nunca indexados.
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const { needsOnboarding, ready: profileReady } = useProfile()
const { canTrack, progress, activity, error: progressError, refresh: refreshProgress, status: progressStatus } = useMyCaseProgress()
const { formatDate } = useDateFormatting()
const { calculateTimeAgo } = useTimeAgo()
const { getCategoryAccent } = useCaseStudyColors()

const { data: caseStudies, error: casesError, refresh: refreshCases } = await useFetch<CaseStudyRecord[]>('/api/case-studies', {
  default: () => []
})
await profileReady

const casesById = computed(() => new Map(caseStudies.value.map(item => [item.id, item])))

// Los casebooks son colecciones, no un caso: no cuentan para el porcentaje.
const solvableCases = computed(() => caseStudies.value.filter(item => item.category))

const doneIds = computed(() => new Set(
  progress.value.filter(row => isCaseProgressDone(row.status)).map(row => row.case_study_id)
))

const countByStatus = (status: CaseProgressStatus) => progress.value.filter(row => row.status === status).length

const overall = computed(() => {
  const total = solvableCases.value.length
  const done = solvableCases.value.filter(item => doneIds.value.has(item.id)).length
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 }
})

const tiles = computed(() => [
  { label: 'Resueltos', value: countByStatus('completado') + countByStatus('revisado'), icon: 'i-lucide-circle-check' },
  { label: 'En progreso', value: countByStatus('en-progreso'), icon: 'i-lucide-loader-circle' },
  { label: 'Pendientes', value: countByStatus('pendiente'), icon: 'i-lucide-bookmark' },
  { label: 'Casos abiertos', value: progress.value.filter(row => row.view_count > 0).length, icon: 'i-lucide-eye' }
])

// Solo las categorias que tienen casos publicados.
const byCategory = computed(() => CASE_CATEGORIES
  .map((category) => {
    const inCategory = solvableCases.value.filter(item => item.category === category)
    const done = inCategory.filter(item => doneIds.value.has(item.id)).length
    return { category, label: CASE_CATEGORY_LABELS[category], total: inCategory.length, done }
  })
  .filter(row => row.total > 0))

// ------------------------------------------------------------- listado
type Filter = 'todos' | CaseProgressStatus
const filter = ref<Filter>('todos')

const filterOptions = computed(() => [
  { value: 'todos' as Filter, label: 'Todos' },
  ...CASE_PROGRESS_STATUSES.map(status => ({ value: status as Filter, label: CASE_PROGRESS_LABELS[status] }))
])

interface Row {
  progress: CaseProgress
  caseStudy: CaseStudyRecord
}

// Un caso que se borro se va con su progreso (on delete cascade), pero puede
// quedar un instante fuera del listado si se borro despues de cargar la pagina.
const rows = computed<Row[]>(() => progress.value
  .filter(row => filter.value === 'todos' || row.status === filter.value)
  .flatMap((row) => {
    const caseStudy = casesById.value.get(row.case_study_id)
    return caseStudy ? [{ progress: row, caseStudy }] : []
  })
  .sort((a, b) => (b.progress.updated_at ?? '').localeCompare(a.progress.updated_at ?? '')))

// ------------------------------------------------------------- historial
// Cada entrada se lee como "<antes> <caso> <despues>".
const describe = (entry: CaseActivity) => {
  switch (entry.kind) {
    case 'visita':
      return { icon: 'i-lucide-eye', before: 'Abriste', after: '' }
    case 'autoevaluacion':
      return entry.self_rating
        ? { icon: 'i-lucide-star', before: `Te autoevaluaste con ${entry.self_rating} de 5 en`, after: '' }
        : { icon: 'i-lucide-star-off', before: 'Quitaste tu autoevaluación de', after: '' }
    case 'estado':
      return entry.status
        ? { icon: CASE_PROGRESS_ICONS[entry.status], before: 'Marcaste', after: `como ${CASE_PROGRESS_LABELS[entry.status].toLowerCase()}` }
        : { icon: 'i-lucide-circle-dashed', before: 'Quitaste el estado de', after: '' }
  }
}

const history = computed(() => activity.value.flatMap((entry) => {
  const caseStudy = casesById.value.get(entry.case_study_id)
  return caseStudy ? [{ entry, caseStudy, ...describe(entry) }] : []
}))

const retry = () => Promise.all([refreshCases(), refreshProgress()])
</script>

<template>
  <div>
    <!-- Página de trabajo, como /perfil: encabezado simple, sin foto. -->
    <UContainer>
      <UPageHeader title="Mi progreso" description="Tu avance en los casos de estudio. Solo tú lo ves." />
    </UContainer>

    <UContainer class="py-16 flex flex-col gap-16">
      <UAlert v-if="needsOnboarding" icon="i-lucide-hand" color="primary" variant="soft"
        title="Completa tu perfil"
        description="Cuando guardes tus datos en Mi perfil podrás empezar a registrar tu progreso."
        :actions="[{ label: 'Ir a mi perfil', to: '/perfil' }]" />

      <UAlert v-else-if="!canTrack" icon="i-lucide-lock" color="neutral" variant="soft"
        title="Tu cuenta está desactivada"
        description="Pide a la coordinación que la reactive para seguir registrando tu progreso." />

      <LoadError v-else-if="casesError || progressError" title="No pudimos cargar tu progreso" :retry="retry" />

      <div v-else-if="progressStatus === 'pending' && progress.length === 0" class="flex justify-center">
        <LoadingSpinner />
      </div>

      <UEmpty v-else-if="progress.length === 0" icon="i-lucide-chart-no-axes-column"
        title="Todavía no tienes progreso"
        description="Abre un caso de estudio y márcalo como pendiente, en progreso o completado. Tu avance aparece aquí."
        :actions="[{ label: 'Explorar casos', icon: 'i-lucide-library', to: '/material-estudio' }]" />

      <template v-else>
        <!-- Resumen -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <div class="flex items-baseline justify-between gap-4">
              <h2 class="text-title text-highlighted">Resumen</h2>
              <span class="text-sm text-muted tabular-nums">
                {{ overall.done }} de {{ overall.total }} casos resueltos ({{ overall.percent }}%)
              </span>
            </div>
            <UProgress :model-value="overall.done" :max="Math.max(overall.total, 1)" color="success"
              :aria-label="`${overall.done} de ${overall.total} casos resueltos`" />
          </div>

          <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div v-for="tile in tiles" :key="tile.label" class="rounded-lg border border-default bg-default px-5 py-4">
              <UIcon :name="tile.icon" class="mb-2 size-5 text-muted" />
              <div class="text-3xl font-semibold tabular-nums">{{ tile.value }}</div>
              <div class="text-sm text-muted">{{ tile.label }}</div>
            </div>
          </div>
        </section>

        <!-- Por categoria -->
        <section class="flex flex-col gap-6">
          <h2 class="text-title text-highlighted">Por categoría</h2>
          <ul class="grid gap-x-10 gap-y-4 md:grid-cols-2">
            <li v-for="row in byCategory" :key="row.category" class="flex flex-col gap-1.5">
              <div class="flex items-baseline justify-between gap-4 text-sm">
                <span class="font-medium text-highlighted">{{ row.label }}</span>
                <span class="text-muted tabular-nums">{{ row.done }} / {{ row.total }}</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-elevated" role="progressbar" :aria-label="row.label"
                :aria-valuenow="row.done" aria-valuemin="0" :aria-valuemax="row.total">
                <div class="h-full rounded-full transition-all" :class="getCategoryAccent(row.category)"
                  :style="{ width: `${(row.done / row.total) * 100}%` }" />
              </div>
            </li>
          </ul>
        </section>

        <div class="grid gap-16 lg:grid-cols-[minmax(0,1fr)_360px]">
          <!-- Mis casos -->
          <section class="flex flex-col gap-6">
            <h2 class="text-title text-highlighted">Mis casos</h2>

            <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
              <UButton v-for="option in filterOptions" :key="option.value" size="sm"
                :variant="filter === option.value ? 'solid' : 'outline'"
                :color="filter === option.value ? 'primary' : 'neutral'" :aria-pressed="filter === option.value"
                @click="filter = option.value">
                {{ option.label }}
              </UButton>
            </div>

            <UEmpty v-if="rows.length === 0" icon="i-lucide-filter-x" title="No tienes casos con ese estado" />

            <ul v-else class="divide-y divide-default rounded-lg border border-default bg-default">
              <li v-for="{ progress: row, caseStudy } in rows" :key="row.case_study_id"
                class="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <div class="min-w-0 flex-1">
                  <NuxtLink :to="`/material-estudio/casos/${caseStudy.id}`"
                    class="font-medium text-highlighted hover:text-primary hover:underline">
                    {{ caseStudy.title }}
                  </NuxtLink>
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{{ getCaseCategoryLabel(caseStudy.category) }}</span>
                    <span v-if="row.last_viewed_at">Visto: {{ calculateTimeAgo(row.last_viewed_at).toLowerCase() }}</span>
                    <span v-if="row.completed_at">Completado el {{ formatDate(row.completed_at) }}</span>
                    <span v-if="row.notes" class="flex items-center gap-1">
                      <UIcon name="i-lucide-notebook-pen" class="size-3.5" /> Con notas
                    </span>
                  </div>
                </div>
                <span v-if="row.self_rating" class="flex items-center gap-1 text-xs text-muted"
                  :aria-label="`Autoevaluación: ${row.self_rating} de 5`">
                  <UIcon name="i-lucide-star" class="size-3.5 text-warning" /> {{ row.self_rating }}/5
                </span>
                <UBadge v-if="row.status" :color="CASE_PROGRESS_COLORS[row.status]" variant="soft" size="sm"
                  :icon="CASE_PROGRESS_ICONS[row.status]">
                  {{ CASE_PROGRESS_LABELS[row.status] }}
                </UBadge>
                <UBadge v-else color="neutral" variant="outline" size="sm">Sin estado</UBadge>
              </li>
            </ul>
          </section>

          <!-- Historial -->
          <section class="flex flex-col gap-6">
            <h2 class="text-title text-highlighted">Historial</h2>
            <p v-if="history.length === 0" class="text-sm text-muted">Todavía no hay actividad.</p>
            <ol v-else class="flex flex-col gap-4">
              <li v-for="item in history" :key="item.entry.id" class="flex gap-3 text-sm">
                <UIcon :name="item.icon" class="mt-0.5 size-4 shrink-0 text-muted" />
                <div class="min-w-0">
                  <p class="text-toned">
                    {{ item.before }}
                    <NuxtLink :to="`/material-estudio/casos/${item.caseStudy.id}`" class="font-medium text-highlighted hover:underline">
                      {{ item.caseStudy.title }}
                    </NuxtLink>
                    {{ item.after }}
                  </p>
                  <p class="text-xs text-muted">{{ formatDate(item.entry.created_at) }}</p>
                </div>
              </li>
            </ol>
          </section>
        </div>
      </template>
    </UContainer>
  </div>
</template>
