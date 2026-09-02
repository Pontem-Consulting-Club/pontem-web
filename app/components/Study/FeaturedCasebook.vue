<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  href?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Casebook Pontem',
  description: 'La recopilación de casos reales, frameworks probados y consejos de entrevistadores.',
  href: '/docs/Casebook_Pontem_2021.pdf'
})
</script>

<template>
  <section
    class="w-full bg-gray-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg overflow-hidden relative">
    <!-- Halo decorativo -->
    <div class="absolute right-0 top-0 w-64 h-64 bg-pontemteal-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />

    <div class="flex flex-col items-start gap-4 z-10">
      <div
        class="inline-flex items-center gap-2 bg-pontemteal-500/20 text-pontemteal-300 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-pontemteal-500/30">
        <UIcon name="i-lucide-star" class="w-3.5 h-3.5" />
        Recurso destacado
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-white">
        {{ title }}
      </h2>
      <p class="text-sm text-gray-300 max-w-md">
        {{ description }}
      </p>
    </div>

    <UButton :to="href" target="_blank" rel="noopener" trailing-icon="i-lucide-download" size="xl" color="neutral"
      class="z-10 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-semibold whitespace-nowrap">
      Descargar Casebook
    </UButton>
  </section>
</template>
