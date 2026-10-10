<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const _props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'size-4',
  md: 'size-8',
  lg: 'size-12'
}
</script>

<template>
  <div class="flex justify-center">
    <UIcon name="i-lucide-loader-2" :class="[sizeClasses[size], 'animate-spin text-primary']" />
  </div>
</template>
