<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

interface Props {
  project: ProjectRecord
}

const { project } = defineProps<Props>()
const emit = defineEmits<{
  (e: 'updated'): void
}>()

const { isAuthenticated } = useAuth()

const isEditing = ref(false)
const isSaving = ref(false)
const formError = ref('')
const form = ref<Partial<ProjectRecord>>({})

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
  if (!isAuthenticated.value) return
  form.value = { ...project }
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
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
    await $fetch(`/api/admin/projects/${project.id}`, { method: 'PUT', body: payload })
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
  <div class="space-y-3">
    <UCard variant="soft" class="rounded-xl bg-white/75 relative">
      <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost"
        class="absolute top-3 right-3 z-10" @click="startEdit" />
      <div class="flex flex-col md:flex-row p-6 gap-4">
        <div class="flex flex-col justify-between flex-1">
          <h3 class="text-xl text-primary font-semibold mb-2">
            {{ project.title }}
          </h3>
          <p v-if="project.subtitle" class="text-gray font-semibold mb-3">
            {{ project.subtitle }}
          </p>
          <p v-if="project.description" class="mr-4 text-justify">
            {{ project.description }}
          </p>
          <UButton v-if="project.link" :href="project.link" target="_blank" variant="link" block class="p-4">
            {{ project.link_text || 'Ver más' }}
          </UButton>
        </div>
        <NuxtImg :src="imageUrl ?? '/LogoColorSolo.png'" alt="Imagen del proyecto" class="object-cover rounded-xl"
          width="500" />
      </div>
    </UCard>

    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 -translate-y-2" enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in" leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2">
      <UCard v-if="isEditing" variant="soft" class="border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-900">Editar proyecto</h4>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" :disabled="isSaving"
            @click="cancelEdit" />
        </div>

        <UAlert v-if="formError" color="error" icon="i-lucide-alert-circle" :description="formError" class="mb-4" />

        <form class="space-y-3" @submit.prevent="saveEdit">
          <UFormField label="Título" required>
            <UInput v-model="form.title" />
          </UFormField>
          <UFormField label="Subtítulo">
            <UInput v-model="form.subtitle" />
          </UFormField>
          <UFormField label="Descripción">
            <UTextarea v-model="form.description" :rows="3" />
          </UFormField>
          <UFormField label="Texto del enlace">
            <UInput v-model="form.link_text" />
          </UFormField>
          <UFormField label="Enlace">
            <UInput v-model="form.link" type="url" />
          </UFormField>
          <UFormField label="Imagen (URL)">
            <UInput v-model="form.image_url" type="url" />
          </UFormField>

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
</template>
