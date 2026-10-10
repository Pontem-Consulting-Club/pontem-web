<template>
  <div>
    <PageBanner title="Noticias y Blog" page="noticias" />
    <UContainer class="py-8">
      <div class="flex flex-row items-center justify-between gap-4">
      <!-- Filters -->
      <NewsFilterPills v-model="selectedTypes" :options="types" label="Selecciona las noticias que deseas ver:" />
      <UButton v-if="isEditor" icon="i-lucide-plus" color="primary" size="md" @click="startCreate">
        Agregar
      </UButton>
      </div>

      <h2 class="sr-only">Todas las noticias</h2>
      <LoadError v-if="error" title="No pudimos cargar las noticias" :retry="refresh" />

      <UEmpty v-else-if="paginatedNews.length === 0" icon="i-lucide-inbox" title="No hay noticias disponibles" />

      <UPageGrid v-else>
        <NewsCard v-for="newsItem in paginatedNews" :key="newsItem.id" :news-item="newsItem"/>
      </UPageGrid>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center">
        <UPagination v-model="currentPage" :total="filteredNews.length" :items-per-page="newsPerPage" />
      </div>
    </UContainer>
  </div>
</template>
<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

usePageMeta({
  title: 'Noticias y Blog - Pontem',
  description: 'Noticias, anuncios y artículos de Pontem Consulting Club.'
})

const { data: news, error, refresh } = await useFetch<NewsRecord[]>('/api/news', {
  default: () => []
})

const { isEditor } = useProfile()
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
