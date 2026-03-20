<template>
  <section class="py-16 md:py-24 bg-gray-500/10  clip-path-[ellipse(150%_70%_at_40%_70%)]">
    <div class="w-full px-4 lg:w-3/5 mx-auto lg:mt-12">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Próximos Eventos
        </h2>
        <p class="text-lg">
          No te pierdas nuestros próximos eventos y actividades
        </p>
      </div>

      <LoadingSpinner v-if="status === 'pending'" />

      <EmptyState v-else-if="upcomingEvents.length === 0" message="No hay eventos próximos programados" />

      <div v-else class="grid md:grid-cols-3 gap-6">
        <EventCard v-for="event in upcomingEvents" :key="event.id" :event="event" variant="compact"
          @updated="refresh" />
      </div>

      <div class="text-center mt-10">
        <UButton to="/eventos" size="lg" variant="soft"
          class="font-semibold transition-colors bg-white text-gray-500 hover:bg-white hover:outline">
          Ver todos los eventos
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventRecord } from '~/types/content'

const { data: events, status, refresh } = await useFetch<EventRecord[]>('/api/events/scheduled', {
  default: () => []
})

const upcomingEvents = computed(() => {
  const today = new Date()
  return (events.value || [])
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
})
</script>
