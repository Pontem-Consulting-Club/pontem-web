<script setup lang="ts">
import type { EventRecord } from '~/types/content'

useHead({
  title: 'Eventos - Pontem'
})

const { data: events, status, refresh } = await useFetch<EventRecord[]>('/api/events/scheduled', {
  default: () => []
})

const today = new Date()

const futureEvents = computed(() => {
  return (events.value || [])
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const pastEvents = computed(() => {
  return (events.value || [])
    .filter(event => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})


</script>

<template>
  <div>
    <PageHeader title="Nuestros Eventos" background-image="/BTGDay.jpeg" />

    <UContainer class="py-16">
      <LoadingSpinner v-if="status === 'pending'" />

      <template v-else>
        <!-- Future Events -->
        <section v-if="futureEvents.length > 0" class="mb-16">
          <SectionHeaderWithIcon title="Próximos Eventos" icon="i-lucide-calendar" icon-color="text-primary-600" />

          <div class="space-y-8">
            <EventCard v-for="event in futureEvents" :key="event.id" :event="event" variant="full" @updated="refresh" />
          </div>
        </section>

        <!-- Past Events -->
        <section v-if="pastEvents.length > 0">
          <SectionHeaderWithIcon title="Eventos Pasados" icon="i-lucide-history" icon-color="" />

          <div class="space-y-4">
            <EventCard v-for="event in pastEvents" :key="event.id" :event="event" variant="past" @updated="refresh" />
          </div>
        </section>

        <!-- No Events -->
        <EmptyState v-if="futureEvents.length === 0 && pastEvents.length === 0" icon="i-lucide-calendar-x"
          message="No hay eventos disponibles" />
      </template>
    </UContainer>
  </div>
</template>
