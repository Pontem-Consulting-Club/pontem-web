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
    title: 'text-title text-highlighted',
    description: 'text-lg text-muted'
  }
}

export const pageSection = {
  slots: {
    container: 'py-16 sm:py-24 gap-8 sm:gap-12',
    title: 'text-title text-highlighted',
    description: 'text-lg text-muted'
  }
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
    bottom: 'border-t border-white/20 py-8 text-sm text-white/80'
  }
}

export const footerColumns = {
  slots: {
    label: 'text-lg font-semibold text-white',
    link: 'text-white/80 hover:text-white'
  }
}

/** La franja de logos se detiene si el sistema pide menos movimiento. */
export const marquee = {
  slots: {
    content: 'motion-reduce:[animation-play-state:paused]'
  }
}
