<template>
  <UCard variant="item" class="relative flex flex-col" :ui="{ body: 'flex flex-1 flex-col' }">
    <template v-if="imageUrl" #header>
      <NuxtImg :src="imageUrl" :alt="newsItem.title" class="h-48 w-full object-cover" sizes="500px" />
    </template>

    <div class="mb-4">
      <UBadge v-if="newsItem.type" :color="getTypeBadgeColor(newsItem.type)" :label="newsItem.type" />
    </div>

    <h3 class="mb-2 text-subheading text-highlighted">
      {{ newsItem.title }}
    </h3>

    <div v-if="newsItem.subtitle" class="mb-4 flex-1 text-toned">
      {{ newsItem.subtitle }}
    </div>

    <div class="flex items-center justify-between text-sm mb-4 gap-2">
      <div class="flex-1">
        <span v-if="newsItem.author">Por <strong>{{ newsItem.author }}</strong></span>
      </div>
      <div class="shrink-0">
        <span>{{ calculateTimeAgo(newsItem.published_date) }}</span>
      </div>
    </div>

    <div class="mt-auto">
      <UButton :to="`/noticias/${newsItem.id}`" size="lg" :aria-label="`Leer más sobre ${newsItem.title}`"
        class="transition-colors duration-300 rounded-lg">
        Leer más
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const { getTypeBadgeColor } = useNewsTypeColor()

interface Props {
  newsItem: NewsRecord
  variant?: 'card' | 'list'
}

const _props = withDefaults(defineProps<Props>(), {
  variant: 'card'
})

const { calculateTimeAgo } = useTimeAgo()

const { url: imageUrl } = useStorageImage(_props.newsItem?.image_url ?? null)

</script>