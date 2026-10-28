<script setup lang="ts">
import type { CaseProgressChanges } from '~/composables/useMyCaseProgress'
import {
  CASE_PROGRESS_COLORS,
  CASE_PROGRESS_DESCRIPTIONS,
  CASE_PROGRESS_ICONS,
  CASE_PROGRESS_LABELS,
  CASE_PROGRESS_STATUSES,
  type CaseProgressStatus
} from '~/constants/caseStudies'

const props = defineProps<{
  caseStudyId: number
}>()

// Coincide con el check de la columna `notes` en case_study_progress.
const NOTES_MAX_LENGTH = 5000

const route = useRoute()
const toast = useToast()
const { isAuthenticated } = useAuth()
const { needsOnboarding } = useProfile()
const { canTrack, progressFor, save, recordView } = useMyCaseProgress()
const { formatDate } = useDateFormatting()
const { calculateTimeAgo } = useTimeAgo()

const progress = computed(() => progressFor(props.caseStudyId))
const currentStatus = computed(() => progress.value?.status ?? null)
const currentRating = computed(() => progress.value?.self_rating ?? null)

const notes = ref('')
watch(() => progress.value?.notes, (value) => { notes.value = value ?? '' }, { immediate: true })
const notesChanged = computed(() => notes.value.trim() !== (progress.value?.notes ?? ''))

const isSaving = ref(false)

const persist = async (changes: CaseProgressChanges, successTitle: string) => {
  isSaving.value = true
  try {
    await save(props.caseStudyId, changes)
    toast.add({ title: successTitle, icon: 'i-lucide-check', color: 'success' })
  } catch (e) {
    toast.add({
      title: apiErrorMessage(e, 'No pudimos guardar tu progreso.'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

// Pulsar el estado que ya esta marcado lo quita.
const setStatus = (status: CaseProgressStatus) => {
  const next = currentStatus.value === status ? null : status
  persist({ status: next }, next ? `Marcado como ${CASE_PROGRESS_LABELS[next].toLowerCase()}` : 'Estado quitado')
}

const setRating = (rating: number) => {
  const next = currentRating.value === rating ? null : rating
  persist({ self_rating: next }, next ? 'Autoevaluación guardada' : 'Autoevaluación quitada')
}

const saveNotes = () => persist({ notes: notes.value }, 'Notas guardadas')

const loginLink = computed(() => ({ path: '/login', query: { redirect: route.fullPath } }))
const signupLink = computed(() => ({ path: '/registro', query: { redirect: route.fullPath } }))

const visitsLabel = computed(() => {
  const count = progress.value?.view_count ?? 0
  if (count === 0) return null
  return count === 1 ? 'Abriste este caso 1 vez' : `Abriste este caso ${count} veces`
})

// La visita se anota en el navegador: en el servidor se contaria tambien cada
// vez que un buscador o una vista previa pidiera la pagina.
onMounted(() => recordView(props.caseStudyId))
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-5' }">
    <h3 class="flex items-center gap-2 border-b border-muted pb-3 text-subheading text-highlighted">
      <UIcon name="i-lucide-chart-no-axes-column" class="size-5 text-primary" />
      Mi progreso
    </h3>

    <!-- Sin sesion: invitar a crear cuenta, sin esconder el caso. -->
    <template v-if="!isAuthenticated">
      <p class="text-sm text-muted">
        Crea una cuenta gratis para marcar los casos que resolviste, autoevaluarte y guardar tus notas.
      </p>
      <div class="flex flex-col gap-2">
        <UButton :to="signupLink" block icon="i-lucide-user-plus">Crear cuenta</UButton>
        <UButton :to="loginLink" block variant="ghost" color="neutral">Ya tengo cuenta</UButton>
      </div>
    </template>

    <p v-else-if="needsOnboarding" class="text-sm text-muted">
      Completa <NuxtLink to="/perfil" class="text-primary underline">tu perfil</NuxtLink> para empezar a guardar
      tu progreso.
    </p>

    <p v-else-if="!canTrack" class="text-sm text-muted">
      Tu cuenta está desactivada, así que no podemos guardar tu progreso.
    </p>

    <template v-else>
      <!-- Estado -->
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-2 text-sm font-medium text-highlighted">Estado</legend>
        <div class="grid grid-cols-2 gap-2">
          <UButton v-for="status in CASE_PROGRESS_STATUSES" :key="status" :icon="CASE_PROGRESS_ICONS[status]"
            :color="currentStatus === status ? CASE_PROGRESS_COLORS[status] : 'neutral'"
            :variant="currentStatus === status ? 'soft' : 'outline'" :aria-pressed="currentStatus === status"
            :disabled="isSaving" size="sm" block @click="setStatus(status)">
            {{ CASE_PROGRESS_LABELS[status] }}
          </UButton>
        </div>
        <p class="text-xs text-muted">
          {{ currentStatus ? CASE_PROGRESS_DESCRIPTIONS[currentStatus] : 'Sin empezar.' }}
          <span v-if="currentStatus">Vuelve a pulsarlo para quitarlo.</span>
        </p>
      </fieldset>

      <!-- Autoevaluacion -->
      <fieldset class="flex flex-col gap-2">
        <legend class="mb-2 text-sm font-medium text-highlighted">¿Cómo te fue?</legend>
        <div class="flex items-center gap-1">
          <UButton v-for="value in 5" :key="value" variant="ghost" size="sm" :disabled="isSaving"
            :color="currentRating && value <= currentRating ? 'warning' : 'neutral'"
            icon="i-lucide-star"
            :class="currentRating && value <= currentRating ? '[&_svg]:fill-current' : ''"
            :aria-label="`${value} de 5`" :aria-pressed="currentRating === value" @click="setRating(value)" />
          <span v-if="currentRating" class="ml-2 text-xs text-muted">{{ currentRating }} de 5</span>
        </div>
      </fieldset>

      <!-- Notas -->
      <UFormField label="Mis notas" description="Solo tú las ves.">
        <UTextarea v-model="notes" :rows="4" autoresize :maxlength="NOTES_MAX_LENGTH" class="w-full"
          placeholder="Estructura que usaste, en qué te trabaste, qué repasar..." />
      </UFormField>
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-muted tabular-nums">{{ notes.length }} / {{ NOTES_MAX_LENGTH }}</span>
        <UButton size="sm" :disabled="!notesChanged" :loading="isSaving" @click="saveNotes">
          Guardar notas
        </UButton>
      </div>

      <!-- Historial de este caso -->
      <ul v-if="visitsLabel || progress?.completed_at" class="flex flex-col gap-1 border-t border-muted pt-3 text-xs text-muted">
        <li v-if="visitsLabel">
          {{ visitsLabel }}<span v-if="progress?.last_viewed_at"> · última vez: {{ calculateTimeAgo(progress.last_viewed_at).toLowerCase() }}</span>
        </li>
        <li v-if="progress?.completed_at">Lo completaste el {{ formatDate(progress.completed_at) }}</li>
      </ul>

      <UButton to="/mi-progreso" variant="link" size="sm" trailing-icon="i-lucide-arrow-right" class="self-start px-0">
        Ver todo mi progreso
      </UButton>
    </template>
  </UCard>
</template>
