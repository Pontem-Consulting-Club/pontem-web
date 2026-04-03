<script setup lang="ts">
import about from '~/assets/data/about.json'
import { TEAM_COORDINATIONS, TEAM_COORDINATION_ICONS, TEAM_COORDINATION_LABELS } from '~/constants/teamRoles'
import type { TeamRecord, TeamCoordinationRecord } from '~/types/content'

useHead({
  title: about.title
})

const history = about.history

const { data: teamData, status, refresh } = await useFetch<{ members: TeamRecord[], coordinations: TeamCoordinationRecord[] }>('/api/team', {
  default: () => ({ members: [], coordinations: [] })
})

const coordinationMap = computed(() => {
  const map: Record<string, TeamCoordinationRecord> = {}
  for (const coord of teamData.value.coordinations) {
    map[coord.coordination] = coord
  }
  return map
})

const { isAuthenticated } = useAuth()

const isCreating = ref(false)
const draftMember = ref<TeamRecord | null>(null)

const startCreate = () => {
  isCreating.value = true
  draftMember.value = {
    id: 0,
    name: '',
    coordination: TEAM_COORDINATIONS[0]!
  }
}

const cancelCreate = () => {
  isCreating.value = false
  draftMember.value = null
}

const handleCreated = () => {
  cancelCreate()
}

const teamByRole = computed(() => {
  const members = teamData.value.members ?? []
  const grouped = TEAM_COORDINATIONS.map((coordination) => ({
    key: coordination,
    label: TEAM_COORDINATION_LABELS[coordination],
    icon: TEAM_COORDINATION_ICONS[coordination] ?? 'i-lucide-users',
    imageUrl: coordinationMap.value[coordination]?.image_url ?? null,
    members: members.filter(member => member.coordination === coordination)
  }))

  if (isAuthenticated.value) {
    return grouped
  }

  return grouped.filter(group => group.members.length > 0)
})


</script>
 
<template>
  <div>
    <PageHeader title="Nosotros" background-image="/Equipo2024.jpeg" />
 
    <UContainer class="py-16 space-y-28">

      <AboutMissionVisionSection />

      <AboutPillarsSection />

      <AboutHistorySlider :items="history" />
 
      <!-- ── EQUIPO ────────────────────────────────────────────── -->
      <section>
        <SectionHeader title="Nuestro Equipo" centered class="mb-12" />
 
        <div v-if="isAuthenticated" class="flex justify-end mb-6">
          <UButton icon="i-lucide-plus" variant="soft" color="primary" size="md" :disabled="isCreating" @click="startCreate">
            Agregar
          </UButton>
        </div>
 
        <LoadingSpinner v-if="status === 'pending'" />
 
        <div v-if="isCreating && draftMember" class="mb-6">
          <TeamCard :member="draftMember" :is-new="true" @created="handleCreated" @cancel-create="cancelCreate" @updated="refresh" />
        </div>
 
        <EmptyState v-else-if="teamByRole.length === 0" message="No hay integrantes disponibles" />

        <div v-if="teamByRole.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="dept in teamByRole" :key="dept.key"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex h-56">

            <!-- Imagen: 75% -->
            <div class="w-3/4 shrink-0">
              <TeamCoordinationImage
                :image-path="dept.imageUrl"
                :icon="dept.icon"
                :coordination="dept.key"
                @updated="refresh"
              />
            </div>

            <!-- Panel derecho: 25% -->
            <div class="w-1/4 flex flex-col p-4 overflow-hidden">
              <!-- Header -->
              <div class="flex items-center gap-1.5 mb-3 shrink-0">
                <UIcon :name="dept.icon" class="w-3.5 h-3.5 text-pontemred-500 shrink-0" />
                <h3 class="font-bold text-gray-900 text-sm leading-tight">{{ dept.label }}</h3>
              </div>

              <!-- Nombres -->
              <div class="flex flex-col gap-1 overflow-hidden">
                <p v-for="member in dept.members" :key="member.id"
                  class="text-xs text-gray-400 leading-snug truncate">
                  {{ member.name }}
                </p>
                <p v-if="dept.members.length === 0" class="text-xs text-gray-400 italic">Sin integrantes aún</p>
              </div>

              <!-- Contador abajo -->
              <p class="mt-auto text-xs text-gray-300 shrink-0 pt-2">
                {{ dept.members.length }} {{ dept.members.length === 1 ? 'integrante' : 'integrantes' }}
              </p>
            </div>
          </div>
        </div>
      </section>
 
    </UContainer>
  </div>
</template>
