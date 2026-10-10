/** Estructura de página: portadas, encabezados, secciones, cabecera y pie. */
export const pageHero = {
  slots: {
    title: 'text-display text-highlighted',
    description: 'text-lg text-muted'
  }
}

export const pageHeader = {
  slots: {
    root: 'border-none py-10',
    // El rojo 600 no llega a 4.5:1 sobre bg-muted (4.47:1); 700 sí.
    headline: 'text-primary-700',
    title: 'text-title text-highlighted',
    description: 'text-lg text-muted'
  }
}

export const pageSection = {
  slots: {
    container: 'py-16 sm:py-24 gap-8 sm:gap-12',
    title: 'text-title text-highlighted',
    description: 'text-lg text-muted'
  },
  // Igual que en pageHeader, pero aquí text-primary lo pone la variante `headline`,
  // no el slot: el cambio tiene que ir en la variante.
  variants: { headline: { true: { headline: 'text-primary-700' } } }
}

export const header = {
  slots: {
    root: 'shadow-sm'
  }
}

export const footer = {
  slots: {
    root: 'mt-24 bg-neutral-600/75 text-white clip-wave-top',
    top: 'pt-24 pb-8',
    container: 'border-t border-white/20 text-sm text-white/80'
  }
}

/** Columnas del pie: los enlaces se colorean por la variante `active`, no por el slot. */
export const footerColumns = {
  slots: {
    label: 'text-lg font-semibold text-white'
  },
  variants: {
    active: {
      true: { link: 'font-medium text-white' },
      false: { link: 'text-white/80 hover:text-white' }
    }
  }
}

/** La franja de logos se detiene si el sistema pide menos movimiento. */
export const marquee = {
  slots: {
    content: 'motion-reduce:[animation-play-state:paused]'
  }
}
