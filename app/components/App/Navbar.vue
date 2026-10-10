<template>
  <UHeader title="Pontem Consulting Club" :toggle="{ size: 'xl' }">
    <template #title>
      <img src="/pontemog_optimized_.png" alt="Pontem Consulting Club" class="h-12 w-auto">
    </template>

    <!-- Los enlaces van a la derecha, junto a la cuenta: centrados entre el logo y un
         lado vacío quedaban corridos. Las opciones de la cuenta van en un menú aparte:
         con todas en la barra, a 1024 px se montaban sobre el logo. -->
    <template #right>
      <UNavigationMenu :items="navigation" highlight aria-label="Principal" class="hidden lg:flex" />
      <UDropdownMenu v-if="isAuthenticated" :items="accountMenu" :content="{ align: 'end' }">
        <!-- Entre 1024 y 1280 px solo el ícono: con el texto, el menú quedaba pegado al logo. -->
        <UButton icon="i-lucide-circle-user" color="neutral" variant="ghost" trailing-icon="i-lucide-chevron-down"
          aria-label="Mi cuenta" class="hidden shrink-0 whitespace-nowrap lg:inline-flex">
          <span class="hidden xl:inline">Mi cuenta</span>
        </UButton>
      </UDropdownMenu>
    </template>

    <template #body>
      <UNavigationMenu :items="navigation" orientation="vertical" highlight aria-label="Principal" class="-mx-2.5" />
      <template v-if="isAuthenticated">
        <USeparator class="my-4" />
        <UNavigationMenu :items="accountLinks" orientation="vertical" highlight aria-label="Mi cuenta" class="-mx-2.5" />
        <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" class="mt-2" @click="logout">
          Cerrar sesión
        </UButton>
      </template>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const { navigation } = useNavigation()
const { logout, isAuthenticated } = useAuth()
const { isAdmin } = useProfile()

const accountLinks = computed<NavigationMenuItem[]>(() => [
  { label: 'Mi perfil', icon: 'i-lucide-user', to: '/perfil' },
  ...(isAdmin.value ? [{ label: 'Personas', icon: 'i-lucide-users', to: '/admin/usuarios' }] : [])
])

const accountMenu = computed<DropdownMenuItem[][]>(() => [
  accountLinks.value.map(({ label, icon, to }) => ({ label, icon, to }) as DropdownMenuItem),
  [{ label: 'Cerrar sesión', icon: 'i-lucide-log-out', onSelect: () => logout() }]
])
</script>
