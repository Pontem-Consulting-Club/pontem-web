<script setup lang="ts">
interface Props {
  name: string
}

defineProps<Props>()
</script>

<template>
  <UCard variant="item" class="text-center">
    <h3 class="text-subheading text-highlighted">
      {{ name }}
    </h3>
  </UCard>
</template>
