<script setup lang="ts">
interface Props {
  icon: string
  iconColor?: string
  size?: 'sm' | 'md' | 'lg'
}

const _props = withDefaults(defineProps<Props>(), {
  iconColor: 'text-primary',
  size: 'md'
})

const sizeClasses = {
  sm: { wrapper: 'size-12', icon: 'size-6' },
  md: { wrapper: 'size-16', icon: 'size-8' },
  lg: { wrapper: 'size-20', icon: 'size-10' }
}
</script>

<template>
  <div 
    :class="[
      'bg-secondary-100 rounded-full flex items-center justify-center',
      sizeClasses[_props.size].wrapper
    ]"
  >
    <UIcon :name="icon" :class="[sizeClasses[_props.size].icon, iconColor]" />
  </div>
</template>
