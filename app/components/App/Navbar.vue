<template>
  <UHeader title="Pontem Consulting Club">
    <template #title>
      <img src="/pontemog_optimized_.png" alt="Pontem Consulting Club" class="h-12 w-auto">
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton v-if="isAuthenticated" icon="i-lucide-log-out" color="error" variant="outline" size="xs" class="hidden lg:flex"
        @click="logout">
        Cerrar sesión
      </UButton>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
      <UButton v-if="isAuthenticated" icon="i-lucide-log-out" color="error" variant="outline" class="mt-4" @click="logout">
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
