import type { CaseCategory, CaseDifficulty } from '~/constants/caseStudies'

/**
 * Mapea las categorias y dificultades de los casos a la paleta de Pontem.
 * Mismo enfoque que `useNewsTypeColor`, para que los colores vivan en un solo lugar.
 */
export const useCaseStudyColors = () => {
  const categoryBadge: Record<CaseCategory, string> = {
    ESTRATEGIA: 'bg-pontemteal-100 text-pontemteal-800',
    OPERACIONES: 'bg-pontemred-100 text-pontemred-700',
    FINANZAS: 'bg-pontempurple-100 text-pontempurple-700',
    MARKETING: 'bg-pontemred-50 text-pontemred-600',
    IMPACTO_SOCIAL: 'bg-pontemteal-50 text-pontemteal-700'
  }

  const categoryAccent: Record<CaseCategory, string> = {
    ESTRATEGIA: 'bg-pontemteal-500',
    OPERACIONES: 'bg-pontemred-500',
    FINANZAS: 'bg-pontempurple-500',
    MARKETING: 'bg-pontemred-300',
    IMPACTO_SOCIAL: 'bg-pontemteal-700'
  }

  const categoryText: Record<CaseCategory, string> = {
    ESTRATEGIA: 'text-pontemteal-800',
    OPERACIONES: 'text-pontemred-600',
    FINANZAS: 'text-pontempurple-600',
    MARKETING: 'text-pontemred-500',
    IMPACTO_SOCIAL: 'text-pontemteal-700'
  }

  const categoryBorder: Record<CaseCategory, string> = {
    ESTRATEGIA: 'border-pontemteal-500',
    OPERACIONES: 'border-pontemred-500',
    FINANZAS: 'border-pontempurple-500',
    MARKETING: 'border-pontemred-300',
    IMPACTO_SOCIAL: 'border-pontemteal-700'
  }

  const difficultyText: Record<CaseDifficulty, string> = {
    FACIL: 'text-pontemteal-700',
    MEDIO: 'text-pontemteal-800',
    DIFICIL: 'text-pontemred-600',
    EXPERTO: 'text-pontempurple-600'
  }

  const getCategoryBadge = (category?: CaseCategory | null) =>
    category ? categoryBadge[category] : 'bg-gray-100 text-gray-600'

  const getCategoryAccent = (category?: CaseCategory | null) =>
    category ? categoryAccent[category] : 'bg-gray-300'

  const getCategoryText = (category?: CaseCategory | null) =>
    category ? categoryText[category] : 'text-gray-500'

  const getCategoryBorder = (category?: CaseCategory | null) =>
    category ? categoryBorder[category] : 'border-gray-200'

  const getDifficultyText = (difficulty?: CaseDifficulty | null) =>
    difficulty ? difficultyText[difficulty] : 'text-gray-500'

  return {
    getCategoryBadge,
    getCategoryAccent,
    getCategoryText,
    getCategoryBorder,
    getDifficultyText
  }
}
