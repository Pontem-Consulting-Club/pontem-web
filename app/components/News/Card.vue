<template>
  <UCard variant="soft"
    class="flex flex-col rounded-xl bg-white/90 shadow-sm hover:shadow-lg transition-shadow relative">
    <NuxtImg v-if="imageUrl" :src="imageUrl" alt="Cover Image" class="rounded-lg h-50 w-full object-cover"
      sizes="500px" />

    <div class="my-4">
      <TypeBadge v-if="newsItem.type" :type="newsItem.type" size="xs" />
    </div>

    <div class="text-xl font-semibold mb-2">
      {{ newsItem.title }}
    </div>

    <div v-if="newsItem.subtitle" class="mb-4 flex-1 text-gray-600">
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
      <UButton :to="`/noticias/${newsItem.id}`" variant="soft" size="lg"
        class="transition-colors duration-300 rounded-lg">
        Leer más
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

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