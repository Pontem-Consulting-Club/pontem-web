<script setup lang="ts">
interface Stage {
  title: string
  description: string
}

defineProps<{
  stages: Stage[]
}>()

// Los nodos alternan entre los tres colores de la paleta, como en el diseño.
const nodeStyles = [
  'border-primary-500 text-primary',
  'border-secondary-300 text-secondary-700',
  'border-tertiary-900 text-tertiary-600'
]
</script>

<template>
  <!-- Es una secuencia: lista ordenada. En celular y tablet va en columna (antes se
       desplazaba de lado y cortaba las etapas); desde lg, en fila. -->
  <ol class="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:px-8 lg:py-4">
    <!-- Línea punteada por el centro de los nodos (size-15 => 30 px): vertical, y
         horizontal desde lg. -->
    <div aria-hidden="true"
      class="absolute inset-y-8 left-[29px] border-l-2 border-dashed border-default lg:inset-x-20 lg:top-[46px] lg:bottom-auto lg:border-t-2 lg:border-l-0" />

    <li v-for="(stage, index) in stages" :key="stage.title"
      class="relative z-10 flex items-start gap-4 lg:w-36 lg:flex-col lg:items-center lg:gap-3">
      <div aria-hidden="true"
        class="size-15 shrink-0 rounded-full bg-default border-2 text-xl font-bold flex items-center justify-center shadow-sm"
        :class="nodeStyles[index % nodeStyles.length]">
        {{ index + 1 }}
      </div>
      <div class="flex flex-col gap-1 pt-2 lg:items-center lg:pt-0 lg:text-center">
        <span class="text-sm font-semibold text-highlighted">
          {{ stage.title }}
        </span>
        <span class="text-xs/relaxed text-muted">
          {{ stage.description }}
        </span>
      </div>
    </li>
  </ol>
</template>
