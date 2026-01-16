<script setup lang="ts">
interface Props {
  icon?: string
  message: string
}

const _props = withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-inbox'
})
</script>

<template>
  <div class="text-center">
    <UIcon :name="icon" class="w-16 h-16 mx-auto mb-4" />
    <p>{{ message }}</p>
  </div>
</template>
