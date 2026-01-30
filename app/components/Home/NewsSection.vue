<template>
  <section class="relative py-16 md:py-24 rounded-[48px] mx-2 md:mx-6">
    <UContainer class="text-center">
      <div class="text-center mb-12">
        <h3 class="text-3xl md:text-4xl font-bold mb-4">
          Noticias y Blog
        </h3>
        <p class="text-lg">
          Mantente al día con las últimas novedades
        </p>
      </div>

      <LoadingSpinner v-if="status === 'pending'" />

      <EmptyState v-else-if="latestNews.length === 0" message="No hay noticias disponibles" />

      <div v-else class="grid md:grid-cols-3 gap-6">
        <NewsCard v-for="newsItem in latestNews" :key="newsItem.id" :news-item="newsItem" variant="list" />
      </div>

      <div class="text-center mt-10">
        <UButton to="/noticias" size="lg" variant="soft"
          class="font-semibold transition-colors bg-white text-gray-500 hover:bg-white hover:outline">
          Ver todas las noticias
        </UButton>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const { data: news, status } = await useFetch<NewsRecord[]>('/api/news/news', {
  default: () => []
})

const latestNews = computed(() => {
  return (news.value || [])
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
    .slice(0, 3)
})
</script>
