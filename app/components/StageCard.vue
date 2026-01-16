<template>
  <div class="relative">
    <UCard class="w-48 text-center bg-white" variant="soft">
      <div class="flex items-center justify-center w-10 h-10 bg-pontemteal-200 rounded-full mx-auto mb-3">
        <span class="text-pontemred-500 font-bold">{{ number }}</span>
      </div>
      <h3 class="font-semibold mb-1">{{ title }}</h3>
      <p class="text-sm">{{ description }}</p>
    </UCard>
    <div 
      v-if="showArrow" 
      class="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2"
    >
      <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  number: number
  title: string
  description: string
  showArrow?: boolean
}

withDefaults(defineProps<Props>(), {
  showArrow: false
})
</script>

