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
  'border-pontemred-500 text-pontemred-500',
  'border-pontemteal-600 text-pontemteal-700',
  'border-pontempurple-500 text-pontempurple-600'
]
</script>

<template>
  <div class="relative w-full overflow-x-auto pb-4">
    <div class="min-w-[760px] relative flex justify-between items-start px-8 py-4">
      <!-- Línea punteada de fondo, alineada con el centro de los nodos (h-15 => 30px) -->
      <div class="absolute left-20 right-20 top-[46px] h-px border-t-2 border-dashed border-gray-200" />

      <div v-for="(stage, index) in stages" :key="stage.title"
        class="flex flex-col items-center gap-3 w-36 relative z-10 group">
        <div
          class="w-15 h-15 rounded-full bg-white border-2 text-xl font-bold flex items-center justify-center shadow-sm transition-transform group-hover:-translate-y-1"
          :class="nodeStyles[index % nodeStyles.length]">
          {{ index + 1 }}
        </div>
        <span class="text-xs font-semibold uppercase tracking-wider text-center text-gray-700">
          {{ stage.title }}
        </span>
        <span class="text-xs text-gray-400 text-center leading-relaxed">
          {{ stage.description }}
        </span>
      </div>
    </div>
  </div>
</template>
