<script setup lang="ts">
interface Props {
  name: string
  role: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-user'
})
</script>

<template>
  <UCard class="text-center hover:shadow-lg transition-shadow bg-white">
    <div class="flex justify-center mb-4">
      <IconCircle :icon="icon" size="lg" />
    </div>
    <h3 class="text-lg font-semibold">
      {{ name }}
    </h3>
    <p class="">
      {{ role }}
    </p>
  </UCard>
</template>
