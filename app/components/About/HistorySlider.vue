<script setup lang="ts">
interface HistoryItem {
  year: string | number
  title: string
  description: string
}

const props = defineProps<{
  items: HistoryItem[]
}>()

const timelineTrack = ref<HTMLElement | null>(null)

const scrollTimeline = (direction: 'left' | 'right') => {
  const container = timelineTrack.value
  if (!container) return

  const amount = Math.round(container.clientWidth * 0.85)
  container.scrollBy({
    left: direction === 'right' ? amount : -amount,
    behavior: 'smooth',
  })
}
</script>

<template>
  <section>
    <SectionHeader title="Nuestra Historia" centered class="mb-14" />

    <div class="relative">
      

      <div
        ref="timelineTrack"
        class="overflow-x-auto pb-3 timeline-scroll"
      >
        <div class="flex gap-5 w-max px-1">
          <article
            v-for="(item, index) in props.items"
            :key="item.year"
            :class="[
              'w-[280px] md:w-[320px] rounded-2xl p-6 border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 snap-start shrink-0',
              index % 2 === 0 ? 'border-pontemred-100' : 'border-pontemteal-100',
            ]"
          >
            <span
              :class="[
                'inline-block text-xs font-bold px-3 py-1 rounded-full mb-3',
                index % 2 === 0
                  ? 'bg-pontemred-100 text-pontemred-600'
                  : 'bg-pontemteal-100 text-pontemteal-700',
              ]"
            >
              {{ item.year }}
            </span>

            <h4 class="font-bold text-gray-900 text-base mb-2">{{ item.title }}</h4>
            <p class="text-gray-500 text-sm leading-relaxed">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline-scroll {
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}
</style>
