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
  <!-- Bloque destacado oscuro: más aire y fila en escritorio -->
  <UCard as="section" variant="solid" class="relative w-full rounded-3xl shadow-lg"
    :ui="{ body: 'flex flex-col items-center justify-between gap-8 p-8 sm:p-8 md:flex-row md:p-12' }">
    <!-- Halo decorativo -->
    <div class="absolute right-0 top-0 size-64 bg-secondary-300 rounded-full blur-[100px] opacity-20 pointer-events-none" />

    <div class="flex flex-col items-start gap-4 z-10">
      <div
        class="inline-flex items-center gap-2 bg-secondary-300/20 text-secondary-200 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-secondary-300/30">
        <UIcon name="i-lucide-star" class="size-3.5" />
        Recurso destacado
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-white">
        {{ title }}
      </h2>
      <p class="text-sm text-dimmed max-w-md">
        {{ description }}
      </p>
    </div>

    <UButton variant="solid" :to="href" target="_blank" rel="noopener" trailing-icon="i-lucide-download" size="xl" color="neutral"
      class="z-10 bg-default text-highlighted hover:bg-elevated rounded-full font-semibold whitespace-nowrap">
      Descargar Casebook
    </UButton>
  </UCard>
</template>
