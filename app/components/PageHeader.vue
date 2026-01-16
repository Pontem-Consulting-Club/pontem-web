<script setup lang="ts">
interface Props {
  title: string
  backgroundImage?: string
}

const _props = defineProps<Props>()
</script>

<template>
  <div 
    class="relative h-64 md:h-80 bg-cover bg-center"
    :style="backgroundImage ? `background-image: url('${backgroundImage}')` : undefined"
  >
    <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white">{{ title }}</h1>
    </div>
  </div>
</template>
