<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  message?: string
  buttonText?: string
  buttonLink?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-file-x',
  message: '',
  buttonText: 'Volver',
  buttonLink: '/'
})
</script>

<template>
  <div class="text-center">
    <UIcon :name="icon" class="w-16 h-16 mx-auto mb-4" />
    <h1 class="text-2xl font-bold mb-4">{{ title }}</h1>
    <p v-if="message" class="mb-6">{{ message }}</p>
    <UButton :to="buttonLink" variant="outline"
      class="border-2 hover:text-white transition-colors duration-300 rounded-lg">
      {{ buttonText }}
    </UButton>
  </div>
</template>
