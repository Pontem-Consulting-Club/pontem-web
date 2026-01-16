<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

interface Props {
  newsItem: NewsRecord
  onDelete: (id: number) => void
  onEdit: (newsItem: NewsRecord) => void
}

const _props = defineProps<Props>()
const { formatDate } = useDateFormatting()
</script>

<template>
  <AdminListItem :id="newsItem.id" :on-delete="onDelete" :on-edit="() => onEdit(newsItem)">
    <div class="flex items-center gap-2 mb-2">
      <TypeBadge v-if="newsItem.type" :type="newsItem.type" size="xs" />
      <span class="text-sm">
        {{ formatDate(newsItem.published_date) }}
      </span>
    </div>
    <h3 class="text-lg font-semibold">
      {{ newsItem.title }}
    </h3>
    <p v-if="newsItem.subtitle" class="text-sm">
      {{ newsItem.subtitle }}
    </p>
    <p v-if="newsItem.author" class="text-sm mt-1">
      Por {{ newsItem.author }}
    </p>
  </AdminListItem>
</template>
