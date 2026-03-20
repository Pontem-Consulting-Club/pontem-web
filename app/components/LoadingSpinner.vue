<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const _props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}
</script>

<template>
  <div class="flex justify-center">
    <UIcon name="i-lucide-loader-2" :class="[sizeClasses[size], 'animate-spin text-primary']" />
  </div>
</template>
