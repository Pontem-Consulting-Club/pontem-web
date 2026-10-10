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
    <div class="flex flex-col items-start gap-3">
      <p class="text-sm font-medium text-secondary-200">Recurso destacado</p>
      <h2 class="text-title text-white">
        {{ title }}
      </h2>
      <p class="text-sm text-white/70 max-w-md">
        {{ description }}
      </p>
    </div>

    <UButton variant="solid" :to="href" target="_blank" rel="noopener" trailing-icon="i-lucide-download" size="xl" color="neutral"
      class="bg-default text-highlighted hover:bg-elevated rounded-full font-semibold whitespace-nowrap">
      Descargar Casebook<span class="sr-only"> (PDF, se abre en otra pestaña)</span>
    </UButton>
  </UCard>
</template>
