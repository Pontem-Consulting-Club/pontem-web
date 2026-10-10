/**
 * Controles de formulario: ocupan todo el ancho de su campo por defecto. El texto
 * de ejemplo va en `text-muted`: el `text-dimmed` de Nuxt UI queda en 2.6:1.
 *
 * La variante ghost (edición en línea) solo cambia el fondo al enfocar; se le suma
 * el anillo que ya tienen outline y subtle.
 */
export const input = {
  slots: { root: 'w-full', base: 'placeholder:text-muted' },
  // focus-within y no focus-visible: en un campo de fecha el foco puede quedar en
  // sus partes internas, y entonces solo se cumple :focus-within.
  compoundVariants: [{ variant: 'ghost', class: 'focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary' }]
}
export const textarea = {
  slots: { root: 'w-full', base: 'placeholder:text-muted' },
  compoundVariants: [{ variant: 'ghost', class: 'focus:ring-2 focus:ring-inset focus:ring-primary' }]
}
export const select = {
  slots: { base: 'w-full', placeholder: 'text-muted' },
  compoundVariants: [{ variant: 'ghost', class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary' }]
}
export const selectMenu = {
  slots: { base: 'w-full', placeholder: 'text-muted' },
  compoundVariants: [{ variant: 'ghost', class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary' }]
}
