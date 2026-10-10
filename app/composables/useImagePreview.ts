import type { Ref } from 'vue'

/**
 * Vista previa de una imagen que se está por subir: el archivo elegido si hay uno,
 * si no la imagen guardada (`current`, una ruta de Storage o una URL). Libera la
 * URL temporal del archivo al cambiarlo y al desmontar.
 */
export function useImagePreview(file: Ref<File | null | undefined>, current: Ref<string | null | undefined>) {
  const objectUrl = ref<string | null>(null)

  const release = () => {
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }

  watch(file, (value) => {
    release()
    if (value) objectUrl.value = URL.createObjectURL(value)
  }, { immediate: true })

  onBeforeUnmount(release)

  const storedPath = computed(() => current.value?.toString().trim() || null)
  const { url: storedUrl } = useStorageImage(storedPath)

  const previewUrl = computed(() => objectUrl.value ?? storedUrl.value)

  return { previewUrl }
}
