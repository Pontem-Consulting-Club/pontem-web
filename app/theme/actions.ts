/** Botones y etiquetas. El estilo de la casa es `soft`; la acción principal usa `solid`. */
export const button = {
  compoundVariants: [
    {
      // Nuxt UI marca el foco de estas variantes solo con un tinte de fondo, que casi
      // no se ve. El contorno toma el color del texto del botón. outline-solid hace
      // falta porque su `focus:outline-none` deja --tw-outline-style en none.
      variant: ['soft', 'subtle', 'ghost', 'link'],
      class: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-current'
    },
    {
      // El rojo 600 pasa sobre blanco pero no sobre su propio tinte (4.1:1); 700 da 5.6:1.
      color: 'primary',
      variant: ['outline', 'soft', 'subtle', 'ghost', 'link'],
      class: 'text-primary-700'
    }
  ],
  defaultVariants: {
    variant: 'soft'
  }
}

export const badge = {
  compoundVariants: [
    {
      color: 'primary',
      variant: ['outline', 'soft', 'subtle'],
      class: 'text-primary-700'
    }
  ],
  defaultVariants: {
    variant: 'subtle'
  }
}
