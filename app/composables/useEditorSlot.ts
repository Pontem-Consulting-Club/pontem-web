import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * Un solo formulario de edición en línea abierto a la vez. Antes se podían abrir
 * varios, y guardar uno refrescaba la lista debajo de los demás.
 *
 * Cada editor pasa su clave y su `isEditing`: mientras está abierto ocupa el lugar,
 * y los lápices de los demás y los botones "Agregar" miran `othersOpen` y
 * `anyOpen` para desactivarse. Al cerrarse, el foco vuelve a `focusOnClose` (el
 * lápiz que lo abrió). Sin argumentos, solo sirve para leer `anyOpen`.
 */
export function useEditorSlot(key?: MaybeRefOrGetter<string>, options: {
  isEditing?: Ref<boolean>
  focusOnClose?: () => void
} = {}) {
  const current = useState<string | null>('editor-abierto', () => null)

  const anyOpen = computed(() => current.value !== null)
  const othersOpen = computed(() => current.value !== null && current.value !== toValue(key))

  const claim = () => {
    if (key !== undefined) current.value = toValue(key)
  }
  const release = () => {
    if (key !== undefined && current.value === toValue(key)) current.value = null
  }

  if (options.isEditing && import.meta.client) {
    watch(options.isEditing, async (editing, wasEditing) => {
      if (editing) {
        claim()
        return
      }
      release()
      if (wasEditing) {
        await nextTick()
        options.focusOnClose?.()
      }
    }, { immediate: true })
  }

  // Si la tarjeta desaparece con el editor abierto (se borró, se cambió de página).
  onScopeDispose(release)

  return { anyOpen, othersOpen, claim, release }
}
