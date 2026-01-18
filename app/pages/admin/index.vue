<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">
        Panel de Administración
      </h1>
      <UButton color="error" variant="outline" icon="i-lucide-log-out" @click="logout">
        Cerrar Sesión
      </UButton>
    </div>

    <!-- Tabs -->
    <div class="border-b mb-8">
      <nav class="flex gap-4">
        <button v-for="tab in tabs" :key="tab.key" class="pb-4 px-2 border-b-2 font-medium text-sm transition-colors"
          :class="activeTab === tab.key ? 'border-pontemred-500 text-pontemred-600' : 'border-transparent text-gray-600'"
          @click="activeTab = tab.key">
          {{ tab.label }}
          <span class="ml-2 bg-white border px-2 py-0.5 rounded-full text-xs">
            {{ tab.count.value }}
          </span>
        </button>
      </nav>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingSpinner />
    </div>

    <template v-else>
      <!-- Events Tab -->
      <div v-if="activeTab === 'events'" class="space-y-4">
        <EmptyState v-if="events.length === 0" message="No hay eventos" />
        <AdminEventListItem v-for="event in events" :key="event.id" :event="event"
          :on-delete="(id) => handleDelete('events', id)" :on-edit="() => openEdit('events', event)" />
      </div>

      <!-- Projects Tab -->
      <div v-if="activeTab === 'projects'" class="space-y-4">
        <EmptyState v-if="projects.length === 0" message="No hay proyectos" />
        <AdminProjectListItem v-for="project in projects" :key="project.id" :project="project"
          :on-delete="(id) => handleDelete('projects', id)" :on-edit="() => openEdit('projects', project)" />
      </div>

      <!-- News Tab -->
      <div v-if="activeTab === 'news'" class="space-y-4">
        <EmptyState v-if="news.length === 0" message="No hay noticias" />
        <AdminNewsListItem v-for="newsItem in news" :key="newsItem.id" :news-item="newsItem"
          :on-delete="(id) => handleDelete('news', id)" :on-edit="() => openEdit('news', newsItem)" />
      </div>
    </template>

    <AdminEditModal v-model="isEditOpen" v-model:form-data="formData" :title="editTitle" :fields="editFields"
      :error="formError" :loading="isSaving" @submit="saveEdit" />
  </UContainer>
</template>

<script setup lang="ts">
import type { EventRecord, ProjectRecord, NewsRecord } from '~/types/content'

useHead({
  title: 'Admin - Pontem'
})

definePageMeta({
  middleware: 'auth'
})

const { logout } = useAuth()

const activeTab = ref<'events' | 'projects' | 'news'>('events')

const events = ref<EventRecord[]>([])
const projects = ref<ProjectRecord[]>([])
const news = ref<NewsRecord[]>([])
const isLoading = ref(true)

const fetchData = async () => {
  isLoading.value = true
  try {
    const [eventsRes, projectsRes, newsRes] = await Promise.all([
      $fetch<EventRecord[]>('/api/admin/events'),
      $fetch<ProjectRecord[]>('/api/admin/projects'),
      $fetch<NewsRecord[]>('/api/admin/news')
    ])

    events.value = eventsRes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    projects.value = projectsRes
    news.value = newsRes.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async (type: 'events' | 'projects' | 'news', id: number) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este elemento?')) return

  try {
    await $fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' })
    await fetchData()
  } catch (error) {
    console.error('Error deleting item:', error)
  }
}

const tabs: { key: 'events' | 'projects' | 'news'; label: string; count: ComputedRef<number> }[] = [
  { key: 'events', label: 'Eventos', count: computed(() => events.value.length) },
  { key: 'projects', label: 'Proyectos', count: computed(() => projects.value.length) },
  { key: 'news', label: 'Noticias', count: computed(() => news.value.length) }
]

type FieldConfig = {
  key:
  | 'title'
  | 'subtitle'
  | 'description'
  | 'date'
  | 'image_url'
  | 'location'
  | 'link'
  | 'link_text'
  | 'type'
  | 'author'
  | 'published_date'
  | 'content'
  label: string
  type?: 'textarea'
  inputType?: 'text' | 'url'
  required?: boolean
  placeholder?: string
}

const fieldsByType: Record<'events' | 'projects' | 'news', FieldConfig[]> = {
  events: [
    { key: 'title', label: 'Título', required: true },
    { key: 'subtitle', label: 'Subtítulo' },
    { key: 'date', label: 'Fecha', required: true, placeholder: 'YYYY-MM-DD' },
    { key: 'description', label: 'Descripción', type: 'textarea' },
    { key: 'location', label: 'Ubicación' },
    { key: 'link', label: 'Enlace', inputType: 'url' },
    { key: 'image_url', label: 'Imagen (URL)', inputType: 'url' }
  ],
  projects: [
    { key: 'title', label: 'Título', required: true },
    { key: 'subtitle', label: 'Subtítulo' },
    { key: 'description', label: 'Descripción', type: 'textarea' },
    { key: 'link_text', label: 'Texto del enlace' },
    { key: 'link', label: 'Enlace', inputType: 'url' },
    { key: 'image_url', label: 'Imagen (URL)', inputType: 'url' }
  ],
  news: [
    { key: 'title', label: 'Título', required: true },
    { key: 'subtitle', label: 'Subtítulo' },
    { key: 'type', label: 'Tipo' },
    { key: 'author', label: 'Autor' },
    { key: 'published_date', label: 'Fecha de publicación', required: true, placeholder: 'YYYY-MM-DD' },
    { key: 'content', label: 'Contenido', type: 'textarea' },
    { key: 'link', label: 'Enlace', inputType: 'url' },
    { key: 'image_url', label: 'Imagen (URL)', inputType: 'url' }
  ]
}

const isEditOpen = ref(false)
const editType = ref<'events' | 'projects' | 'news' | null>(null)
const editId = ref<number | null>(null)
const formData = ref<Partial<Record<string, string | number | null>>>({})
const formError = ref('')
const isSaving = ref(false)

const editFields = computed<FieldConfig[]>(() => (editType.value ? fieldsByType[editType.value] : []))

const editTitle = computed(() => {
  if (!editType.value) return 'Editar'
  if (editType.value === 'events') return 'Editar evento'
  if (editType.value === 'projects') return 'Editar proyecto'
  return 'Editar noticia'
})

const normalizeValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return null
  const trimmed = value.toString().trim()
  return trimmed === '' ? null : trimmed
}

