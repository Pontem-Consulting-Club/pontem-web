<script setup lang="ts">
defineProps<{
  number: string
  label: string
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <span class="text-xs font-semibold uppercase tracking-widest text-dimmed whitespace-nowrap">
      {{ number }} · {{ label }}
    </span>
    <div class="h-px flex-1 bg-accented" />
  </div>
</template>
