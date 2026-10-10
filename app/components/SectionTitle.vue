<script setup lang="ts">
/**
 * Título de una sección dentro de una página (h2). Va a la izquierda, alineado con
 * su contenido, y sin ícono: los íconos como marcadores de sección no dicen nada.
 */
defineProps<{ title: string }>()
</script>

<template>
  <h2 class="text-title text-highlighted">
    {{ title }}
  </h2>
</template>
