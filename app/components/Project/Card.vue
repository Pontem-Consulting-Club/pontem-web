<template>
  <ProjectEditForm v-if="isEditing" v-model:form="form" :is-new="_props.isNew" :is-saving="isSaving"
    :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="cancelEdit" @delete="handleDelete" />

  <UCard v-else variant="soft" class="rounded-xl bg-white/75 relative">
    <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="primary" variant="ghost"
      class="absolute top-3 right-3 z-10" @click="startEdit" />

    <div class="flex flex-col md:flex-row p-6 gap-4">
      <div class="flex flex-col justify-between flex-1">
        <div class="text-xl text-primary font-semibold mb-2">
          {{ project.title }}
        </div>

        <div v-if="project.subtitle" class="text-gray-600 font-semibold mb-3">
          {{ project.subtitle }}
        </div>

        <div v-if="project.description" class="mr-4 text-justify text-gray-600">
          {{ project.description }}
        </div>

        <div class="mt-3">
          <UButton v-if="project.link" :href="project.link" target="_blank" variant="link" block class="p-4">
            {{ project.link_text || 'Ver más' }}
          </UButton>
        </div>
      </div>

      <div class="relative">
        <NuxtImg :src="imageUrl ?? '/LogoColorSolo.png'" alt="Imagen del proyecto" class="object-cover rounded-xl"
          width="500" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

interface Props {
  project: ProjectRecord
  isNew?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  isNew: false
})

const project = toRef(_props, 'project')
const emit = defineEmits<{
  (e: 'updated' | 'created' | 'cancel-create'): void
}>()

const { isAuthenticated } = useAuth()

const isEditing = ref(_props.isNew)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')
const form = ref<Partial<ProjectRecord>>({})

const { url: imageUrl } = useStorageImage(computed(() => project.value.image_url ?? null))

watch(project, (value) => {
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

  return ''
}

const buildPayload = () => ({
  title: form.value.title?.toString().trim() || '',
  subtitle: normalizeValue(form.value.subtitle as string | null),
  description: normalizeValue(form.value.description as string | null),
  image_url: normalizeValue(form.value.image_url as string | null),
  link: normalizeValue(form.value.link as string | null),
  link_text: normalizeValue(form.value.link_text as string | null)
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
  form.value = { ...project.value }
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  if (_props.isNew) {
    emit('cancel-create')
    return
  }
  form.value = { ...project.value }
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
      await $fetch('/api/admin/projects', { method: 'POST', body: formData })
      emit('created')
      emit('updated')
    } else {
      await $fetch(`/api/admin/projects/${project.value.id}`, { method: 'PUT', body: formData })
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
    ? window.confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')
    : false

  if (!confirmed) return

  isDeleting.value = true
  formError.value = ''

  try {
    await $fetch(`/api/admin/projects/${project.value.id}`, { method: 'DELETE' })
    isEditing.value = false
    emit('updated')
  } catch (error: unknown) {
    const apiError = typeof error === 'object' && error !== null && 'data' in error
      ? (error as { data?: { statusMessage?: string; message?: string } })
      : null
    formError.value = apiError?.data?.statusMessage
      || apiError?.data?.message
      || (error instanceof Error ? error.message : 'Error al eliminar el proyecto')
  } finally {
    isDeleting.value = false
  }
}
</script>


