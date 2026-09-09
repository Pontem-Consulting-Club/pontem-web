<template>
  <div>
    <UContainer class="py-24 pt-32">
      <NotFoundState v-if="error" message="No encontramos ese perfil" />

      <article v-else-if="member" class="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <div class="h-36 w-36 overflow-hidden rounded-full bg-gray-100">
          <img v-if="avatarUrl" :src="avatarUrl" :alt="member.display_name ?? 'Foto de perfil'"
            class="h-full w-full object-cover">
          <div v-else class="flex h-full w-full items-center justify-center text-4xl font-semibold text-gray-400">
            {{ initials }}
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold">{{ member.display_name }}</h1>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <UBadge v-if="member.coordination" variant="subtle" size="lg">
              {{ coordinationLabels[member.coordination] }}
            </UBadge>
            <UBadge v-if="member.generation" variant="subtle" color="neutral" size="lg">
              Generación {{ member.generation }}
            </UBadge>
          </div>
        </div>

        <p v-if="member.bio" class="text-balance leading-relaxed text-gray-600">
          {{ member.bio }}
        </p>

        <UButton to="/nosotros" variant="soft" icon="i-lucide-arrow-left" class="mt-4">
          Conoce al equipo
        </UButton>
      </article>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { TEAM_COORDINATION_LABELS } from '~/constants/teamRoles'
import type { Database } from '~/types/database.types'

type PublicProfile = Database['public']['Views']['public_profiles']['Row']

const route = useRoute()
const handle = computed(() => String(route.params.handle ?? '').toLowerCase())
const coordinationLabels = TEAM_COORDINATION_LABELS

const { data: member, error } = await useFetch<PublicProfile>(() => `/api/members/${handle.value}`)

const { url: avatarUrl } = useStorageImage(computed(() => member.value?.avatar_path ?? null))

const initials = computed(() => (member.value?.display_name ?? '')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(word => word[0]?.toUpperCase() ?? '')
  .join(''))

useHead(() => ({
  title: member.value
    ? `${member.value.display_name} - Pontem`
    : 'Perfil - Pontem'
}))
</script>
