<template>
  <UPageSection title="Noticias y Blog" description="Mantente al día con las últimas novedades">
    <LoadError v-if="error" title="No pudimos cargar las noticias" :retry="refresh" />

    <UEmpty v-else-if="latestNews.length === 0" title="No hay noticias disponibles" icon="i-lucide-inbox"/>

    <UPageGrid v-else>
      <NewsCard v-for="newsItem in latestNews" :key="newsItem.id" :news-item="newsItem" />
    </UPageGrid>


    <div class="mt-10">
      <UButton to="/noticias" size="lg" color="neutral" variant="outline">
        Ver todas las noticias
      </UButton>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const { data: news, error, refresh } = await useFetch<NewsRecord[]>('/api/news', {
  default: () => []
})

const latestNews = computed(() => {
  return (news.value || [])
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
    .slice(0, 3)
})
</script>
