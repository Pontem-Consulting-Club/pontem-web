/**
 * Presets para <UTheme :ui="...">: cambian el aspecto de los componentes dentro de
 * una zona sin tocar cada uno.
 */

// Clases de campo de cada preset, para componerlas cuando un campo necesita además
// su propia `ui` (una prop `ui` reemplaza, no suma, lo que pone el preset).
export const onImageField = 'rounded-lg bg-white/10 text-white ring-1 ring-white/25 placeholder:text-white/60 focus:ring-white/60'
export const inlineEditField = 'text-toned placeholder:text-muted'

/** Sobre una foto oscura (portadas, banners): texto y controles en blanco. */
export const onImage = {
  button: {
    base: 'bg-white/20 text-white hover:bg-white/30 active:bg-white/30'
  },
  // Sobre una foto cada campo necesita su propia superficie para leerse como editable.
  input: { base: onImageField },
  textarea: { base: onImageField },
  pageHero: {
    title: 'text-white',
    description: 'text-white/85'
  }
}

/**
 * Edición en línea (formularios que imitan la tarjeta que editan): los campos usan
 * variant="ghost" y el color del texto que reemplazan.
 */
export const inlineEdit = {
  input: { base: inlineEditField },
  textarea: { base: inlineEditField },
  select: { base: 'text-toned', placeholder: 'text-muted' }
}
