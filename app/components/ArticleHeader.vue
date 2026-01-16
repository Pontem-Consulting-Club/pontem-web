<script setup lang="ts">
interface Props {
  type?: string
  title: string
  subtitle?: string
  author?: string
  date: string
  typeColor?: string
}

defineProps<Props>()
</script>

<template>
  <header class="mb-8">
    <div v-if="type" class="mb-4">
      <TypeBadge :type="type" size="base" />
    </div>
    <h1 class="text-3xl md:text-4xl font-bold mb-4">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="text-xl mb-6">
      {{ subtitle }}
    </p>
    <div class="flex items-center gap-4">
      <span v-if="author">Por <strong>{{ author }}</strong></span>
      <span v-if="author">•</span>
      <span>{{ date }}</span>
    </div>
  </header>
</template>
