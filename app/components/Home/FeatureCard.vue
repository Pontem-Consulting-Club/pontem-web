<template>
  <UCard>
    <UIcon :name="icon" class="mb-4 size-8" :class="iconColor" />
    <h3 class="mb-2 text-subheading text-highlighted">
      {{ title }}
    </h3>
    <p class="text-toned">
      {{ description }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'text-primary'
})
</script>
