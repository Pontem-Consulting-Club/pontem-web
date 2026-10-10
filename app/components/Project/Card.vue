<template>
  <ProjectEditForm v-if="isEditing" v-model:form="form" :is-new="_props.isNew" :is-saving="isSaving"
    :is-deleting="isDeleting" :form-error="formError"
    @submit="saveEdit" @cancel="cancelEdit" @delete="handleDelete" />

  <UCard v-else variant="item" class="relative flex flex-col" :ui="{ body: 'flex flex-1 flex-col gap-1' }">
    <template #header>
      <ContentEditButton v-if="isEditor" ref="editButton" label="Editar proyecto" :disabled="otherEditorOpen"
        @click="startEdit" />

      <NuxtImg v-if="imageUrl" :src="imageUrl" preset="card" :alt="project.title" class="h-44 w-full object-cover" />
      <!-- Sin imagen: el logo completo, no recortado por object-cover. -->
      <NuxtImg v-else src="/LogoColorSolo.png" alt="" class="h-44 w-full bg-muted object-contain p-8" />
    </template>

      <UBadge v-if="showSemester && project.semester" color="neutral" class="mb-1 self-start">
        {{ project.semester }}
      </UBadge>
      <h3 class="text-subheading text-highlighted">
        {{ project.title }}
      </h3>
      <div v-if="project.subtitle" class="text-xs text-muted font-medium mb-1">
        {{ project.subtitle }}
      </div>
      <div class="flex-1">
        <!-- Cuatro líneas: una descripción larga estiraba la fila entera de la grilla. -->
        <p v-if="project.description" :id="descriptionId" ref="descriptionEl" class="text-sm/relaxed text-muted"
          :class="{ 'line-clamp-4': !expanded }">
          {{ project.description }}
        </p>
        <UButton v-if="isClamped || expanded" variant="link" size="xs" class="px-0"
          :aria-expanded="expanded" :aria-controls="descriptionId" @click="expanded = !expanded">
          {{ expanded ? 'Ver menos' : 'Leer todo' }}
        </UButton>
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
  /** En "Proyectos anteriores" cada tarjeta dice de qué semestre es. */
  showSemester?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  isNew: false,
  showSemester: false
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

// "Leer todo" aparece solo si el recorte de cuatro líneas se come texto.
const descriptionId = useId()
const descriptionEl = useTemplateRef('descriptionEl')
const expanded = ref(false)
const isClamped = ref(false)
const measureClamp = async () => {
  await nextTick()
  const el = descriptionEl.value
  isClamped.value = !!el && el.scrollHeight > el.clientHeight + 1
}
// Se vuelve a medir cuando cambia el ancho de la tarjeta y cuando termina de
// cargar Raleway: con la fuente de respaldo, más ancha, el texto ocupa más líneas.
let resizeObserver: ResizeObserver | undefined
onMounted(() => document.fonts?.ready.then(measureClamp))
watch(descriptionEl, (el, previous) => {
  if (previous) resizeObserver?.unobserve(previous)
  // En el servidor no hay elemento (ni ResizeObserver).
  if (!el) return
  resizeObserver ??= new ResizeObserver(() => measureClamp())
  resizeObserver.observe(el)
  measureClamp()
}, { flush: 'post', immediate: true })
onBeforeUnmount(() => resizeObserver?.disconnect())
watch(() => project.value.description, measureClamp)

const toast = useToast()
const { confirmDelete, confirmDiscard } = useConfirm()
const editButton = useTemplateRef('editButton')
const { othersOpen: otherEditorOpen } = useEditorSlot(
  () => (_props.isNew ? 'proyecto:nuevo' : `proyecto:${project.value.id}`),
  { isEditing, focusOnClose: () => editButton.value?.focus() }
)

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

const cancelEdit = async (hasPendingFile = false) => {
  if ((hasPendingFile || formChanged(form.value, project.value)) && !(await confirmDiscard())) return
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
    toast.add({ title: _props.isNew ? 'Proyecto creado' : 'Proyecto guardado', icon: 'i-lucide-check', color: 'success' })
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
  if (!(await confirmDelete('este proyecto'))) return

  isDeleting.value = true
  formError.value = ''

  try {
    await $fetch(`/api/admin/projects/${project.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Proyecto eliminado', icon: 'i-lucide-check', color: 'success' })
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
