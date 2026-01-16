<script setup lang="ts">
import type { EventRecord } from '~/types/content'

interface Props {
  event: EventRecord
  onDelete: (id: number) => void
  onEdit: (event: EventRecord) => void
}

const props = defineProps<Props>()
const { formatDate } = useDateFormatting()

const isUpcoming = computed(() => new Date(props.event.date) >= new Date())
</script>

<template>
  <AdminListItem :id="event.id" :on-delete="onDelete" :on-edit="() => onEdit(event)">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-sm">
        {{ formatDate(event.date) }}
      </span>
      <span v-if="isUpcoming"
        class="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 font-semibold">
        Próximo
      </span>
    </div>
    <h3 class="text-lg font-semibold">
      {{ event.title }}
    </h3>
    <p v-if="event.subtitle" class="text-sm">
      {{ event.subtitle }}
    </p>
    <p v-if="event.location" class="text-sm mt-1 flex items-center gap-1">
      <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
      {{ event.location }}
    </p>
  </AdminListItem>
</template>
