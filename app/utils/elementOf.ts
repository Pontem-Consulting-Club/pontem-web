import type { ComponentPublicInstance } from 'vue'

/**
 * El elemento DOM de un componente. UButton se renderiza como fragmento (pasa por
 * NuxtLink con `custom`), y su `$el` es el nodo de texto vacío que lo abre, no el
 * <button>: se avanza hasta el primer elemento.
 */
export function elementOf(component: ComponentPublicInstance | null | undefined): HTMLElement | null {
  let node = component?.$el as Node | null | undefined
  while (node && !(node instanceof HTMLElement)) node = node.nextSibling
  return node ?? null
}
