<script setup lang="ts">
interface Props {
  documentPath?: string | null
  documentName?: string | null
}

const props = defineProps<Props>()

const documentUrl = useStorageFile(computed(() => props.documentPath ?? null))

const displayName = computed(() => props.documentName || 'documento.pdf')
</script>

<template>
  <div v-if="documentUrl" class="bg-default border border-muted rounded-2xl overflow-hidden shadow-sm flex flex-col">
    <div class="bg-muted px-4 py-3 border-b border-muted flex justify-between items-center gap-3">
      <span class="text-sm font-semibold text-default flex items-center gap-2 min-w-0">
        <UIcon name="i-lucide-file-text" class="size-4 shrink-0 text-primary" />
        <span class="truncate">{{ displayName }}</span>
      </span>
      <UButton :to="documentUrl" target="_blank" rel="noopener" icon="i-lucide-external-link" size="xs" color="neutral"
        variant="ghost" aria-label="Abrir en una pestaña nueva" />
    </div>

    <!-- `object` degrada solo: si el navegador no puede renderizar el PDF muestra el fallback -->
    <object :data="documentUrl" type="application/pdf" class="w-full h-[600px] bg-muted">
      <div class="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <UIcon name="i-lucide-file-text" class="size-12 text-dimmed" />
        <p class="text-sm text-muted">
          Tu navegador no puede mostrar el PDF incrustado.
        </p>
        <UButton :to="documentUrl" target="_blank" rel="noopener" icon="i-lucide-download" variant="soft">
          Abrir el documento
        </UButton>
      </div>
    </object>
  </div>
</template>
