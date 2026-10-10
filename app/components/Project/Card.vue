<template>
  <ProjectEditForm v-if="isEditing" v-model:form="form" :is-new="_props.isNew" :is-saving="isSaving"
    :is-deleting="isDeleting" :form-error="formError"
    :class="_props.layout === 'row' ? 'my-4 max-w-xl ring-1 ring-default' : undefined"
    @submit="saveEdit" @cancel="cancelEdit" @delete="handleDelete" />

  <!-- Fila de "Proyectos anteriores" -->
  <div v-else-if="_props.layout === 'row'"
    class="flex flex-col gap-1 py-3 sm:grid sm:grid-cols-[120px_1fr_2fr_auto] sm:gap-4 sm:items-center">
    <span class="text-xs font-semibold text-muted uppercase tracking-wide">{{ project.semester }}</span>
    <span class="text-sm font-semibold text-default">{{ project.title }}</span>
    <span class="text-xs text-muted sm:truncate">{{ project.subtitle }}</span>
    <ContentEditButton v-if="isEditor" label="Editar proyecto" inline class="self-start sm:self-auto"
      @click="startEdit" />
  </div>

  <UCard v-else variant="item" class="relative flex flex-col" :ui="{ body: 'flex flex-1 flex-col gap-1' }">
    <template #header>
      <ContentEditButton v-if="isEditor" label="Editar proyecto" @click="startEdit" />

      <NuxtImg v-if="imageUrl" :src="imageUrl" :alt="project.title" class="h-44 w-full object-cover" />
      <!-- Sin imagen: el logo completo, no recortado por object-cover. -->
      <NuxtImg v-else src="/LogoColorSolo.png" alt="" class="h-44 w-full bg-muted object-contain p-8" />
    </template>

      <h3 class="text-subheading text-highlighted">
        {{ project.title }}
      </h3>
      <div v-if="project.subtitle" class="text-xs text-muted font-medium mb-1">
        {{ project.subtitle }}
      </div>
      <div v-if="project.description" class="text-sm/relaxed text-muted flex-1">
        {{ project.description }}
      </div>
      <UButton v-if="project.link" class="max-w-fit mt-4" :href="project.link" target="_blank"
        trailing-icon="i-lucide-external-link"
        :aria-label="`${project.link_text || 'Ver más'}: ${project.title} (se abre en otra pestaña)`">
        {{ project.link_text || 'Ver más' }}
      </UButton>
  </UCard>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

interface Props {
  project: ProjectRecord
  isNew?: boolean
  /** `row` es la fila compacta de "Proyectos anteriores". */
  layout?: 'card' | 'row'
}

const _props = withDefaults(defineProps<Props>(), {
  isNew: false,
  layout: 'card'
})

const project = toRef(_props, 'project')
const emit = defineEmits<{
  (e: 'updated' | 'created' | 'cancel-create'): void
}>()

const { isEditor } = useProfile()

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
  link_text: normalizeValue(form.value.link_text as string | null),
  semester: normalizeValue(form.value.semester as string | null),
  is_active: form.value.is_active !== false
})

const buildFormData = (payload: ReturnType<typeof buildPayload>, file?: File | null) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value === null ? '' : String(value))
  })

  if (file) {
    formData.append('image', file)
  }

  return formData
}

const startEdit = () => {
  if (_props.isNew) return
  if (!isEditor.value) return
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
