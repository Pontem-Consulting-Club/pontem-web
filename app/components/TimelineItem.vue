<script setup lang="ts">
interface Props {
  year: string
  title: string
  description: string
  index: number
}

defineProps<Props>()
</script>

<template>
  <div :class="[
    'relative flex items-center',
    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
  ]">
    <div :class="['hidden md:block w-1/2', index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left']">
      <UCard class="bg-default" variant="soft">
        <h3 class="text-xl font-bold text-primary mb-2">
          {{ year }}
        </h3>
        <h4 class="text-lg font-semibold mb-2">
          {{ title }}
        </h4>
        <p class="">
          {{ description }}
        </p>
      </UCard>
    </div>

    <!-- Center dot -->
    <div
      class="absolute left-1/2 transform -translate-x-1/2 size-4 bg-secondary-300 rounded-full border-4 border-white" />

    <div class="md:hidden w-full pl-8">
      <UCard class="bg-default">
        <h3 class="text-xl font-bold text-primary mb-2">
          {{ year }}
        </h3>
        <h4 class="text-lg font-semibold mb-2">
          {{ title }}
        </h4>
        <p class="">
          {{ description }}
        </p>
      </UCard>
    </div>

    <div class="hidden md:block w-1/2" />
  </div>
</template>
