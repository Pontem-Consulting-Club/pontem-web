/**
 * Superficies: tarjetas y paneles de vidrio (utilidades glass y glass-raised de
 * main.css) sobre el fundido Pontem. Una sola escala de radios. Ver docs/estilos.md.
 */
export const card = {
  slots: {
    root: 'rounded-2xl overflow-hidden',
    body: 'p-6 sm:p-8'
  },
  variants: {
    variant: {
      /** Paneles de contenido, formularios, cuentas, administración. */
      panel: { root: 'glass' },
      /** Tarjetas de un listado; la imagen va en #header y llega al borde. */
      item: {
        root: 'glass transition-shadow duration-300 hover:glass-raised',
        header: 'p-0 sm:p-0',
        body: 'p-5 sm:p-6',
        footer: 'border-t border-white/60 px-5 py-4 sm:px-6'
      },
      /** Bloques destacados (misión, pilares). */
      feature: {
        root: 'glass rounded-3xl',
        body: 'p-8 sm:p-10'
      },
      /** Recuadros dentro de un formulario o panel. */
      inset: {
        root: 'bg-default/50 ring ring-white/70 rounded-lg',
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
      outline: { root: 'glass transition-shadow duration-300 hover:glass-raised' }
    }
  }
}
