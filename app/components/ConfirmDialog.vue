<script setup lang="ts">
/**
 * Diálogo de confirmación. Se abre con useConfirm, no se usa en plantillas. El
 * foco empieza en "Cancelar": confirmar una acción destructiva pide un paso más.
 */
withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}>(), {
  description: undefined,
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  destructive: false
})

const emit = defineEmits<{ close: [confirmed: boolean] }>()
</script>

<template>
  <UModal :title="title" :description="description" :close="false">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          {{ cancelLabel }}
        </UButton>
        <UButton :color="destructive ? 'error' : 'primary'" variant="solid" @click="emit('close', true)">
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
