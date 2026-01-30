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
  sm: { wrapper: 'w-12 h-12', icon: 'w-6 h-6' },
  md: { wrapper: 'w-16 h-16', icon: 'w-8 h-8' },
  lg: { wrapper: 'w-20 h-20', icon: 'w-10 h-10' }
}
</script>

<template>
  <div 
    :class="[
      'bg-pontemteal-200 rounded-full flex items-center justify-center',
      sizeClasses[_props.size].wrapper
    ]"
  >
    <UIcon :name="icon" :class="[sizeClasses[_props.size].icon, iconColor]" />
  </div>
</template>
