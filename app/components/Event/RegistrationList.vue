<template>
  <div class="mt-4 border-t border-default pt-4">
    <UButton variant="ghost" size="xs" :icon="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
      @click="toggle">
      Inscritos<span v-if="rows.length"> ({{ activeCount }})</span>
    </UButton>

    <div v-if="isOpen" class="mt-3">
      <LoadingSpinner v-if="status === 'pending' && rows.length === 0" />

      <LoadError v-else-if="loadError" title="No pudimos cargar los inscritos" :retry="refresh" />

      <UEmpty v-else-if="rows.length === 0" icon="i-lucide-user-x"
        title="Todavía no hay nadie inscrito" />

      <div v-else class="overflow-x-auto rounded-lg border border-default">
        <table class="w-full text-sm">
          <thead class="bg-muted text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-3 py-2 font-medium">Persona</th>
              <th class="px-3 py-2 font-medium">Detalle</th>
              <th class="px-3 py-2 font-medium">Estado</th>
              <th class="px-3 py-2 font-medium">Asistió</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr v-for="row in rows" :key="row.id">
              <td class="px-3 py-2">
                <span class="font-medium">{{ row.name }}</span>
                <UBadge v-if="row.is_guest" size="sm" color="neutral" class="ml-2">
                  Invitado
                </UBadge>
              </td>
              <td class="px-3 py-2 text-muted">{{ detailLabel(row) }}</td>
              <td class="px-3 py-2">
                <UBadge :color="row.status === 'cancelled' ? 'neutral' : 'primary'" size="sm">
                  {{ row.status === 'cancelled' ? 'Cancelada' : 'Inscrito' }}
                </UBadge>
              </td>
              <td class="px-3 py-2">
                <UCheckbox :model-value="row.attended" :disabled="busyId === row.id || row.status === 'cancelled'"
                  @update:model-value="(value) => setAttendance(row, value === true)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :description="error" class="mt-3" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TEAM_COORDINATION_LABELS, isValidTeamCoordination } from '~/constants/teamRoles'

interface RegistrationRow {
  id: number
  status: 'registered' | 'cancelled' | 'waitlisted'
  attended: boolean
  registered_at: string
  is_guest: boolean
  name: string
  detail: string | null
}

const props = defineProps<{ eventId: number }>()

const isOpen = ref(false)
const busyId = ref<number | null>(null)
const error = ref('')

// Se pide solo al desplegar: la lista de un evento no le interesa a quien está
// mirando la página de eventos de pasada.
const { data, status, error: loadError, refresh } = await useAsyncData(
  () => `event-registrations-${props.eventId}`,
  () => $fetch<RegistrationRow[]>(`/api/events/${props.eventId}/registrations`),
  { immediate: false, default: () => [] }
)

const rows = computed(() => data.value ?? [])
const activeCount = computed(() => rows.value.filter(row => row.status !== 'cancelled').length)

const toggle = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && rows.value.length === 0) await refresh()
}

// El detalle es la coordinación para un miembro y el correo para un invitado.
const detailLabel = (row: RegistrationRow) => {
  if (!row.detail) return '—'
  return isValidTeamCoordination(row.detail) ? TEAM_COORDINATION_LABELS[row.detail] : row.detail
}

const setAttendance = async (row: RegistrationRow, attended: boolean) => {
  error.value = ''
  busyId.value = row.id

  try {
    await $fetch(`/api/events/${props.eventId}/registrations/${row.id}`, {
      method: 'PUT',
      body: { attended }
    })
    await refresh()
  } catch (e) {
    error.value = apiErrorMessage(e, 'No pudimos guardar la asistencia.')
    await refresh()
  } finally {
    busyId.value = null
  }
}
</script>
