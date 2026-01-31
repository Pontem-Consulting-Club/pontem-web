<script setup lang="ts">
import about from '~/assets/data/about.json'
import type { TeamRecord } from '~/types/content'

useHead({
  title: about.title
})

const history = about.history

const { data: team, status, refresh } = await useFetch<TeamRecord[]>('/api/team', {
  default: () => []
})

const { isAuthenticated } = useAuth()
const isCreating = ref(false)
const draftMember = ref<TeamRecord | null>(null)

const startCreate = () => {
  isCreating.value = true
  draftMember.value = {
    id: 0,
    name: '',
    role: '',
    image_url: null
  }
}

const cancelCreate = () => {
  isCreating.value = false
  draftMember.value = null
}

const handleCreated = () => {
  cancelCreate()
}
</script>

<template>
  <div>
    <PageHeader title="Nosotros" background-image="/Equipo2024.jpeg" />

    <UContainer class="py-16">
      <!-- History Section -->
      <section class="mb-20">
        <SectionHeader title="Nuestra Historia" centered class="mb-12" />

        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-pontemred-400" />
          <div class="space-y-12">
            <TimelineItem v-for="(item, index) in history" :key="item.year" :year="item.year" :title="item.title"
              :description="item.description" :index="index" />
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section>
        <SectionHeader title="Nuestro Equipo" centered class="mb-12" />

        <div v-if="isAuthenticated" class="flex justify-end mb-6">
          <UButton icon="i-lucide-plus" variant="soft" color="primary" size="md" :disabled="isCreating" @click="startCreate">
            Agregar
          </UButton>
        </div>

        <LoadingSpinner v-if="status === 'pending'" />

        <div v-if="isCreating && draftMember" class="mb-6">
          <TeamCard :member="draftMember" :is-new="true" @created="handleCreated" @cancel-create="cancelCreate"
            @updated="refresh" />
        </div>

        <EmptyState v-else-if="!team || team.length === 0" message="No hay integrantes disponibles" />

        <div v-if="team && team.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TeamCard v-for="member in team" :key="member.id" :member="member" @updated="refresh" />
        </div>
      </section>
    </UContainer>
  </div>
</template>
