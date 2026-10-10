<script setup lang="ts">
/**
 * Botón de editar de las tarjetas (solo lo ven quienes pueden editar). Por defecto
 * flota arriba a la derecha de la tarjeta, con fondo para leerse sobre una foto.
 */
withDefaults(defineProps<{
  /** Qué se edita, para lectores de pantalla: "Editar proyecto". */
  label: string
  to?: string
  inline?: boolean
  /** Otro editor está abierto (useEditorSlot). */
  disabled?: boolean
}>(), {
  to: undefined,
  inline: false,
  disabled: false
})

defineEmits<{ (e: 'click', event: MouseEvent): void }>()

const button = useTemplateRef('button')

// La tarjeta devuelve el foco aquí al cerrar su formulario.
defineExpose({ focus: () => elementOf(button.value)?.focus() })
</script>

<template>
  <UButton ref="button" icon="i-lucide-pencil" size="xs" :aria-label="label" :to="to" :disabled="disabled"
    :class="inline ? 'shrink-0' : 'absolute top-3 right-3 z-10 bg-default/90 shadow-sm hover:bg-default'"
    @click="$emit('click', $event)" />
</template>
