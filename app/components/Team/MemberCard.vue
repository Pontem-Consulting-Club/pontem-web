<script setup lang="ts">
interface Props {
  name: string
}

defineProps<Props>()
</script>

<template>
  <UCard variant="soft" class="text-center hover:shadow-lg transition-shadow bg-white">
    <h3 class="text-lg font-semibold text-primary">
      {{ name }}
    </h3>
  </UCard>
</template>
