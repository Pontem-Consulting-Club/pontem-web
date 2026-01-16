<script setup lang="ts">
import type { EventRecord } from '~/types/content'

interface Props {
  event: EventRecord
  variant?: 'full' | 'compact' | 'past'
}

const _props = withDefaults(defineProps<Props>(), {
  variant: 'full'
})

const { formatDate } = useDateFormatting()

const { url: imageUrl } = useStorageImage(_props.event?.image_url ?? null)

const eventDate = computed(() => new Date(_props.event.date))
const dayNumber = computed(() => eventDate.value.getDate())
const monthYear = computed(() => eventDate.value.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }))
</script>

<template>
  <UCard v-if="variant === 'full'"
    class="rounded-3xl bg-white/90 shadow-sm hover:shadow-lg transition-shadow">
    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-32 shrink-0">
        <div class="bg-primary-50 rounded-lg p-4 text-center">
          <span class="block text-3xl font-bold text-primary-600">
            {{ dayNumber }}
          </span>
          <span class="block text-sm text-primary-600">
            {{ monthYear }}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <h3 class="text-xl font-semibold mb-2">
          {{ event.title }}
        </h3>
        <p v-if="event.subtitle" class="mb-3">
          {{ event.subtitle }}
        </p>
        <p v-if="event.description" class="mb-4">
          {{ event.description }}
        </p>
        <div class="flex flex-wrap gap-4 text-sm">
          <span v-if="event.location" class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
            {{ event.location }}
          </span>
          <a v-if="event.link" :href="event.link" target="_blank"
            class="flex items-center gap-2 text-primary-600 hover:underline">
            <UIcon name="i-lucide-external-link" class="w-4 h-4" />
            Ver más
          </a>
        </div>
      </div>
      <div class="md:w-48 shrink-0">
        <NuxtImg :src="imageUrl ?? '/LogoColorSolo.png'" alt="Imagen del evento" class="object-cover rounded-lg h-32 w-full"
          sizes="300px" />
      </div>
    </div>
  </UCard>

  <UCard v-else-if="variant === 'past'" class="rounded-2xl opacity-75 bg-white/90 shadow-sm">
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <span class="text-sm md:w-32">
        {{ formatDate(event.date) }}
      </span>
      <div class="flex-1">
        <h3 class="text-lg font-medium">
          {{ event.title }}
        </h3>
        <p v-if="event.subtitle" class="text-sm">
          {{ event.subtitle }}
        </p>
      </div>
    </div>
  </UCard>

  <div v-else
    class="rounded-3xl bg-white/90 hover:shadow-lg transition-shadow overflow-hidden shadow-sm">
    <div class="bg-linear-to-r from-pontem-500/10 to-aqua-500/10 px-4 py-3">
      <span class="text-sm font-medium text-pontem-500">
        {{ formatDate(event.date) }}
      </span>
    </div>
    <div class="p-6">
      <h3 class="text-xl font-semibold mb-2">
        {{ event.title }}
      </h3>
      <p v-if="event.subtitle" class="mb-4">
        {{ event.subtitle }}
      </p>
      <p v-if="event.location" class="text-sm flex items-center gap-2">
        <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
        {{ event.location }}
      </p>
    </div>
  </div>
</template>
