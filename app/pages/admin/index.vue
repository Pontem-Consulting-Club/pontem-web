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
          :class="activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-600'"
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
          :on-delete="(id) => handleDelete('events', id)" :on-edit="() => goToEdit('events', event.id)" />
      </div>

      <!-- Projects Tab -->
      <div v-if="activeTab === 'projects'" class="space-y-4">
        <EmptyState v-if="projects.length === 0" message="No hay proyectos" />
        <AdminProjectListItem v-for="project in projects" :key="project.id" :project="project"
          :on-delete="(id) => handleDelete('projects', id)" :on-edit="() => goToEdit('projects', project.id)" />
      </div>

      <!-- News Tab -->
      <div v-if="activeTab === 'news'" class="space-y-4">
        <EmptyState v-if="news.length === 0" message="No hay noticias" />
        <AdminNewsListItem v-for="newsItem in news" :key="newsItem.id" :news-item="newsItem"
          :on-delete="(id) => handleDelete('news', id)" :on-edit="() => goToEdit('news', newsItem.id)" />
      </div>
    </template>
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

onMounted(() => {
  fetchData()
})

const router = useRouter()
const goToEdit = (type: 'events' | 'projects' | 'news', id: number) => {
  router.push(`/admin/edit/${type}/${id}`)
}

</script>