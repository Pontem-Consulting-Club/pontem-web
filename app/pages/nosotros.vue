<script setup lang="ts">
import about from '~/assets/data/about.json'
import type { TeamRecord } from '~/types/content'
import { TEAM_ROLES } from '~/constants/teamRoles'

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

const membersByRole = computed(() => {
  const map = new Map<string, TeamRecord[]>()
  for (const role of TEAM_ROLES) {
    map.set(role, [])
  }
  for (const member of (team.value ?? [])) {
    const bucket = map.get(member.role)
    if (bucket) {
      bucket.push(member)
    } else {
      // Members with legacy/unknown roles are grouped under their own role name
      if (!map.has(member.role)) map.set(member.role, [])
      map.get(member.role)!.push(member)
    }
  }
  // Admins see all role categories (even empty ones) so they know which roles exist.
  // Regular visitors only see categories that have at least one member.
  return Array.from(map.entries()).filter(([, members]) => isAuthenticated.value || members.length > 0)
})
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

        <div v-if="team && team.length > 0" class="space-y-12">
          <div v-for="[role, members] in membersByRole" :key="role">
            <h3 class="text-xl font-semibold text-primary mb-6 border-b border-gray-200 pb-2">
              {{ role }}
            </h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TeamCard v-for="member in members" :key="member.id" :member="member" @updated="refresh" />
            </div>
          </div>
        </div>
      </section>
    </UContainer>
  </div>
</template>
