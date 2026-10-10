<script setup lang="ts">
/** Título de una sección dentro de una página (h2), con ícono opcional. */
withDefaults(defineProps<{
  title: string
  icon?: string
  centered?: boolean
}>(), {
  icon: undefined,
  centered: false
})
</script>

<template>
  <h2 class="flex items-center gap-3 text-title text-highlighted" :class="{ 'justify-center text-center': centered }">
    <UIcon v-if="icon" :name="icon" class="size-7 shrink-0 text-primary" />
    {{ title }}
  </h2>
</template>
