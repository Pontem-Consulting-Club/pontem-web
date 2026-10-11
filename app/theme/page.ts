/** Estructura de página: portadas, encabezados, secciones, cabecera y pie. */
export const pageHero = {
  slots: {
    title: 'text-display text-highlighted',
    description: 'text-lg text-muted'
  },
  // Los banners alinean el título a la izquierda, como la portada del inicio y los
  // títulos de las secciones de abajo.
  variants: {
    orientation: {
      vertical: { headline: 'justify-start', wrapper: 'text-left', links: 'justify-start' }
    }
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
    // text-toned y no text-muted: sobre las bandas grises (bg-elevated) text-muted
    // queda en 4.4:1.
    description: 'text-lg text-toned max-w-3xl'
  },
  // Igual que en pageHeader, pero aquí text-primary lo pone la variante `headline`,
  // no el slot: el cambio tiene que ir en la variante.
  variants: {
    headline: { true: { headline: 'text-primary-700' } },
    // Títulos alineados a la izquierda, con el contenido que tienen debajo. Nuxt UI
    // los centra cuando la sección es vertical.
    orientation: {
      vertical: {
        headline: 'justify-start',
        leading: 'justify-start',
        title: 'text-left',
        description: 'text-left text-pretty',
        links: 'justify-start'
      }
    }
  }
}

// Cabecera de vidrio: translúcida con desenfoque. Un poco más opaca que la de Nuxt
// UI (75%) para que los enlaces se lean cuando pasa sobre una foto oscura.
export const header = {
  slots: {
    root: 'bg-default/85 border-white/70 shadow-[0_8px_24px_-18px_color-mix(in_oklab,var(--color-pontemred-700)_35%,transparent)]'
  }
}

// Menú principal: sin pastillas de fondo. Sobre el vidrio, el gris del hover y el
// blanco del activo se veían como manchas. El activo se marca con el color del
// texto y la barra de `highlight`; los demás van en text-toned, que se lee también
// cuando la cabecera pasa sobre una foto.
export const navigationMenu = {
  compoundVariants: [
    { variant: 'link', active: false, class: { link: 'text-toned hover:text-highlighted' } },
    { variant: 'link', active: true, color: 'primary', class: { link: 'text-primary-700' } }
  ],
  defaultVariants: {
    variant: 'link',
    highlightColor: 'primary'
  }
}

export const footer = {
  slots: {
    // El neutro más oscuro: el logo blanco y los enlaces se leen bien. La ola se queda.
    root: 'mt-8 bg-footer text-white clip-wave-top',
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
