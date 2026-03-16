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

const departmentOrder = [
  'directores',
  'comunicaciones & marketing',
  'consultoría social',
  'finanzas',
  'gestión de personas',
  'learning & development',
  'relaciones externas',
  'tecnologías de la información',
]

const departmentLabels: Record<string, string> = {
  'directores': 'Directores',
  'comunicaciones & marketing': 'Comunicaciones & Marketing',
  'consultoría social': 'Consultoría Social',
  'finanzas': 'Finanzas',
  'gestión de personas': 'Gestión de Personas',
  'learning & development': 'Learning & Development',
  'relaciones externas': 'Relaciones Externas',
  'tecnologías de la información': 'Tecnologías de la Información',
}

const departmentIcons: Record<string, string> = {
  'directores': 'i-lucide-crown',
  'comunicaciones & marketing': 'i-lucide-megaphone',
  'consultoría social': 'i-lucide-heart-handshake',
  'finanzas': 'i-lucide-bar-chart-2',
  'gestión de personas': 'i-lucide-users',
  'learning & development': 'i-lucide-graduation-cap',
  'relaciones externas': 'i-lucide-globe',
  'tecnologías de la información': 'i-lucide-cpu',
}

const teamByDepartment = computed(() => {
  if (!team.value) return []
  const groups: Record<string, TeamRecord[]> = {}
 
  for (const member of team.value) {
    //Normalize department from role field — expected format: "Título | Departamento"
    const parts = member.role?.split('|')
    const raw = parts[1]
    const dept = raw ? raw.trim().toLowerCase() : 'directores'
 
    if (!groups[dept]) groups[dept] = []
    groups[dept].push(member)
  }
 
  return departmentOrder
    .filter(dept => groups[dept] && groups[dept].length > 0)
    .map(dept => ({
      key: dept,
      label: departmentLabels[dept] ?? dept,
      icon: departmentIcons[dept] ?? 'i-lucide-users',
      members: groups[dept]!,
    }))
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
 
        <EmptyState v-else-if="!team || team.length === 0" message="No hay integrantes disponibles" />
 
        <div v-if="team && team.length > 0" class="space-y-16">
          <div v-for="dept in teamByDepartment" :key="dept.key">
            <!-- Department header -->
            <div class="flex items-center gap-4 mb-8">
              <div class="w-9 h-9 rounded-xl bg-pontemred-100 flex items-center justify-center shrink-0">
                <UIcon :name="dept.icon" class="w-5 h-5 text-pontemred-500" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">{{ dept.label }}</h3>
              <div class="flex-1 h-px bg-gray-100" />
              <span class="text-sm text-gray-400 font-medium">{{ dept.members.length }} {{ dept.members.length === 1 ? 'integrante' : 'integrantes' }}</span>
            </div>
 
            <!-- Members grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <TeamCard v-for="member in dept.members" :key="member.id" :member="member" @updated="refresh" />
            </div>
          </div>
        </div>
      </section>
 
    </UContainer>
  </div>
</template>
