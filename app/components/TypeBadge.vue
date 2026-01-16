<script setup lang="ts">
interface Props {
  type: string
  size?: 'xs' | 'sm' | 'base'
}

const _props = withDefaults(defineProps<Props>(), {
  size: 'xs'
})

const { getTypeColor } = useNewsTypeColor()

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-xs',
  base: 'px-3 py-1 text-sm'
}
</script>

<template>
  <span 
    :class="[
      'inline-block rounded-full font-semibold',
      sizeClasses[_props.size],
      getTypeColor(type)
    ]"
  >
    {{ type }}
  </span>
</template>
