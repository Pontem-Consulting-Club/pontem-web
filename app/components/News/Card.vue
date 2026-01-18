<script setup lang="ts">
import type { NewsRecord } from '~/types/content'
import { useStorageImage } from '~/composables/useStorageImage'

interface Props {
  newsItem: NewsRecord
  variant?: 'card' | 'list'
}

const _props = withDefaults(defineProps<Props>(), {
  variant: 'card'
})

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const { isAuthenticated } = useAuth()
const { calculateTimeAgo } = useTimeAgo()

const isEditing = ref(false)
const isSaving = ref(false)
const formError = ref('')
const form = ref<Partial<NewsRecord>>({})

// get image URL from Supabase Storage (or use absolute/root paths directly)
const { url: imageUrl } = useStorageImage(_props.newsItem?.image_url ?? null)

watch(() => _props.newsItem, (value) => {
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

  if (!form.value.published_date || !form.value.published_date.toString().trim()) {
    return 'La fecha de publicación es obligatoria.'
  }

  return ''
}

const buildPayload = () => ({
  title: form.value.title?.toString().trim() || '',
  published_date: form.value.published_date?.toString().trim() || '',
  subtitle: normalizeValue(form.value.subtitle as string | null),
  content: normalizeValue(form.value.content as string | null),
  image_url: normalizeValue(form.value.image_url as string | null),
  author: normalizeValue(form.value.author as string | null),
  type: normalizeValue(form.value.type as string | null)
})

const startEdit = () => {
  if (!isAuthenticated.value) return
  form.value = { ..._props.newsItem }
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  form.value = { ..._props.newsItem }
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
    await $fetch(`/api/admin/news/${_props.newsItem.id}`, { method: 'PUT', body: payload })
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
    <UCard variant="soft"
      class="flex flex-col rounded-xl bg-white/90 shadow-sm hover:shadow-lg transition-shadow relative">
      <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost"
        class="absolute top-3 right-3 z-10" @click="startEdit" />
      <NuxtImg v-if="imageUrl" :src="imageUrl" alt="Cover Image" class="rounded-t-xl h-48 w-full object-cover"
        sizes="500px" />
      <NuxtImg v-else src="/default-news-image.jpg" alt="Cover Image" class="rounded-t-xl h-48 w-full object-cover"
        sizes="500px" />
      <div v-if="newsItem.type" class="mb-4">
        <TypeBadge :type="newsItem.type" size="xs" />
      </div>
      <h3 class="text-xl font-semibold mb-2">
        {{ newsItem.title }}
      </h3>
      <p v-if="newsItem.subtitle" class="mb-4 flex-1">
        {{ newsItem.subtitle }}
      </p>
      <div class="flex items-center justify-between text-sm mb-4">
        <span v-if="newsItem.author">Por <strong>{{ newsItem.author }}</strong></span>
        <span>{{ calculateTimeAgo(newsItem.published_date) }}</span>
      </div>
      <UButton :to="`/noticias/${newsItem.id}`" variant="soft"
        class="transition-colors duration-300 rounded-lg px-5 py-2">
        Leer más
      </UButton>
    </UCard>

    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 -translate-y-2" enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in" leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2">
      <UCard v-if="isEditing" variant="soft" class="border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-900">Editar noticia</h4>
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
          <UFormGroup label="Fecha de publicación" required>
            <UInput v-model="form.published_date" type="date" />
          </UFormGroup>
          <UFormGroup label="Descripción">
            <UTextarea v-model="form.content" :rows="3" />
          </UFormGroup>
          <UFormGroup label="Autor">
            <UInput v-model="form.author" />
          </UFormGroup>
          <UFormGroup label="Tipo">
            <UInput v-model="form.type" />
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
</template>
