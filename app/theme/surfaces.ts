/**
 * Superficies: tarjetas y paneles. Una sola escala de radios y tres niveles de
 * sombra (plano, tarjeta, elevado). Ver docs/estilos.md.
 */
export const card = {
  slots: {
    root: 'rounded-2xl overflow-hidden',
    body: 'p-6 sm:p-8'
  },
  variants: {
    variant: {
      /** Paneles de contenido, formularios, cuentas, administración. */
      panel: { root: 'bg-default ring ring-default shadow-sm' },
      /** Tarjetas de un listado; la imagen va en #header y llega al borde. */
      item: {
        root: 'bg-default ring ring-default shadow-sm transition-shadow hover:shadow-lg',
        header: 'p-0 sm:p-0',
        body: 'p-5 sm:p-6',
        footer: 'border-t border-muted px-5 py-4 sm:px-6'
      },
      /** Bloques destacados (misión, pilares). */
      feature: {
        root: 'bg-default ring ring-default shadow-lg rounded-3xl',
        body: 'p-8 sm:p-10'
      },
      /** Recuadros dentro de un formulario o panel. */
      inset: {
        root: 'bg-muted ring ring-default rounded-lg',
        body: 'p-4 sm:p-4'
      }
    }
  },
  defaultVariants: {
    variant: 'panel'
  }
}

/** Tarjetas que son un enlace (UPageCard con `to`): mismo aspecto que `item`. */
export const pageCard = {
  slots: {
    root: 'rounded-2xl overflow-hidden',
    title: 'text-subheading text-highlighted',
    description: 'text-base text-muted'
  },
  variants: {
    variant: {
      outline: { root: 'bg-default ring ring-default shadow-sm transition-shadow hover:shadow-lg' }
    }
  }
}
