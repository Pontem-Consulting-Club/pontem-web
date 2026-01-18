<script setup lang="ts">
import type { EventRecord } from '~/types/content'

interface Props {
  event: EventRecord
  variant?: 'full' | 'compact' | 'past'
}

const _props = withDefaults(defineProps<Props>(), {
  variant: 'full'
})

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const { isAuthenticated } = useAuth()
const { formatDate } = useDateFormatting()

const isEditing = ref(false)
const isSaving = ref(false)
const formError = ref('')
const form = ref<Partial<EventRecord>>({})

const { url: imageUrl } = useStorageImage(_props.event?.image_url ?? null)

const eventDate = computed(() => new Date(_props.event.date))
const dayNumber = computed(() => eventDate.value.getDate())
const monthYear = computed(() => eventDate.value.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }))

watch(() => _props.event, (value) => {
  if (!isEditing.value) {
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

const startEdit = () => {
  if (!isAuthenticated.value) return
  form.value = { ..._props.event }
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  form.value = { ..._props.event }
  formError.value = ''
  isEditing.value = false
}

const saveEdit = async () => {
  const validationError = validateForm()
  if (validationError) {
    formError.value = validationError
    return
  }

  isSaving.value = true
  formError.value = ''

  try {
    const payload = buildPayload()
    await $fetch(`/api/admin/events/${_props.event.id}`, { method: 'PUT', body: payload })
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
</script>

<template>
  <div v-if="variant === 'full'" class="space-y-3">
    <UCard class="rounded-3xl bg-white/90 shadow-sm hover:shadow-lg transition-shadow relative">
      <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost"
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
          <h3 class="text-xl font-semibold mb-2">
            {{ event.title }}
          </h3>
          <p v-if="event.subtitle" class="mb-3">
            {{ event.subtitle }}
          </p>
          <p v-if="event.description" class="mb-4">
            {{ event.description }}
          </p>
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
        <div class="md:w-48 shrink-0">
          <NuxtImg :src="imageUrl ?? '/LogoColorSolo.png'" alt="Imagen del evento"
            class="object-cover rounded-lg h-32 w-full" sizes="300px" />
        </div>
      </div>
    </UCard>

    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 -translate-y-2" enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in" leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2">
      <UCard v-if="isEditing" variant="soft" class="border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-900">Editar evento</h4>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" :disabled="isSaving"
            @click="cancelEdit" />
        </div>

        <UAlert v-if="formError" color="error" icon="i-lucide-alert-circle" :description="formError" class="mb-4" />

        <form class="space-y-3" @submit.prevent="saveEdit">
          <UFormGroup label="Título" required>
            <UInput v-model="form.title" />
          </UFormGroup>
          <UFormGroup label="Subtítulo">
            <UInput v-model="form.subtitle" />
          </UFormGroup>
          <UFormGroup label="Fecha" required>
            <UInput v-model="form.date" type="date" />
          </UFormGroup>
          <UFormGroup label="Descripción">
            <UTextarea v-model="form.description" :rows="3" />
          </UFormGroup>
          <UFormGroup label="Ubicación">
            <UInput v-model="form.location" />
          </UFormGroup>
          <UFormGroup label="Enlace">
            <UInput v-model="form.link" type="url" />
          </UFormGroup>
          <UFormGroup label="Imagen (URL)">
            <UInput v-model="form.image_url" type="url" />
          </UFormGroup>

          <div class="flex justify-end gap-2 pt-2">
            <UButton type="button" color="neutral" variant="outline" size="sm" :disabled="isSaving" @click="cancelEdit">
              Cancelar
            </UButton>
            <UButton type="submit" color="primary" size="sm" :loading="isSaving">
              Guardar
            </UButton>
          </div>
        </form>
      </UCard>
    </Transition>
  </div>

  <UCard v-else-if="variant === 'past'" class="rounded-2xl opacity-75 bg-white/90 shadow-sm">
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
    <div class="bg-linear-to-r from-pontem-500/10 to-aqua-500/10 px-4 py-3">
      <span class="text-sm font-medium text-pontem-500">
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
