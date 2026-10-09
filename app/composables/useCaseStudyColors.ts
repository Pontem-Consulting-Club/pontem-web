import type { CaseCategory, CaseDifficulty } from '~/constants/caseStudies'

/**
 * Mapea las categorias y dificultades de los casos a la paleta de Pontem.
 * Mismo enfoque que `useNewsTypeColor`, para que los colores vivan en un solo lugar.
 *
 * Sin categoria es un casebook (una coleccion, no un caso): lleva su propio color
 * en vez del gris de "sin dato".
 */
export const useCaseStudyColors = () => {
  // [badge, acento, texto, borde]
  const categoryColors: Record<CaseCategory, [string, string, string, string]> = {
    'rentabilidad': ['bg-pontemred-100 text-pontemred-700', 'bg-pontemred-500', 'text-pontemred-600', 'border-pontemred-500'],
    'crecimiento-ingresos': ['bg-pontemteal-100 text-pontemteal-800', 'bg-pontemteal-500', 'text-pontemteal-800', 'border-pontemteal-500'],
    'entrada-mercado': ['bg-pontemteal-50 text-pontemteal-700', 'bg-pontemteal-700', 'text-pontemteal-700', 'border-pontemteal-700'],
    'ma-inversion': ['bg-pontempurple-100 text-pontempurple-700', 'bg-pontempurple-500', 'text-pontempurple-600', 'border-pontempurple-500'],
    'pricing': ['bg-pontemred-50 text-pontemred-600', 'bg-pontemred-300', 'text-pontemred-500', 'border-pontemred-300'],
    'operaciones-supply-chain': ['bg-pontemred-50 text-pontemred-800', 'bg-pontemred-700', 'text-pontemred-700', 'border-pontemred-700'],
    'estrategia-competitiva': ['bg-pontempurple-50 text-pontempurple-600', 'bg-pontempurple-300', 'text-pontempurple-600', 'border-pontempurple-300'],
    'organizacion-transformacion': ['bg-pontempurple-100 text-pontempurple-800', 'bg-pontempurple-700', 'text-pontempurple-800', 'border-pontempurple-700'],
    'sector-publico-impacto': ['bg-pontemteal-100 text-pontemteal-900', 'bg-pontemteal-300', 'text-pontemteal-900', 'border-pontemteal-300'],
    'estimacion': ['bg-gray-100 text-gray-700', 'bg-gray-400', 'text-gray-600', 'border-gray-400'],
    'no-convencional': ['bg-gray-50 text-gray-600', 'bg-gray-300', 'text-gray-500', 'border-gray-300']
  }
  const casebookColors: [string, string, string, string] =
    ['bg-pontempurple-50 text-pontempurple-900', 'bg-pontempurple-900', 'text-pontempurple-900', 'border-pontempurple-900']

  const difficultyText: Record<CaseDifficulty, string> = {
    'l1-introductorio': 'text-pontemteal-700',
    'l2-intermedio': 'text-pontempurple-600',
    'l3-avanzado': 'text-pontemred-600'
  }

  const colors = (category?: CaseCategory | null) => category ? categoryColors[category] : casebookColors

  const getCategoryBadge = (category?: CaseCategory | null) => colors(category)[0]
  const getCategoryAccent = (category?: CaseCategory | null) => colors(category)[1]
  const getCategoryText = (category?: CaseCategory | null) => colors(category)[2]
  const getCategoryBorder = (category?: CaseCategory | null) => colors(category)[3]

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
