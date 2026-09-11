export const useDateFormatting = () => {
  const formatDate = (date: string): string => {
    return formatClubDate(date, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return { formatDate }
}
