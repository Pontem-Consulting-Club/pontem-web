import type { MaybeRefOrGetter } from 'vue'

/**
 * Título y descripción de la página, también para la vista previa al compartir el
 * enlace. Sin descripción queda la del sitio (nuxt.config.ts).
 */
export function usePageMeta(meta: {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string | null | undefined>
}) {
  const description = () => toValue(meta.description) || undefined
  useSeoMeta({
    title: meta.title,
    ogTitle: meta.title,
    description,
    ogDescription: description
  })
}
