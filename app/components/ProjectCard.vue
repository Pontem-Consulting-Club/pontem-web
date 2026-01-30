<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

interface Props {
  project: ProjectRecord
  isNew?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  isNew: false
})

const { project } = _props
const emit = defineEmits<{
  (e: 'updated' | 'created' | 'cancel-create'): void
}>()

const { isAuthenticated } = useAuth()

const isEditing = ref(_props.isNew)
const isSaving = ref(false)
const formError = ref('')
const form = ref<Partial<ProjectRecord>>({})
const inputBase = 'bg-transparent border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
const textareaBase = `${inputBase} resize-none`

const { url: imageUrl } = useStorageImage(project.image_url)

watch(() => project, (value) => {
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

const startEdit = () => {
  if (_props.isNew) return
  if (!isAuthenticated.value) return
  form.value = { ...project }
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  if (_props.isNew) {
    emit('cancel-create')
    return
  }
  form.value = { ...project }
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
    if (_props.isNew) {
      await $fetch('/api/admin/projects', { method: 'POST', body: payload })
      emit('created')
    } else {
      await $fetch(`/api/admin/projects/${project.id}`, { method: 'PUT', body: payload })
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
</script>

<template>
  <UCard variant="soft" class="rounded-xl bg-white/75 relative">
    <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="primary" variant="ghost"
      class="absolute top-3 right-3 z-10" @click="startEdit" />

    <form class="contents" @submit.prevent="isEditing ? saveEdit() : undefined">
      <div class="flex flex-col md:flex-row p-6 gap-4">
        <div class="flex flex-col justify-between flex-1">
          <div class="text-xl text-primary font-semibold mb-2">
            <UInput v-if="isEditing" v-model="form.title"
              :ui="{ base: `${inputBase} text-xl text-primary font-semibold` }" />
            <template v-else>
              {{ project.title }}
            </template>
          </div>

          <div v-if="isEditing || project.subtitle" class="text-gray-600 font-semibold mb-3">
            <UInput v-if="isEditing" v-model="form.subtitle" placeholder="Subtítulo"
              :ui="{ base: `${inputBase} text-gray-600 font-semibold` }" />
            <template v-else>
              {{ project.subtitle }}
            </template>
          </div>

          <div v-if="isEditing || project.description" class="mr-4 text-justify text-gray-600">
            <UTextarea v-if="isEditing" v-model="form.description" :rows="3" placeholder="Descripción"
              :ui="{ base: `${textareaBase} text-justify text-gray-600` }" />
            <template v-else>
              {{ project.description }}
            </template>
          </div>

          <div class="mt-3">
            <div v-if="isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <UInput v-model="form.link_text" placeholder="Texto del enlace" :ui="{ base: `${inputBase}` }" />
              <UInput v-model="form.link" type="url" placeholder="Enlace" :ui="{ base: `${inputBase}` }" />
            </div>
            <UButton v-else-if="project.link" :href="project.link" target="_blank" variant="link" block class="p-4">
              {{ project.link_text || 'Ver más' }}
            </UButton>
          </div>
        </div>

        <div class="relative">
          <NuxtImg :src="imageUrl ?? '/LogoColorSolo.png'" alt="Imagen del proyecto" class="object-cover rounded-xl"
            width="500" />
          <div v-if="isEditing" class="absolute inset-x-2 bottom-2">
            <UInput v-model="form.image_url" type="url" placeholder="Imagen (URL)" :ui="{ base: `${inputBase}` }" />
          </div>
        </div>
      </div>

      <UAlert v-if="formError && isEditing" color="error" icon="i-lucide-alert-circle" :description="formError"
        class="mx-6 mb-4" />

      <div v-if="isEditing" class="flex justify-end gap-2 px-6 pb-6">
        <UButton type="button" color="neutral" variant="outline" size="sm" :disabled="isSaving" @click="cancelEdit">
          Cancelar
        </UButton>
        <UButton type="submit" color="primary" size="sm" :loading="isSaving">
          Guardar
        </UButton>
      </div>
    </form>
  </UCard>
</template>
