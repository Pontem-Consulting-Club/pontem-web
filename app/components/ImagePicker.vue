<script setup lang="ts">
// `class` (alto, ancho) se aplica al recuadro o botón visible, no a UFileUpload.
defineOptions({ inheritAttrs: false })

/**
 * Elegir una imagen para subir. `area` muestra la imagen (o un recuadro vacío) y se
 * hace clic encima; `button` es solo un botón. El archivo elegido queda en
 * v-model; `current` es la imagen ya guardada.
 */
interface Props {
  current?: string | null
  mode?: 'area' | 'button'
  disabled?: boolean
  loading?: boolean
  accept?: string
  /** Textos sin imagen y con imagen. */
  labels?: [string, string]
  /** Solo en modo `button`. */
  icon?: string
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  current: null,
  mode: 'area',
  disabled: false,
  loading: false,
  accept: 'image/*',
  labels: () => ['Subir imagen', 'Cambiar imagen'],
  icon: 'i-lucide-upload',
  block: false
})

const file = defineModel<File | null>({ default: null })

const { previewUrl } = useImagePreview(file, toRef(props, 'current'))
const label = computed(() => (previewUrl.value ? props.labels[1] : props.labels[0]))
</script>

<template>
  <!-- La lista de archivos y los textos propios de UFileUpload se ocultan: el
       contenido lo pone el slot. -->
  <UFileUpload v-model="file" :accept="accept" :preview="false" :interactive="false" :disabled="disabled || loading"
    :ui="{ files: 'hidden', label: 'hidden', description: 'hidden' }">
    <template #default="{ open }">
      <UButton v-if="mode === 'button'" :icon="icon" :block="block" :loading="loading" :disabled="disabled"
        :class="$attrs.class" @click="open()">
        {{ label }}
      </UButton>

      <button v-else type="button" :disabled="disabled"
        class="relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-cover bg-center text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-primary"
        :class="[previewUrl ? 'text-white' : 'border-2 border-dashed border-accented bg-muted text-muted hover:bg-elevated', $attrs.class]"
        :style="previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined" @click="open()">
        <span v-if="previewUrl" aria-hidden="true" class="absolute inset-0 bg-black/40 transition hover:bg-black/50" />
        <span class="relative flex flex-col items-center gap-2">
          <UIcon name="i-lucide-upload" class="size-5" />
          {{ label }}
        </span>
      </button>
    </template>
  </UFileUpload>
</template>
