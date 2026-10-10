<template>
  <UHeader title="Pontem Consulting Club" :toggle="{ size: 'xl' }">
    <template #title>
      <img src="/pontemog_optimized_.png" alt="Pontem Consulting Club" class="h-12 w-auto">
    </template>

    <!-- Los enlaces van a la derecha, junto a la cuenta: centrados entre el logo y un
         lado vacío quedaban corridos. -->
    <template #right>
      <UNavigationMenu :items="items" highlight aria-label="Principal" class="hidden lg:flex" />
      <UButton v-if="isAuthenticated" icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" class="hidden lg:flex"
        @click="logout">
        Cerrar sesión
      </UButton>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" highlight aria-label="Principal" class="-mx-2.5" />
      <UButton v-if="isAuthenticated" icon="i-lucide-log-out" color="neutral" variant="ghost" class="mt-4" @click="logout">
        Cerrar sesión
      </UButton>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { navigation } = useNavigation()
const { logout, isAuthenticated } = useAuth()
const { isAdmin } = useProfile()

const items = computed<NavigationMenuItem[]>(() => [
  ...navigation,
  ...(isAuthenticated.value && isAdmin.value ? [{ label: 'Personas', to: '/admin/usuarios' }] : []),
  ...(isAuthenticated.value ? [{ label: 'Mi Perfil', to: '/perfil' }] : [])
])
</script>
