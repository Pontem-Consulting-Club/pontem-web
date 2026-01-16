<script setup lang="ts">
interface Props {
  text: string
  centered?: boolean
}

withDefaults(defineProps<Props>(), {
  centered: true
})
</script>

<template>
  <p class="text-lg max-w-3xl" :class="centered ? 'mx-auto' : ''">
    {{ text }}
  </p>
</template>
