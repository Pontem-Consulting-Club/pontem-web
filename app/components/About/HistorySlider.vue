<script setup lang="ts">
interface HistoryItem {
  year: string | number
  title: string
  description: string
}

const props = defineProps<{
  items: HistoryItem[]
}>()

const dotColorClasses = [
  'bg-pontemred-800',
  'bg-pontemred-700',
  'bg-pontemred-500',
  'bg-pontemred-300',
  'bg-pontemred-200',
]

const getDotColor = (index: number) => {
  const total = props.items.length
  if (total <= 1) return dotColorClasses[0]!
  const step = (dotColorClasses.length - 1) / (total - 1)
  const i = Math.min(Math.round(index * step), dotColorClasses.length - 1)
  return dotColorClasses[i]!
}
</script>

<template>
  <section>
    <SectionHeader title="Nuestra Historia" centered class="mb-14" />

    <!-- Desktop: horizontal timeline (md+) -->
    <div class="hidden md:block relative">
      <!-- Gradient horizontal line centered on dots -->
      <div class="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-pontemred-500 to-pontemteal-500" />
      <!-- Items row -->
      <div class="flex">
        <div
          v-for="(item, index) in props.items"
          :key="item.year"
          class="flex flex-col items-center flex-1 min-w-0"
        >
          <!-- Dot — h-10 = 40px, center at 20px = top-5, aligns with line -->
          <div
            :class="['w-10 h-10 rounded-full border-4 border-white shadow-md z-10 shrink-0', getDotColor(index)]"
          />
          <!-- Text below dot -->
          <div class="mt-4 text-center px-2">
            <p class="font-bold text-xl text-gray-900">{{ item.year }}</p>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: vertical timeline (<md) -->
    <!-- Dot w-9 h-9 = 36px, center at 18px = left-[18px] of line -->
    <div class="md:hidden relative">
      <div class="absolute left-[18px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-pontemred-500 to-pontemteal-500" />
      <div class="space-y-10">
        <div
          v-for="(item, index) in props.items"
          :key="item.year"
          class="flex items-start gap-5"
        >
          <!-- Dot -->
          <div
            :class="['w-9 h-9 rounded-full border-4 border-white shadow-md z-10 shrink-0', getDotColor(index)]"
          />
          <!-- Text -->
          <div class="pt-1">
            <p class="font-bold text-xl text-gray-900">{{ item.year }}</p>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
