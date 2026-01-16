<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'text-pontem-500'
})
</script>

<template>
  <div class="rounded-3xl bg-white/90 text-center p-8 shadow-sm hover:shadow-lg transition-shadow">
    <div class="flex justify-center mb-4">
      <UIcon :name="icon" :class="['w-12 h-12', iconColor]" />
    </div>
    <h3 class="text-xl font-semibold mb-2">
      {{ title }}
    </h3>
    <p>
      {{ description }}
    </p>
  </div>
</template>
