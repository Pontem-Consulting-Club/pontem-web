<script setup lang="ts">
import type { EventRecord } from '~/types/content'

useHead({
  title: 'Eventos - Pontem'
})

const { data: events, status, refresh } = await useFetch<EventRecord[]>('/api/events/scheduled', {
  default: () => []
})

const { isAuthenticated } = useAuth()
const isCreating = ref(false)
const draftEvent = ref<EventRecord | null>(null)

const startCreate = () => {
  isCreating.value = true
  draftEvent.value = {
    id: 0,
    title: '',
    subtitle: null,
    description: null,
    date: new Date().toISOString().slice(0, 10),
    image_url: null,
    location: null,
    link: null
  }
}

const cancelCreate = () => {
  isCreating.value = false
  draftEvent.value = null
}

const handleCreated = async () => {
  await refresh()
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
    <PageHeader title="Nuestros Eventos" background-image="/BTGDay.jpeg" />

    <UContainer class="py-16">
      <div v-if="isAuthenticated" class="flex justify-end mb-6">
        <UButton icon="i-lucide-plus" color="primary" size="sm" :disabled="isCreating" @click="startCreate">
          Agregar
        </UButton>
      </div>
      <LoadingSpinner v-if="status === 'pending'" />

      <template v-else>
        <section v-if="isCreating && draftEvent" class="mb-16">
          <SectionHeaderWithIcon title="Nuevo evento" icon="i-lucide-plus" icon-color="text-primary-600" />
          <div class="space-y-8">
            <EventCard :event="draftEvent" :is-new="true" variant="full" @created="handleCreated"
              @cancel-create="cancelCreate" @updated="refresh" />
          </div>
        </section>

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
