<template>
  <div>
    <PageHeader title="Mi Perfil" background-image="/LugarEstudio.jpg" />

    <UContainer class="py-16">
      <UAlert v-if="needsOnboarding" icon="i-lucide-hand" color="primary" variant="soft" class="mb-8"
        title="Completa tu perfil"
        description="Tu cuenta queda activa cuando guardes estos datos por primera vez." />

      <div v-if="!profile" class="flex justify-center">
        <LoadingSpinner />
      </div>

      <div v-else class="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <!-- Identidad -->
        <aside class="flex flex-col gap-4">
          <div class="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-gray-100">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="form.display_name || 'Foto de perfil'"
              class="h-full w-full object-cover">
            <div v-else class="flex h-full w-full items-center justify-center text-4xl font-semibold text-gray-400">
              {{ initials }}
            </div>
          </div>

          <UFileUpload :model-value="null" accept="image/jpeg,image/png,image/webp,image/avif" :preview="false"
            :interactive="false" :disabled="isUploading"
            :ui="{ files: 'hidden', label: 'hidden', description: 'hidden' }" @update:model-value="uploadAvatar">
            <template #default="{ open }">
              <UButton block variant="soft" icon="i-lucide-camera" :loading="isUploading" @click="open()">
                {{ profile.avatar_path ? 'Cambiar foto' : 'Subir foto' }}
              </UButton>
            </template>
          </UFileUpload>

          <dl class="rounded-lg border border-gray-200 divide-y divide-gray-200 text-sm">
            <div class="flex items-center justify-between px-4 py-3">
              <dt class="text-gray-500">Rol</dt>
              <dd class="font-medium">{{ roleLabel }}</dd>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <dt class="text-gray-500">Estado</dt>
              <dd class="font-medium">{{ stateLabel }}</dd>
            </div>
            <div v-if="profile.handle" class="flex items-center justify-between gap-2 px-4 py-3">
              <dt class="text-gray-500">Enlace</dt>
              <dd class="truncate font-mono text-xs">
                <NuxtLink v-if="profile.is_public" :to="`/miembros/${profile.handle}`" class="text-primary-600">
                  /miembros/{{ profile.handle }}
                </NuxtLink>
                <span v-else class="text-gray-400">/miembros/{{ profile.handle }}</span>
              </dd>
            </div>
          </dl>

          <p class="px-1 text-xs text-gray-500">
            El rol y el estado los administra la coordinación. Tu enlace público se genera a partir de tu nombre.
          </p>
        </aside>

        <!-- Datos editables -->
        <UCard variant="soft" class="bg-white rounded-lg shadow-sm">
          <UForm :state="form" class="flex flex-col gap-5" @submit.prevent="save">
            <UFormField label="Nombre para mostrar" required>
              <UInput v-model="form.display_name" size="lg" class="w-full" placeholder="Cómo quieres que te vean" />
            </UFormField>

            <UFormField label="Biografía"
              description="Se muestra en tu perfil público, si decides publicarlo.">
              <UTextarea v-model="form.bio" :rows="4" autoresize class="w-full"
                placeholder="En qué estás, qué te interesa" />
            </UFormField>

            <div class="grid gap-5 sm:grid-cols-2">
              <UFormField label="Coordinación">
                <USelectMenu v-model="form.coordination" :items="coordinationOptions" value-key="value"
                  label-key="label" class="w-full" placeholder="Sin coordinación" />
              </UFormField>

              <UFormField label="Generación" description="El año en que entraste al club.">
                <UInput v-model="form.generation" type="number" min="1990" max="2100" class="w-full"
                  placeholder="2024" />
              </UFormField>
            </div>

            <USeparator />

            <UFormField>
              <UCheckbox v-model="form.is_public" label="Publicar mi perfil"
                description="Muestra tu nombre, foto, coordinación y biografía en una página que puedes compartir. Tu correo, tus estadísticas y tu progreso no se publican nunca." />
            </UFormField>

            <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :description="error" />
            <UAlert v-if="savedMessage" color="success" icon="i-lucide-check" :description="savedMessage" />

            <div class="flex justify-end">
              <UButton type="submit" size="lg" :loading="isSaving">Guardar</UButton>
            </div>
          </UForm>
        </UCard>

        <!-- MEM-5: números pequeños y honestos, no una capa de gamificación. -->
        <section class="lg:col-span-2">
          <SectionHeaderWithIcon title="Mi participación" icon="i-lucide-calendar-check"
            icon-color="text-primary-600" />

          <div class="mb-6 grid gap-4 sm:grid-cols-3">
            <div v-for="tile in statTiles" :key="tile.label"
              class="rounded-lg border border-gray-200 bg-white px-5 py-4">
              <div class="text-3xl font-semibold tabular-nums">{{ tile.value }}</div>
              <div class="text-sm text-gray-500">{{ tile.label }}</div>
            </div>
          </div>

          <div v-if="registrations.length === 0">
            <EmptyState icon="i-lucide-calendar-x"
              message="Todavía no te has inscrito en ninguna actividad" />
          </div>

          <ul v-else class="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            <li v-for="row in registrations" :key="row.id"
              class="flex flex-wrap items-center gap-3 px-5 py-3">
              <div class="flex-1">
                <div class="font-medium">{{ row.event?.title ?? 'Actividad' }}</div>
                <div class="text-xs text-gray-500">
                  {{ row.event?.date ? formatDate(row.event.date) : 'Sin fecha' }}
                  <span v-if="row.event?.location"> · {{ row.event.location }}</span>
                </div>
              </div>
              <UBadge v-if="row.attended" color="success" variant="subtle" size="sm">Asististe</UBadge>
              <UBadge v-else-if="row.status === 'cancelled'" color="neutral" variant="subtle" size="sm">
                Cancelada
              </UBadge>
              <UBadge v-else color="primary" variant="subtle" size="sm">Inscrito</UBadge>
            </li>
          </ul>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { TEAM_COORDINATION_OPTIONS } from '~/constants/teamRoles'
