<script setup lang="ts">
interface Props {
  name: string
}

defineProps<Props>()
</script>

<template>
  <UCard variant="item" class="text-center">
    <h3 class="text-lg font-semibold text-primary">
      {{ name }}
    </h3>
  </UCard>
</template>
