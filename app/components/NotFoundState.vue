<script setup lang="ts">
/**
 * Página o recurso que no existe. Es UEmpty, salvo el título: aquí es el h1 de la
 * página (UEmpty siempre usa h2).
 */
withDefaults(defineProps<{
  icon?: string
  title: string
  message?: string
  buttonText?: string
  buttonLink?: string
}>(), {
  icon: 'i-lucide-file-x',
  message: '',
  buttonText: 'Volver',
  buttonLink: '/'
})
</script>

<template>
  <UEmpty :actions="[{ label: buttonText, to: buttonLink, color: 'neutral', variant: 'outline' }]">
    <template #header>
      <UAvatar :icon="icon" size="xl" />
      <h1 class="text-title text-highlighted">{{ title }}</h1>
      <p v-if="message" class="text-muted">{{ message }}</p>
    </template>
  </UEmpty>
</template>
