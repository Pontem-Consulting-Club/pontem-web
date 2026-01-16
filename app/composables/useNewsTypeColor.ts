export const useNewsTypeColor = () => {
  const getTypeColor = (type?: string): string => {
    const typeClasses: Record<string, string> = {
      Evento: 'bg-pontemteal-100 text-pontemteal-700',
      'Artículo': 'bg-pontemred-100 text-pontemred-700',
      Anuncio: 'bg-pontempurple-100 text-pontempurple-700',
    }
    return typeClasses[type || ''] || ''
  }

  const getTypeBorder = (type?: string): string => {
    const borderClasses: Record<string, string> = {
      Evento: 'border-pontemteal-700',
      'Artículo': 'border-pontemred-700',
      Anuncio: 'border-pontempurple-700',
    }
    return borderClasses[type || ''] || ''
  }

  const getTypeText = (type?: string): string => {
    const textClasses: Record<string, string> = {
      Evento: 'text-pontemteal-700',
      'Artículo': 'text-pontemred-700',
      Anuncio: 'text-pontempurple-700',
    }
    return textClasses[type || ''] || ''
  }

  return { getTypeColor, getTypeBorder, getTypeText }
}
