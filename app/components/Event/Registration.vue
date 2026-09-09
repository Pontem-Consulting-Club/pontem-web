<template>
  <div v-if="mode !== 'none'" class="mt-4 border-t border-gray-200 pt-4">
    <!-- Ya inscrito -->
    <div v-if="isRegistered" class="flex flex-wrap items-center gap-3">
      <UBadge color="success" variant="subtle" icon="i-lucide-check">Estás inscrito</UBadge>
      <UButton size="xs" variant="ghost" color="error" :loading="isBusy" @click="cancel">
        Cancelar inscripción
      </UButton>
    </div>

    <!-- Cerrado o pasado -->
    <div v-else-if="!isOpen" class="flex items-center gap-2 text-sm text-gray-500">
      <UIcon name="i-lucide-lock" />
      <span>{{ closedReason }}</span>
    </div>

    <!-- Miembro con sesión -->
    <div v-else-if="isAuthenticated" class="flex flex-wrap items-center gap-3">
      <UButton icon="i-lucide-calendar-check" :loading="isBusy" @click="register">
        Inscribirme
      </UButton>
      <span v-if="spotsLabel" class="text-sm text-gray-500">{{ spotsLabel }}</span>
    </div>

    <!-- Invitado, solo en eventos abiertos (VIS-3) -->
    <div v-else-if="mode === 'open'" class="flex flex-col gap-3">
      <p class="text-sm text-gray-600">
        Esta actividad está abierta a invitados. Déjanos tus datos y te esperamos.
      </p>
      <form class="flex flex-col gap-3 sm:flex-row sm:items-start" @submit.prevent="register">
        <UInput v-model="guest.name" placeholder="Tu nombre" autocomplete="name" class="sm:flex-1" />
        <UInput v-model="guest.email" type="email" placeholder="Tu correo" autocomplete="email" class="sm:flex-1" />
        <UButton type="submit" :loading="isBusy">Inscribirme</UButton>
      </form>
    </div>

    <!-- Solo miembros y sin sesión -->
    <div v-else class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
      <UIcon name="i-lucide-users" />
      <span>Esta actividad es solo para miembros.</span>
      <UButton :to="{ path: '/login', query: { redirect: route.fullPath } }" size="xs" variant="soft">
        Iniciar sesión
      </UButton>
    </div>

    <UAlert v-if="message" :color="messageColor" :description="message" class="mt-3"
      :icon="messageColor === 'error' ? 'i-lucide-alert-circle' : 'i-lucide-check'" />
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types'

type RegistrationMode = Database['public']['Enums']['registration_mode']

const props = defineProps<{
  eventId: number
  mode: RegistrationMode
  registrationOpen: boolean
  capacity: number | null
  date: string | null
}>()

const route = useRoute()
const { isAuthenticated } = useAuth()

const { isRegisteredFor, refresh: refreshRegistrations } = useMyRegistrations()

const isBusy = ref(false)
// Se arranca desde el estado real del servidor y no desde false: si no, al
// recargar la pagina alguien ya inscrito veria otra vez el boton de inscribirse.
const justRegistered = ref<boolean | null>(null)
const isRegistered = computed(() =>
  justRegistered.value ?? (isAuthenticated.value && isRegisteredFor(props.eventId)))
const message = ref('')
const messageColor = ref<'success' | 'error'>('success')
const guest = reactive({ name: '', email: '' })

const hasPassed = computed(() => !!props.date && new Date(props.date) <= new Date())
const isOpen = computed(() => props.registrationOpen && !hasPassed.value)

const closedReason = computed(() =>
  hasPassed.value ? 'Este evento ya ocurrió.' : 'La inscripción está cerrada.')

// El cupo restante exacto no se expone: haría falta leer las inscripciones de
// otras personas, que es justo lo que RLS impide a un miembro.
const spotsLabel = computed(() => props.capacity ? `Cupo para ${props.capacity} personas` : '')

const register = async () => {
  message.value = ''
  isBusy.value = true

  try {
    const body = isAuthenticated.value
      ? undefined
      : { guest_name: guest.name, guest_email: guest.email }

    await $fetch(`/api/events/${props.eventId}/registrations`, { method: 'POST', body })

    if (isAuthenticated.value) {
      justRegistered.value = true
      await refreshRegistrations()
    }
    messageColor.value = 'success'
    message.value = isAuthenticated.value
      ? 'Listo, te esperamos.'
      : `Listo, ${guest.email} queda en la lista. Te esperamos.`
    guest.name = ''
    guest.email = ''
  } catch (e) {
    messageColor.value = 'error'
    message.value = resolveErrorMessage(e, 'No pudimos completar la inscripción.')
  } finally {
    isBusy.value = false
  }
}

const cancel = async () => {
  message.value = ''
  isBusy.value = true

  try {
    await $fetch(`/api/events/${props.eventId}/registrations`, { method: 'DELETE' })
    justRegistered.value = false
    await refreshRegistrations()
    messageColor.value = 'success'
    message.value = 'Cancelamos tu inscripción.'
  } catch (e) {
    messageColor.value = 'error'
    message.value = resolveErrorMessage(e, 'No pudimos cancelar la inscripción.')
  } finally {
    isBusy.value = false
  }
}

const resolveErrorMessage = (e: unknown, fallback: string) => {
  const candidate = e as { statusMessage?: string; data?: { statusMessage?: string; message?: string } }
  return candidate?.data?.statusMessage || candidate?.statusMessage || candidate?.data?.message || fallback
}
</script>
