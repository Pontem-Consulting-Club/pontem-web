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
  <div class="relative w-full overflow-x-auto pb-4">
    <div class="min-w-[760px] relative flex justify-between items-start px-8 py-4">
      <!-- Línea punteada de fondo, alineada con el centro de los nodos (h-15 => 30px) -->
      <div class="absolute inset-x-20 top-[46px] h-px border-t-2 border-dashed border-default" />

      <div v-for="(stage, index) in stages" :key="stage.title"
        class="flex flex-col items-center gap-3 w-36 relative z-10 group">
        <div
          class="size-15 rounded-full bg-default border-2 text-xl font-bold flex items-center justify-center shadow-sm transition-transform group-hover:-translate-y-1"
          :class="nodeStyles[index % nodeStyles.length]">
          {{ index + 1 }}
        </div>
        <span class="text-xs font-semibold uppercase tracking-wider text-center text-default">
          {{ stage.title }}
        </span>
        <span class="text-xs/relaxed text-muted text-center">
          {{ stage.description }}
        </span>
      </div>
    </div>
  </div>
</template>
