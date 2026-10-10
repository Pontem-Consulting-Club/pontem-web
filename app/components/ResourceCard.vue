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

<template>
  <UCard variant="item">
    <div class="flex items-center gap-4">
      <UIcon :name="icon" :class="['size-10', iconColor]" />
      <div class="text-left">
        <h3 class="font-semibold">{{ title }}</h3>
        <p class="text-sm">{{ description }}</p>
      </div>
    </div>
  </UCard>
</template>