const validateForm = (type: 'events' | 'projects' | 'news') => {
  const titleValue = formData.value.title
  if (!titleValue || !titleValue.toString().trim()) {
    return 'El título es obligatorio.'
  }

  if (type === 'events') {
    const dateValue = formData.value.date
    if (!dateValue || !dateValue.toString().trim()) {
      return 'La fecha es obligatoria.'
    }
  }

  if (type === 'news') {
    const publishedValue = formData.value.published_date
    if (!publishedValue || !publishedValue.toString().trim()) {
      return 'La fecha de publicación es obligatoria.'
    }
  }

  return ''
}

const buildPayload = (type: 'events' | 'projects' | 'news') => {
  if (type === 'events') {
    return {
      title: formData.value.title?.toString().trim() || '',
      date: formData.value.date?.toString().trim() || '',
      subtitle: normalizeValue(formData.value.subtitle),
      description: normalizeValue(formData.value.description),
      image_url: normalizeValue(formData.value.image_url),
      location: normalizeValue(formData.value.location),
      link: normalizeValue(formData.value.link)
    }
  }

  if (type === 'projects') {
    return {
      title: formData.value.title?.toString().trim() || '',
      subtitle: normalizeValue(formData.value.subtitle),
      description: normalizeValue(formData.value.description),
      image_url: normalizeValue(formData.value.image_url),
      link: normalizeValue(formData.value.link),
      link_text: normalizeValue(formData.value.link_text)
    }
  }

  return {
    title: formData.value.title?.toString().trim() || '',
    subtitle: normalizeValue(formData.value.subtitle),
    type: normalizeValue(formData.value.type),
    image_url: normalizeValue(formData.value.image_url),
    author: normalizeValue(formData.value.author),
    published_date: formData.value.published_date?.toString().trim() || '',
    content: normalizeValue(formData.value.content),
    link: normalizeValue(formData.value.link)
  }
}

const openEdit = (type: 'events' | 'projects' | 'news', item: EventRecord | ProjectRecord | NewsRecord) => {
  editType.value = type
  editId.value = item.id
  formError.value = ''
  formData.value = { ...item }
  isEditOpen.value = true
}

const saveEdit = async () => {
  if (!editType.value || editId.value === null) return

  const validationError = validateForm(editType.value)
  if (validationError) {
    formError.value = validationError
    return
  }

  isSaving.value = true
  formError.value = ''

  try {
    const payload = buildPayload(editType.value)
    await $fetch(`/api/admin/${editType.value}/${editId.value}`, { method: 'PUT', body: payload })
    isEditOpen.value = false
    await fetchData()
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

watch(isEditOpen, (open) => {
  if (!open) {
    editType.value = null
    editId.value = null
    formError.value = ''
    formData.value = {}
  }
})

onMounted(() => {
  fetchData()
})

</script>