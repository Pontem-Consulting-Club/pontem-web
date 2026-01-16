<script setup lang="ts">
interface Props {
  title: string
  icon: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'text-primary-600'
})
</script>

<template>
  <h2 class="text-2xl font-bold mb-8 flex items-center gap-3">
    <UIcon :name="icon" :class="['w-6 h-6', iconColor]" />
    {{ title }}
  </h2>
</template>
