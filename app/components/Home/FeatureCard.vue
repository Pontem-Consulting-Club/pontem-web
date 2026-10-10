<template>
  <UCard variant="feature" class="text-center">
    <div class="flex justify-center mb-4">
      <UIcon :name="icon" class="size-12" :class="iconColor" />
    </div>
    <h3 class="mb-2 text-subheading text-highlighted">
      {{ title }}
    </h3>
    <p>
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
