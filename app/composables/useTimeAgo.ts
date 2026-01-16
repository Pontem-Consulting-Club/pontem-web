export const useTimeAgo = () => {
  const calculateTimeAgo = (publishDate: string): string => {
    const now = new Date()
    const published = new Date(publishDate)
    const timeDiff = Math.abs(now.getTime() - published.getTime())
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

    if (daysDiff === 0) return 'Hoy'
    if (daysDiff === 1) return 'Hace 1 día'
    if (daysDiff < 7) return `Hace ${daysDiff} días`
    const weeksDiff = Math.floor(daysDiff / 7)
    if (weeksDiff === 1) return 'Hace 1 semana'
    return `Hace ${weeksDiff} semanas`
  }

  return { calculateTimeAgo }
}
