<script setup lang="ts">
import type { EventRecord } from '~/types/content'

interface Props {
  event: EventRecord
  variant?: 'full' | 'compact' | 'past'
  isNew?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  variant: 'full',
  isNew: false
})

const event = toRef(_props, 'event')
const emit = defineEmits<{
  (e: 'updated' | 'created' | 'cancel-create'): void
}>()

const { isAuthenticated } = useAuth()
const { formatDate } = useDateFormatting()

const isEditing = ref(_props.isNew)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')
const form = ref<Partial<EventRecord>>({})

const { url: imageUrl } = useStorageImage(computed(() => event.value.image_url ?? null))

const eventDate = computed(() => new Date(event.value.date))
const dayNumber = computed(() => eventDate.value.getDate())
const monthYear = computed(() => eventDate.value.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }))

watch(event, (value) => {
  if (_props.isNew || !isEditing.value) {
    form.value = { ...value }
  }
}, { immediate: true, deep: true })

const normalizeValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return null
  const trimmed = value.toString().trim()
  return trimmed === '' ? null : trimmed
}

const validateForm = () => {
  if (!form.value.title || !form.value.title.toString().trim()) {
    return 'El título es obligatorio.'
  }

  if (!form.value.date || !form.value.date.toString().trim()) {
    return 'La fecha es obligatoria.'
  }

  return ''
}

const buildPayload = () => ({
  title: form.value.title?.toString().trim() || '',
  date: form.value.date?.toString().trim() || '',
  subtitle: normalizeValue(form.value.subtitle as string | null),
  description: normalizeValue(form.value.description as string | null),
  image_url: normalizeValue(form.value.image_url as string | null),
  location: normalizeValue(form.value.location as string | null),
  link: normalizeValue(form.value.link as string | null)
})

const buildFormData = (payload: ReturnType<typeof buildPayload>, file?: File | null) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value ?? '')
  })

  if (file) {
    formData.append('image', file)
  }

  return formData
}

const startEdit = () => {
  if (_props.isNew) return
  if (!isAuthenticated.value) return
  if (_props.variant === 'compact') return
  form.value = { ...event.value }
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  if (_props.isNew) {
    emit('cancel-create')
    return
  }
  form.value = { ...event.value }
  formError.value = ''
  isEditing.value = false
}

const saveEdit = async (file?: File | null) => {
  const validationError = validateForm()
  if (validationError) {
    formError.value = validationError
    return
  }

  isSaving.value = true
  formError.value = ''

  try {
    const payload = buildPayload()
    const formData = buildFormData(payload, file)
    if (_props.isNew) {
      await $fetch('/api/admin/events', { method: 'POST', body: formData })
      emit('created')
      emit('updated')
    } else {
      await $fetch(`/api/admin/events/${event.value.id}`, { method: 'PUT', body: formData })
    }
    isEditing.value = false
    emit('updated')
  } catch (error: unknown) {
    const apiError = typeof error === 'object' && error !== null && 'data' in error
      ? (error as { data?: { statusMessage?: string; message?: string } })
      : null
    formError.value = apiError?.data?.statusMessage
      || apiError?.data?.message
      || (error instanceof Error ? error.message : 'Error al guardar los cambios')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async () => {
  if (_props.isNew) return
  const confirmed = typeof window !== 'undefined'
    ? window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')
    : false

  if (!confirmed) return

  isDeleting.value = true
  formError.value = ''

  try {
    await $fetch(`/api/admin/events/${event.value.id}`, { method: 'DELETE' })
    isEditing.value = false
    emit('updated')
  } catch (error: unknown) {
    const apiError = typeof error === 'object' && error !== null && 'data' in error
      ? (error as { data?: { statusMessage?: string; message?: string } })
      : null
    formError.value = apiError?.data?.statusMessage
      || apiError?.data?.message
      || (error instanceof Error ? error.message : 'Error al eliminar el evento')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <EventEditForm v-if="isEditing && variant !== 'compact'" v-model:form="form" :is-new="_props.isNew"
    :is-saving="isSaving" :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="cancelEdit"
    @delete="handleDelete" />

  <UCard v-else-if="variant === 'full'"
    class="rounded-3xl bg-white/90 shadow-sm hover:shadow-lg transition-shadow relative">
    <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="primary" variant="ghost"
      class="absolute top-3 right-3 z-10" @click="startEdit" />

    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-32 shrink-0">
        <div class="bg-primary-50 rounded-lg p-4 text-center">
          <span class="block text-3xl font-bold text-primary-600">
            {{ dayNumber }}
          </span>
          <span class="block text-sm text-primary-600">
            {{ monthYear }}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <div class="text-xl font-semibold mb-2">
          {{ event.title }}
        </div>
        <div v-if="event.subtitle" class="mb-3 text-gray-600">
          {{ event.subtitle }}
        </div>
        <div v-if="event.description" class="mb-4 text-gray-600">
          {{ event.description }}
        </div>
        <div class="flex flex-wrap gap-4 text-sm">
          <span v-if="event.location" class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
            {{ event.location }}
          </span>
          <a v-if="event.link" :href="event.link" target="_blank"
            class="flex items-center gap-2 text-primary-600 hover:underline">
            <UIcon name="i-lucide-external-link" class="w-4 h-4" />
            Ver más
          </a>
        </div>
      </div>
      <div class="md:w-48 shrink-0 relative">
        <NuxtImg :src="imageUrl ?? '/LogoColorSolo.png'" alt="Imagen del evento"
          class="object-cover rounded-lg h-32 w-full" sizes="300px" />
      </div>
    </div>
  </UCard>

  <UCard v-else-if="variant === 'past'" class="rounded-2xl opacity-75 bg-white/90 shadow-sm relative">
    <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="primary" variant="ghost"
      class="absolute top-3 right-3 z-10" @click="startEdit" />
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <span class="text-sm md:w-32">
        {{ formatDate(event.date) }}
      </span>
      <div class="flex-1">
        <h3 class="text-lg font-medium">
          {{ event.title }}
        </h3>
        <p v-if="event.subtitle" class="text-sm">
          {{ event.subtitle }}
        </p>
      </div>
    </div>
  </UCard>

  <div v-else class="rounded-3xl bg-white/90 hover:shadow-lg transition-shadow overflow-hidden shadow-sm">
    <div class="bg-linear-to-r from-primary/10 to-secondary/10 px-4 py-3">
      <span class="text-sm font-medium text-primary">
        {{ formatDate(event.date) }}
      </span>
    </div>
    <div class="p-6">
      <h3 class="text-xl font-semibold mb-2">
        {{ event.title }}
      </h3>
      <p v-if="event.subtitle" class="mb-4">
        {{ event.subtitle }}
      </p>
      <p v-if="event.location" class="text-sm flex items-center gap-2">
        <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
        {{ event.location }}
      </p>
    </div>
  </div>
</template>
