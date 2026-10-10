<script setup lang="ts">
import about from '~/assets/data/about.json'
import { TEAM_COORDINATIONS, TEAM_COORDINATION_ICONS, TEAM_COORDINATION_LABELS } from '~/constants/teamRoles'
import type { TeamRecord, TeamCoordinationRecord } from '~/types/content'

usePageMeta({
  title: about.title,
  description: 'Quiénes somos: misión, pilares, historia y equipo de Pontem Consulting Club.'
})

const history = about.history

const { data: teamData, error, refresh } = await useFetch<{ members: TeamRecord[], coordinations: TeamCoordinationRecord[] }>('/api/team', {
  default: () => ({ members: [], coordinations: [] })
})

const coordinationMap = computed(() => {
  const map: Record<string, TeamCoordinationRecord> = {}
  for (const coord of teamData.value.coordinations) {
    map[coord.coordination] = coord
  }
  return map
})

const { isEditor } = useProfile()

const isCreating = ref(false)
const draftMember = ref<TeamRecord | null>(null)

// Editar a alguien del equipo. La lista de cada coordinacion solo muestra nombres,
// asi que el formulario se abre arriba de la grilla, donde tambien se crea.
const editingMember = ref<TeamRecord | null>(null)
const editorPanel = ref<HTMLElement | null>(null)

const startCreate = () => {
  editingMember.value = null
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

// Mientras hay un formulario abierto, los nombres y "Agregar" quedan desactivados.
const { anyOpen: editorOpen } = useEditorSlot()

// El nombre que abrió el formulario recibe el foco al cerrarlo.
let editTrigger: HTMLElement | null = null

const startEdit = async (member: TeamRecord, event: MouseEvent) => {
  editTrigger = event.currentTarget as HTMLElement
  cancelCreate()
  editingMember.value = { ...member }
  // El nombre puede quedar lejos del formulario: lo trae a la vista.
  await nextTick()
  editorPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const closeEdit = async () => {
  editingMember.value = null
  await nextTick()
  editTrigger?.focus()
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

  if (isEditor.value) {
    return grouped
  }

  return grouped.filter(group => group.members.length > 0)
})


</script>
 
<template>
  <div>
    <PageBanner title="Nosotros" image="/Equipo2024.jpeg" />
 
    <UContainer class="py-16 space-y-28">

      <AboutMissionVisionSection />

      <AboutPillarsSection />

      <AboutHistorySlider :items="history" />
 
      <!-- ── EQUIPO ────────────────────────────────────────────── -->
      <section>
        <SectionTitle title="Nuestro Equipo" class="mb-12" />
 
        <div v-if="isEditor" class="flex justify-end mb-6">
          <UButton icon="i-lucide-plus" color="primary" size="md" :disabled="editorOpen" @click="startCreate">
            Agregar
          </UButton>
        </div>
 
        <LoadError v-if="error" title="No pudimos cargar el equipo" :retry="refresh" />

        <div v-else-if="isCreating && draftMember" class="mb-6">
          <TeamCard :member="draftMember" :is-new="true" @created="handleCreated" @cancel-create="cancelCreate" @updated="refresh" />
        </div>

        <div v-else-if="editingMember" ref="editorPanel" class="mb-6">
          <TeamCard :key="editingMember.id" :member="editingMember" start-editing @updated="refresh" @closed="closeEdit" />
        </div>
 
        <UEmpty v-else-if="teamByRole.length === 0" title="No hay integrantes disponibles" icon="i-lucide-inbox"/>

        <div v-if="!error && teamByRole.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Foto arriba en celular; desde md, foto a la izquierda y nombres a la derecha.
               Los nombres se ven completos: la tarjeta crece con la lista. -->
          <UCard v-for="dept in teamByRole" :key="dept.key" class="md:min-h-56"
            :ui="{ body: 'flex h-full flex-col p-0 sm:p-0 md:flex-row' }">

            <div class="h-44 shrink-0 md:h-auto md:w-3/5">
              <TeamCoordinationImage
                :image-path="dept.imageUrl"
                :icon="dept.icon"
                :coordination="dept.key"
                @updated="refresh"
              />
            </div>

            <div class="flex min-w-0 flex-1 flex-col p-4">
              <!-- Header -->
              <div class="flex items-center gap-1.5 mb-3 shrink-0">
                <UIcon :name="dept.icon" class="size-4 text-primary-500 shrink-0" />
                <h3 class="text-subheading text-highlighted">{{ dept.label }}</h3>
              </div>

              <!-- Nombres -->
              <div class="flex flex-col gap-1">
                <template v-for="member in dept.members" :key="member.id">
                  <button v-if="isEditor" type="button" :aria-label="`Editar a ${member.name}`"
                    class="group flex min-w-0 items-start gap-1 text-left text-sm/snug text-muted hover:text-primary disabled:pointer-events-none disabled:opacity-60"
                    :disabled="editorOpen" @click="startEdit(member, $event)">
                    <span class="min-w-0 wrap-break-word">{{ member.name }}</span>
                    <UIcon name="i-lucide-pencil" class="size-3 shrink-0 text-dimmed group-hover:text-primary" />
                  </button>
                  <p v-else class="text-sm/snug text-muted wrap-break-word">
                    {{ member.name }}
                  </p>
                </template>
                <p v-if="dept.members.length === 0" class="text-xs text-muted italic">Sin integrantes aún</p>
              </div>

              <!-- Contador abajo -->
              <p class="mt-auto text-xs text-muted shrink-0 pt-2">
                {{ dept.members.length }} {{ dept.members.length === 1 ? 'integrante' : 'integrantes' }}
              </p>
            </div>
          </UCard>
        </div>
      </section>
 
    </UContainer>
  </div>
</template>
