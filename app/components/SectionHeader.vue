<script setup lang="ts">
interface Props {
  title: string
  centered?: boolean
}

withDefaults(defineProps<Props>(), {
  centered: false
})
</script>

<template>
  <h2 class="text-3xl font-bold mb-4" :class="{ 'text-center': centered }">
    {{ title }}
  </h2>
</template>
