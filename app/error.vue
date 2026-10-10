<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Página de error del sitio (404, 403, 500). Sin este archivo Nuxt mostraba la
 * suya: en inglés, sin cabecera ni pie y sin una salida clara.
 */
const props = defineProps<{ error: NuxtError }>()

const copy = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return {
        icon: 'i-lucide-map-pin-off',
        title: 'No encontramos esta página',
        description: 'Puede que el enlace esté mal escrito o que la página ya no exista.'
      }
    case 401:
    case 403:
      return {
        icon: 'i-lucide-lock',
        title: 'No tienes acceso a esta sección',
        description: 'Si crees que deberías tenerlo, pídeselo a quien administra el sitio.'
      }
    default:
      return {
        icon: 'i-lucide-cloud-off',
        title: 'Algo salió mal',
        description: 'Fue un error de nuestro lado. Inténtalo de nuevo en un momento.'
      }
  }
})

useHead({ title: () => `${copy.value.title} - Pontem` })

// clearError saca la página de error; navegar con un enlace normal no basta.
const goHome = () => clearError({ redirect: '/' })
const retry = () => clearError({ redirect: useRoute().fullPath })
</script>

<template>
  <NuxtLayout>
    <UContainer class="py-24">
      <UEmpty :actions="[
        { label: 'Ir al inicio', icon: 'i-lucide-house', variant: 'solid', onClick: goHome },
        ...(error.statusCode && error.statusCode >= 500 ? [{ label: 'Reintentar', icon: 'i-lucide-refresh-cw', onClick: retry }] : [])
      ]">
        <template #header>
          <UAvatar :icon="copy.icon" size="xl" />
          <!-- Es la página: su título es el h1 (UEmpty usa h2). -->
          <h1 class="text-title text-highlighted">{{ copy.title }}</h1>
          <p class="text-muted">{{ copy.description }}</p>
        </template>
      </UEmpty>
    </UContainer>
  </NuxtLayout>
</template>
