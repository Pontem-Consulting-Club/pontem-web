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

const { calculateTimeAgo } = useTimeAgo()

// get image URL from Supabase Storage (or use absolute/root paths directly)
const { url: imageUrl } = useStorageImage(_props.newsItem?.image_url ?? null)
</script>

<template>
  <UCard variant="soft"
    class="flex flex-col rounded-xl bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
    <NuxtImg
      v-if="imageUrl"
      :src="imageUrl"
      alt="Cover Image"
      class="rounded-t-xl h-48 w-full object-cover"
      sizes="500px"
    />
    <NuxtImg
      v-else
      src="/default-news-image.jpg"
      alt="Cover Image"
      class="rounded-t-xl h-48 w-full object-cover"
      sizes="500px"
    />
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
</template>
