<template>
  <div>
    <PageHeader title="Noticias y Blog" background-image="/ActividadSumma.JPG" />
    <UContainer class="py-8">
      <div class="flex flex-row items-center justify-between gap-4">
      <!-- Filters -->
      <NewsFilterPills v-model="selectedTypes" :options="types" label="Selecciona las noticias que deseas ver:" />
      <UButton v-if="isAuthenticated" variant="soft" icon="i-lucide-plus" color="primary" size="md" @click="startCreate">
        Agregar
      </UButton>
      </div>

      <LoadingSpinner v-if="status === 'pending'" />

      <div v-if="paginatedNews.length === 0" class="text-center">
        <UIcon name="i-lucide-inbox" class="w-16 h-16 mx-auto mb-4" />
        <p>No hay noticias disponibles</p>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NewsCard v-for="newsItem in paginatedNews" :key="newsItem.id" :news-item="newsItem" variant="card" />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center">
        <UPagination v-model="currentPage" :total="filteredNews.length" :items-per-page="newsPerPage" />
      </div>
    </UContainer>
  </div>
</template>
<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

useHead({
  title: 'Noticias y Blog - Pontem'
})

const { data: news, status } = await useFetch<NewsRecord[]>('/api/news/news', {
  default: () => []
})

const { isAuthenticated } = useAuth()
const router = useRouter()

const startCreate = () => {
  router.push('/noticias/new')
}

const selectedTypes = ref<string[]>([])
const currentPage = ref(1)
const newsPerPage = 6

const types = ['Evento', 'Artículo', 'Anuncio']

const filteredNews = computed(() => {
  let filtered = news.value || []

  if (selectedTypes.value.length > 0) {
    filtered = filtered.filter(item => selectedTypes.value.includes(item.type || ''))
  }

  return filtered.sort((a, b) =>
    new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
  )
})

// Reset to first page when filters change
watch(selectedTypes, () => {
  currentPage.value = 1
})

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * newsPerPage
  const end = start + newsPerPage
  return filteredNews.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredNews.value.length / newsPerPage))
</script>