import { ROLE_LABELS, PROFILE_STATE_LABELS } from '~~/shared/authz'
import type { Profile } from '~/composables/useProfile'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'Mi Perfil - Pontem',
  // FR-29: el perfil no se indexa, sea cual sea el entorno.
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const { profile, refresh, needsOnboarding } = useProfile()
const { registrations, stats } = useMyRegistrations()
const { formatDate } = useDateFormatting()

const statTiles = computed(() => [
  { label: 'Inscripciones vigentes', value: stats.value?.registered ?? 0 },
  { label: 'Actividades asistidas', value: stats.value?.attended ?? 0 },
  { label: 'Próximas', value: stats.value?.upcoming ?? 0 }
])
const coordinationOptions = TEAM_COORDINATION_OPTIONS

const form = reactive({
  display_name: '',
  bio: '' as string | null,
  coordination: null as string | null,
  generation: null as number | null,
  is_public: false
})

const isSaving = ref(false)
const isUploading = ref(false)
const error = ref('')
const savedMessage = ref('')

watch(profile, (value) => {
  if (!value) return
  form.display_name = value.display_name
  form.bio = value.bio
  form.coordination = value.coordination
  form.generation = value.generation
  form.is_public = value.is_public
}, { immediate: true })

const { url: avatarUrl } = useStorageImage(computed(() => profile.value?.avatar_path ?? null))

const roleLabel = computed(() => profile.value ? ROLE_LABELS[profile.value.role] : '')
const stateLabel = computed(() => profile.value ? PROFILE_STATE_LABELS[profile.value.state] : '')

const initials = computed(() => {
  const source = form.display_name || profile.value?.display_name || ''
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('')
})

const save = async () => {
  error.value = ''
  savedMessage.value = ''

  if (!form.display_name.trim()) {
    error.value = 'El nombre para mostrar es obligatorio.'
    return
  }

  if (form.is_public && !form.bio?.trim()) {
    error.value = 'Escribe una biografía antes de publicar tu perfil.'
    return
  }

  isSaving.value = true
  try {
    await $fetch<Profile>('/api/profile', { method: 'PUT', body: { ...form } })
    await refresh()
    savedMessage.value = 'Perfil guardado.'
  } catch (e) {
    error.value = resolveErrorMessage(e, 'No pudimos guardar tu perfil.')
  } finally {
    isSaving.value = false
  }
}

const uploadAvatar = async (file: File | File[] | null) => {
  const picked = Array.isArray(file) ? file[0] : file
  if (!picked) return

  error.value = ''
  savedMessage.value = ''
  isUploading.value = true

  try {
    const body = new FormData()
    body.append('avatar', picked)
    await $fetch('/api/profile/avatar', { method: 'POST', body })
    await refresh()
    savedMessage.value = 'Foto actualizada.'
  } catch (e) {
    error.value = resolveErrorMessage(e, 'No pudimos subir la foto.')
  } finally {
    isUploading.value = false
  }
}

const resolveErrorMessage = (e: unknown, fallback: string) => {
  const candidate = e as { statusMessage?: string; data?: { statusMessage?: string; message?: string } }
  return candidate?.data?.statusMessage || candidate?.statusMessage || candidate?.data?.message || fallback
}
</script>
