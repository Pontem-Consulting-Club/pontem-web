<template>
  <div>
    <PageHeader title="Personas" background-image="/Equipo2024.jpeg" />

    <UContainer class="py-16">
      <!-- Invitar -->
      <UCard variant="soft" class="mb-10 bg-white rounded-lg shadow-sm">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user-plus" class="text-primary-600" />
            <h2 class="font-semibold">Invitar a alguien</h2>
          </div>
        </template>

        <UForm :state="invite" class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px_auto] sm:items-end"
          @submit.prevent="sendInvite">
          <UFormField label="Correo" required>
            <UInput v-model="invite.email" type="email" placeholder="nombre@ejemplo.cl" class="w-full" />
          </UFormField>
          <UFormField label="Rol inicial">
            <USelectMenu v-model="invite.role" :items="roleOptions" value-key="value" label-key="label"
              class="w-full" />
          </UFormField>
          <UButton type="submit" size="lg" :loading="isInviting">Enviar</UButton>
        </UForm>

        <p class="mt-3 text-xs text-gray-500">
          Recibe un correo para elegir su clave. Pontem nunca ve ni guarda contraseñas.
        </p>

        <UAlert v-if="inviteError" color="error" icon="i-lucide-alert-circle" :description="inviteError" class="mt-4" />
        <UAlert v-if="inviteMessage" color="success" icon="i-lucide-check" :description="inviteMessage" class="mt-4" />
      </UCard>

      <!-- Directorio -->
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar por nombre o correo" class="max-w-xs" />
        <USelectMenu v-model="roleFilter" :items="roleFilterOptions" value-key="value" label-key="label"
          class="w-44" />
        <span class="ml-auto text-sm text-gray-500">{{ filtered.length }} de {{ users.length }}</span>
      </div>

      <LoadingSpinner v-if="status === 'pending'" />

      <div v-else-if="filtered.length === 0">
        <EmptyState icon="i-lucide-users" message="No hay personas que coincidan" />
      </div>

      <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3 font-medium">Persona</th>
              <th class="px-4 py-3 font-medium">Coordinación</th>
              <th class="px-4 py-3 font-medium">Rol</th>
              <th class="px-4 py-3 font-medium">Estado</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="person in filtered" :key="person.id" class="align-middle">
              <td class="px-4 py-3">
                <div class="font-medium">{{ person.display_name || '—' }}</div>
                <div class="text-xs text-gray-500">{{ person.email }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600">
                {{ person.coordination ? coordinationLabels[person.coordination] : '—' }}
              </td>
              <td class="px-4 py-3">
                <USelectMenu :model-value="person.role" :items="roleOptions" value-key="value" label-key="label"
                  size="sm" class="w-40" :disabled="busyId === person.id"
                  @update:model-value="(role: string) => updateUser(person, { role })" />
              </td>
              <td class="px-4 py-3">
                <UBadge :color="stateColor(person.state)" variant="subtle" size="sm">
                  {{ stateLabels[person.state] }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-right">
                <UButton v-if="person.state === 'inactive'" size="xs" variant="soft" icon="i-lucide-rotate-ccw"
                  :loading="busyId === person.id" @click="updateUser(person, { state: 'active' })">
                  Reactivar
                </UButton>
                <UButton v-else size="xs" variant="soft" color="error" icon="i-lucide-user-minus"
                  :loading="busyId === person.id" @click="updateUser(person, { state: 'inactive' })">
                  Desactivar
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UAlert v-if="tableError" color="error" icon="i-lucide-alert-circle" :description="tableError" class="mt-4" />

      <p class="mt-6 text-xs text-gray-500">
        Desactivar conserva el historial de la persona y quita sus permisos de inmediato. No se puede desactivar ni
        degradar a la última cuenta administradora activa.
      </p>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { TEAM_COORDINATION_LABELS } from '~/constants/teamRoles'
import { ROLE_LABELS, PROFILE_STATE_LABELS, USER_ROLES, type UserRole, type ProfileState } from '~~/shared/authz'
import type { Profile } from '~/composables/useProfile'

type DirectoryEntry = Profile & { email: string | null; last_sign_in_at: string | null }

definePageMeta({ middleware: 'admin' })

useHead({
  title: 'Personas - Pontem',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const coordinationLabels = TEAM_COORDINATION_LABELS
const stateLabels = PROFILE_STATE_LABELS

const roleOptions = USER_ROLES.map(role => ({ label: ROLE_LABELS[role], value: role }))
const roleFilterOptions = [{ label: 'Todos los roles', value: 'all' }, ...roleOptions]

const { data: users, status, refresh } = await useFetch<DirectoryEntry[]>('/api/admin/users', {
  default: () => []
})

const search = ref('')
const roleFilter = ref<'all' | UserRole>('all')
const busyId = ref<string | null>(null)
const tableError = ref('')

const filtered = computed(() => {
  const needle = search.value.trim().toLowerCase()
  return users.value.filter((person) => {
    if (roleFilter.value !== 'all' && person.role !== roleFilter.value) return false
    if (!needle) return true
    return `${person.display_name} ${person.email ?? ''}`.toLowerCase().includes(needle)
  })
})

const stateColor = (state: ProfileState) => {
  if (state === 'active') return 'success' as const
  if (state === 'invited') return 'warning' as const
  return 'neutral' as const
}

const updateUser = async (person: DirectoryEntry, changes: { role?: string; state?: string }) => {
  if (changes.role && changes.role === person.role) return

  tableError.value = ''
  busyId.value = person.id

  try {
    await $fetch(`/api/admin/users/${person.id}`, { method: 'PUT', body: changes })
    await refresh()
  } catch (e) {
    tableError.value = resolveErrorMessage(e, 'No pudimos guardar el cambio.')
    // Devuelve la tabla al estado real del servidor tras un rechazo.
    await refresh()
  } finally {
    busyId.value = null
  }
}

const invite = reactive({ email: '', role: 'member' as UserRole })
const isInviting = ref(false)
const inviteError = ref('')
const inviteMessage = ref('')

const sendInvite = async () => {
  inviteError.value = ''
  inviteMessage.value = ''
  isInviting.value = true

  try {
    await $fetch('/api/admin/users/invite', { method: 'POST', body: { ...invite } })
    inviteMessage.value = `Invitación enviada a ${invite.email}.`
    invite.email = ''
    invite.role = 'member'
    await refresh()
  } catch (e) {
    inviteError.value = resolveErrorMessage(e, 'No pudimos enviar la invitación.')
  } finally {
    isInviting.value = false
  }
}

const resolveErrorMessage = (e: unknown, fallback: string) => {
  const candidate = e as { statusMessage?: string; data?: { statusMessage?: string; message?: string } }
  return candidate?.data?.statusMessage || candidate?.statusMessage || candidate?.data?.message || fallback
}
</script>
