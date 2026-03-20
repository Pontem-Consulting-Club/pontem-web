<template>
  <UContainer class="py-16 max-w-4xl">
    <LoadingSpinner v-if="isLoading" />
    <NotFoundState v-else-if="showNotFound" icon="i-lucide-file-x" title="Noticia no encontrada"
      button-text="Volver a noticias" button-link="/noticias" />

    <div v-else>
      <NewsEditForm v-if="isEditMode" v-model:form="form" :is-new="isNew" :is-saving="isSaving"
        :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="handleCancel"
        @delete="handleDelete" />

      <NewsDisplay v-else-if="newsItem" :news-item="newsItem" :is-authenticated="isAuthenticated" :id-param="idParam" />
      <NotFoundState v-else icon="i-lucide-file-x" title="Noticia no encontrada" button-text="Volver a noticias"
        button-link="/noticias" />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const route = useRoute()
const router = useRouter()
const idParam = route.params.id as string
const isNew = idParam === 'new'
const numericId = Number(idParam)
const isValidId = !Number.isNaN(numericId)

const { isAuthenticated } = useAuth()

const isEditMode = computed(() => {
  const editQuery = route.query.edit
  return isNew || editQuery === '1' || editQuery === 'true'
})

if (!isNew && !isValidId) {
  router.replace('/noticias')
}

const { data: newsItem, status, error, refresh } = await useFetch<NewsRecord>(`/api/news/${numericId}`, {
  immediate: !isNew && isValidId
})

useHead({
  title: computed(() => {
    if (isEditMode.value) {
      return isNew ? 'Nueva noticia - Pontem' : 'Editar noticia - Pontem'
    }
    return newsItem.value?.title ? `${newsItem.value.title} - Pontem` : 'Noticia - Pontem'
  })
})


const form = ref<Partial<NewsRecord>>({})
const formError = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)

const editNews = computed<NewsRecord | null>(() => {
  if (isNew) {
    return {
      id: 0,
      title: '',
      subtitle: null,
      type: null,
      image_url: null,
      author: null,
      published_date: new Date().toISOString().slice(0, 10),
      content: null,
      link: null
    }
  }
  return newsItem.value ?? null
})

const isLoading = computed(() => !isNew && status.value === 'pending')

const showNotFound = computed(() => {
  if (isNew) return false
  if (error.value) return true
  return !newsItem.value
})

watchEffect(() => {
  if (!isEditMode.value) return
  if (!isAuthenticated.value) {
    router.replace(isNew ? '/noticias' : `/noticias/${idParam}`)
  }
})

const handleCancel = () => {
  if (isNew) {
    router.push('/noticias')
    return
  }
  router.push(`/noticias/${idParam}`)
}

const handleUpdated = async () => {
  await refresh()
  router.push(`/noticias/${idParam}`)
}

const handleCreated = () => {
  router.push('/noticias')
}

const handleDelete = async () => {
  if (isNew || !editNews.value) return
  const confirmed = typeof window !== 'undefined'
    ? window.confirm('¿Eliminar esta noticia? Esta acción no se puede deshacer.')
    : false

  if (!confirmed) return

  isDeleting.value = true
  formError.value = ''

  try {
    await $fetch(`/api/admin/news/${editNews.value.id}`, { method: 'DELETE' })
    router.push('/noticias')
  } catch (error: unknown) {
    const apiError = typeof error === 'object' && error !== null && 'data' in error
      ? (error as { data?: { statusMessage?: string; message?: string } })
      : null
    formError.value = apiError?.data?.statusMessage
      || apiError?.data?.message
      || (error instanceof Error ? error.message : 'Error al eliminar la noticia')
  } finally {
    isDeleting.value = false
  }
}

watch(editNews, (value) => {
  if (!value) return
  form.value = { ...value }
  formError.value = ''
}, { immediate: true })

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
    if (isNew) {
      await $fetch('/api/admin/news', { method: 'POST', body: formData })
      handleCreated()
    } else if (editNews.value) {
      await $fetch(`/api/admin/news/${editNews.value.id}`, { method: 'PUT', body: formData })
      await handleUpdated()
    }
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
