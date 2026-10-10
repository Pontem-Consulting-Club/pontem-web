type BadgeColor = 'primary' | 'secondary' | 'tertiary' | 'neutral'

export const useNewsTypeColor = () => {
  /** Color de UBadge para cada tipo de noticia. */
  const getTypeBadgeColor = (type?: string | null): BadgeColor => {
    const colors: Record<string, BadgeColor> = {
      Evento: 'secondary',
      'Artículo': 'primary',
      Anuncio: 'tertiary'
    }
    return colors[type || ''] ?? 'neutral'
  }

  const getTypeColor = (type?: string): string => {
    const typeClasses: Record<string, string> = {
      Evento: 'bg-secondary-50 text-secondary-800',
      'Artículo': 'bg-primary-50 text-primary-800',
      Anuncio: 'bg-tertiary-50 text-tertiary-800',
    }
    return typeClasses[type || ''] || ''
  }

  const getTypeBorder = (type?: string): string => {
    const borderClasses: Record<string, string> = {
      Evento: 'border-secondary-700',
      'Artículo': 'border-primary-700',
      Anuncio: 'border-tertiary-700',
    }
    return borderClasses[type || ''] || ''
  }

  const getTypeText = (type?: string): string => {
    const textClasses: Record<string, string> = {
      Evento: 'text-secondary-700',
      'Artículo': 'text-primary-700',
      Anuncio: 'text-tertiary-700',
    }
    return textClasses[type || ''] || ''
  }

  return { getTypeBadgeColor, getTypeColor, getTypeBorder, getTypeText }
}
