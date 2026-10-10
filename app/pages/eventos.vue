<script setup lang="ts">
import type { EventRecord } from '~/types/content'

usePageMeta({
  title: 'Eventos - Pontem',
  description: 'Charlas, talleres y actividades de Pontem con consultoras y organizaciones. Revisa las próximas fechas e inscríbete.'
})

const { data: events, error, refresh } = await useFetch<EventRecord[]>('/api/events/scheduled', {
  default: () => []
})

const { isEditor } = useProfile()
const isCreating = ref(false)
const draftEvent = ref<EventRecord | null>(null)

const startCreate = () => {
  isCreating.value = true
  draftEvent.value = {
    id: 0,
    title: '',
    subtitle: null,
    description: null,
    date: setClubDay(todayInClub()),
    image_url: null,
    location: null,
    link: null
  }
}

const cancelCreate = () => {
  isCreating.value = false
  draftEvent.value = null
}

const handleCreated = () => {
  cancelCreate()
}

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
    <PageBanner title="Nuestros Eventos" image="/BTGDay.jpeg" />

    <UContainer class="py-16">
      <div v-if="isEditor" class="flex justify-end mb-6">
        <UButton icon="i-lucide-plus" color="primary" size="md" :disabled="isCreating" @click="startCreate">
          Agregar
        </UButton>
      </div>
      <LoadError v-if="error" title="No pudimos cargar los eventos" :retry="refresh" />

      <template v-else>
        <section v-if="isCreating && draftEvent" class="mb-16">
          <SectionTitle class="mb-8" title="Nuevo evento" icon="i-lucide-plus" />
          <div class="space-y-8">
            <EventCard :event="draftEvent" :is-new="true" variant="full" @created="handleCreated"
              @cancel-create="cancelCreate" @updated="refresh" />
          </div>
        </section>

        <!-- Future Events -->
        <section v-if="futureEvents.length > 0" class="mb-16">
          <SectionTitle class="mb-8" title="Próximos Eventos" icon="i-lucide-calendar" />

          <div class="space-y-8">
            <EventCard v-for="event in futureEvents" :key="event.id" :event="event" variant="full" @updated="refresh" />
          </div>
        </section>

        <!-- Past Events -->
        <section v-if="pastEvents.length > 0">
          <SectionTitle class="mb-8" title="Eventos Pasados" icon="i-lucide-history" />

          <div class="space-y-4">
            <EventCard v-for="event in pastEvents" :key="event.id" :event="event" variant="past" @updated="refresh" />
          </div>
        </section>

        <!-- No Events -->
        <UEmpty v-if="futureEvents.length === 0 && pastEvents.length === 0" icon="i-lucide-calendar-x"
          title="No hay eventos disponibles" />
      </template>
    </UContainer>
  </div>
</template>
