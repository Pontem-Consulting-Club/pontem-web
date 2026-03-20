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
  <UCard class="hover:shadow-lg transition-shadow bg-white">
    <div class="flex items-center gap-4">
      <UIcon :name="icon" :class="['w-10 h-10', iconColor]" />
      <div class="text-left">
        <h3 class="font-semibold">{{ title }}</h3>
        <p class="text-sm ">{{ description }}</p>
      </div>
    </div>
  </UCard>
</template>
