export const useDateFormatting = () => {
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return { formatDate }
}
