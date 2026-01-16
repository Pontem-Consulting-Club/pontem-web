<template>
  <UContainer class="py-16 max-w-4xl">
    <LoadingSpinner v-if="status === 'pending'" />

    <NotFoundState v-else-if="error || !newsItem" icon="i-lucide-file-x" title="Noticia no encontrada"
      button-text="Volver a noticias" button-link="/noticias" />

    <article v-else class="bg-white rounded-lg p-6 shadow-sm">
      <!-- Back Button -->
      <UButton to="/noticias" variant="ghost" icon="i-lucide-arrow-left" class="mb-6">
        Volver a noticias
      </UButton>

      <!-- Header -->
      <ArticleHeader :type="headerType" :title="newsItem.title" :subtitle="headerSubtitle" :author="headerAuthor"
        :date="formattedDate" />

      <!-- Content -->
      <!-- eslint-disable vue/no-v-html -->
      <div v-if="rawContent" class="prose prose-lg max-w-none" v-html="rawContent" />
      <!-- eslint-enable vue/no-v-html -->

      <!-- Link -->
      <!-- <NuxtLink v-if="newsItem.link" :to="newsItem.link" class="mt-8">
          <UIcon name="i-lucide-external-link" class="w-4 h-4 mr-2" />
          Ver más información
        </NuxtLink> -->
    </article>
  </UContainer>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const route = useRoute()
const id = route.params.id as string

const { data: newsItem, status, error } = await useFetch<NewsRecord>(`/api/news/${id}`)

useHead({
  title: computed(() => newsItem.value?.title ? `${newsItem.value.title} - Pontem` : 'Noticia - Pontem')
})

const { formatDate } = useDateFormatting()

const formattedDate = computed(() => newsItem.value?.published_date ? formatDate(newsItem.value.published_date) : '')

// Normalize nullable API fields to `undefined` to satisfy child component prop types
const headerType = computed(() => newsItem.value?.type ?? undefined)
const headerSubtitle = computed(() => newsItem.value?.subtitle ?? undefined)
const headerAuthor = computed(() => newsItem.value?.author ?? undefined)

const rawContent = computed(() => {
  return newsItem.value?.content ?? ''
})
</script>
