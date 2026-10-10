<script setup lang="ts">
/**
 * Una sección cuyos datos no se pudieron cargar. Va en lugar del estado vacío: sin
 * esto, un error del servidor se veía como "no hay noticias".
 */
const props = defineProps<{
  /** Qué falló, en una frase: "No pudimos cargar las noticias". */
  title: string
  retry: () => Promise<unknown> | unknown
}>()

const retrying = ref(false)

const onRetry = async () => {
  retrying.value = true
  try {
    await props.retry()
  } finally {
    retrying.value = false
  }
}
</script>

<template>
  <UEmpty icon="i-lucide-cloud-off" :title="title"
    description="Puede ser un problema de conexión. Inténtalo de nuevo en un momento."
    :actions="[{ label: 'Reintentar', icon: 'i-lucide-refresh-cw', loading: retrying, onClick: onRetry }]" />
</template>
