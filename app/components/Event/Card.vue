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

const { formatDate } = useDateFormatting()
const { can, isEditor } = useProfile()

// EDI-2: la lista de inscritos es para quien organiza, no para cualquiera.
const canReadRegistrations = computed(() => can('registrations.read'))

const isEditing = ref(_props.isNew)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')
const form = ref<Partial<EventRecord>>({})

const { url: imageUrl } = useStorageImage(computed(() => event.value.image_url ?? null))

const toast = useToast()
const { confirmDelete, confirmDiscard } = useConfirm()
const editButton = useTemplateRef('editButton')
const { othersOpen: otherEditorOpen } = useEditorSlot(
  () => (_props.isNew ? 'evento:nuevo' : `evento:${event.value.id}`),
  { isEditing, focusOnClose: () => editButton.value?.focus() }
)

// El día de Chile, igual en el servidor (UTC) y en el navegador.
const dayNumber = computed(() => Number(clubDay(event.value.date).slice(8, 10)))
const monthYear = computed(() => formatClubDate(event.value.date, { month: 'short', year: 'numeric' }))

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
  link: normalizeValue(form.value.link as string | null),
  registration_mode: form.value.registration_mode ?? 'none',
  capacity: form.value.capacity ?? null,
  registration_open: form.value.registration_open ?? true
})

const buildFormData = (payload: ReturnType<typeof buildPayload>, file?: File | null) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    // El booleano y el cupo viajan como texto: el servidor los reinterpreta.
    formData.append(key, value === null || value === undefined ? '' : String(value))
  })

  if (file) {
    formData.append('image', file)
  }

  return formData
}

const startEdit = () => {
  if (_props.isNew) return
  if (!isEditor.value) return
  if (_props.variant === 'compact') return
  form.value = { ...event.value }
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = async (hasPendingFile = false) => {
  if ((hasPendingFile || formChanged(form.value, event.value)) && !(await confirmDiscard())) return
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
    toast.add({ title: _props.isNew ? 'Evento creado' : 'Evento guardado', icon: 'i-lucide-check', color: 'success' })
    isEditing.value = false
    emit('updated')
  } catch (error: unknown) {
    formError.value = apiErrorMessage(error, 'No pudimos guardar los cambios. Inténtalo de nuevo.')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async () => {
  if (_props.isNew) return
  if (!(await confirmDelete('este evento'))) return

  isDeleting.value = true
  formError.value = ''

  try {
    await $fetch(`/api/admin/events/${event.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Evento eliminado', icon: 'i-lucide-check', color: 'success' })
    isEditing.value = false
    emit('updated')
  } catch (error: unknown) {
    formError.value = apiErrorMessage(error, 'No pudimos eliminar el evento. Inténtalo de nuevo.')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <EventEditForm v-if="isEditing && variant !== 'compact'" v-model:form="form" :is-new="_props.isNew"
    :is-saving="isSaving" :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="cancelEdit"
    @delete="handleDelete" />

  <UCard v-else-if="variant === 'full'" variant="item" class="relative">
    <ContentEditButton v-if="isEditor" ref="editButton" label="Editar evento" :disabled="otherEditorOpen"
      @click="startEdit" />

    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-32 shrink-0">
        <div class="bg-primary-50 rounded-lg p-4 text-center">
          <span class="block text-3xl font-bold text-primary-700">
            {{ dayNumber }}
          </span>
          <span class="block text-sm text-primary-700">
            {{ monthYear }}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <h3 class="mb-2 text-subheading text-highlighted">
          {{ event.title }}
        </h3>
        <div v-if="event.subtitle" class="mb-3 text-toned">
          {{ event.subtitle }}
        </div>
        <div v-if="event.description" class="mb-4 text-toned">
          {{ event.description }}
        </div>
        <div class="flex flex-wrap gap-4 text-sm">
          <span v-if="event.location" class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="size-4" />
            {{ event.location }}
          </span>
          <a v-if="event.link" :href="event.link" target="_blank" rel="noopener"
            :aria-label="`Ver más sobre ${event.title} (se abre en otra pestaña)`"
            class="flex items-center gap-2 text-primary-700 hover:underline">
            <UIcon name="i-lucide-external-link" class="size-4" />
            Ver más
          </a>
        </div>

        <EventRegistration v-if="!_props.isNew" :event-id="event.id"
          :mode="event.registration_mode ?? 'none'" :registration-open="event.registration_open ?? true"
          :capacity="event.capacity ?? null" :date="event.date" />

        <EventRegistrationList v-if="!_props.isNew && canReadRegistrations
          && (event.registration_mode ?? 'none') !== 'none'" :event-id="event.id" />
      </div>
      <!-- En celular la foto va primero; sin foto, solo en escritorio se muestra el logo
           (completo, sin recortar) para que la fila no quede coja. -->
      <div class="relative order-first shrink-0 md:order-last md:w-48" :class="{ 'hidden md:block': !imageUrl }">
        <NuxtImg v-if="imageUrl" :src="imageUrl" alt="" class="h-40 w-full rounded-lg object-cover md:h-32"
          sizes="xs:100vw sm:100vw md:200px" />
        <NuxtImg v-else src="/LogoColorSolo.png" alt="" class="h-32 w-full rounded-lg bg-muted object-contain p-6"
          sizes="200px" />
      </div>
    </div>
  </UCard>

  <UCard v-else-if="variant === 'past'" class="relative opacity-75">
    <ContentEditButton v-if="isEditor" ref="editButton" label="Editar evento" :disabled="otherEditorOpen"
      @click="startEdit" />
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <span class="text-sm md:w-32">
        {{ formatDate(event.date) }}
      </span>
      <div class="flex-1">
        <h3 class="text-subheading">
          {{ event.title }}
        </h3>
        <p v-if="event.subtitle" class="text-sm">
          {{ event.subtitle }}
        </p>
      </div>
    </div>
  </UCard>

  <UCard v-else variant="item">
    <template #header>
      <div class="bg-linear-to-r from-primary/10 to-secondary/10 px-4 py-3">
        <span class="text-sm font-medium text-primary">
          {{ formatDate(event.date) }}
        </span>
      </div>
    </template>

      <h3 class="mb-2 text-subheading text-highlighted">
        {{ event.title }}
      </h3>
      <p v-if="event.subtitle" class="mb-4">
        {{ event.subtitle }}
      </p>
      <p v-if="event.location" class="text-sm flex items-center gap-2">
        <UIcon name="i-lucide-map-pin" class="size-4" />
        {{ event.location }}
      </p>
  </UCard>
</template>
