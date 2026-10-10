<template>
  <UPageSection title="Próximos Eventos" description="No te pierdas nuestros próximos eventos y actividades"
    class="bg-accented/60 clip-wave-top">
    <LoadError v-if="error" title="No pudimos cargar los eventos" :retry="refresh" />

    <UEmpty v-else-if="upcomingEvents.length === 0" title="No hay eventos próximos programados" icon="i-lucide-inbox"/>

    <UPageGrid v-else>
      <EventCard v-for="event in upcomingEvents" :key="event.id" :event="event" variant="compact"
        @updated="refresh" />
    </UPageGrid>


    <div class="mt-10 text-center">
      <UButton to="/eventos" size="lg" color="neutral" variant="outline">
        Ver todos los eventos
      </UButton>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
import type { EventRecord } from '~/types/content'

const { data: events, error, refresh } = await useFetch<EventRecord[]>('/api/events/scheduled', {
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
