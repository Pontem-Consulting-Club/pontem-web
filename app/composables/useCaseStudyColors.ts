import type { CaseCategory, CaseDifficulty } from '~/constants/caseStudies'

/**
 * Mapea las categorias y dificultades de los casos a la paleta de Pontem.
 * Mismo enfoque que `useNewsTypeColor`, para que los colores vivan en un solo lugar.
 *
 * Sin categoria es un casebook (una coleccion, no un caso): lleva su propio color
 * en vez del gris de "sin dato".
 */
export const useCaseStudyColors = () => {
  // [etiqueta, acento, texto, borde]. Cada categoría es una familia de color
  // (rojo, turquesa, morado, gris) con su propio tono de acento. Etiqueta en tinte
  // 50 con texto 800 y texto suelto en 700: todo pasa 4.5:1. Las clases van
  // completas para que Tailwind las encuentre.
  const categoryColors: Record<CaseCategory, [string, string, string, string]> = {
    'rentabilidad': ['bg-primary-50 text-primary-800', 'bg-primary-500', 'text-primary-700', 'border-primary-500'],
    'crecimiento-ingresos': ['bg-secondary-50 text-secondary-800', 'bg-secondary-300', 'text-secondary-700', 'border-secondary-300'],
    'entrada-mercado': ['bg-secondary-50 text-secondary-800', 'bg-secondary-600', 'text-secondary-700', 'border-secondary-600'],
    'ma-inversion': ['bg-tertiary-50 text-tertiary-800', 'bg-tertiary-500', 'text-tertiary-700', 'border-tertiary-500'],
    'pricing': ['bg-primary-50 text-primary-800', 'bg-primary-300', 'text-primary-700', 'border-primary-300'],
    'operaciones-supply-chain': ['bg-primary-50 text-primary-800', 'bg-primary-800', 'text-primary-700', 'border-primary-800'],
    'estrategia-competitiva': ['bg-tertiary-50 text-tertiary-800', 'bg-tertiary-300', 'text-tertiary-700', 'border-tertiary-300'],
    'organizacion-transformacion': ['bg-tertiary-50 text-tertiary-800', 'bg-tertiary-800', 'text-tertiary-700', 'border-tertiary-800'],
    'sector-publico-impacto': ['bg-secondary-50 text-secondary-800', 'bg-secondary-900', 'text-secondary-700', 'border-secondary-900'],
    'estimacion': ['bg-neutral-50 text-neutral-800', 'bg-neutral-400', 'text-neutral-700', 'border-neutral-400'],
    'no-convencional': ['bg-neutral-50 text-neutral-800', 'bg-neutral-300', 'text-neutral-700', 'border-neutral-300']
  }
  const casebookColors: [string, string, string, string] =
    ['bg-tertiary-50 text-tertiary-800', 'bg-tertiary-900', 'text-tertiary-700', 'border-tertiary-900']

  const difficultyText: Record<CaseDifficulty, string> = {
    'l1-introductorio': 'text-secondary-700',
    'l2-intermedio': 'text-tertiary-700',
    'l3-avanzado': 'text-primary-700'
  }

  const colors = (category?: CaseCategory | null) => category ? categoryColors[category] : casebookColors

  const getCategoryBadge = (category?: CaseCategory | null) => colors(category)[0]
  const getCategoryAccent = (category?: CaseCategory | null) => colors(category)[1]
  const getCategoryText = (category?: CaseCategory | null) => colors(category)[2]
  const getCategoryBorder = (category?: CaseCategory | null) => colors(category)[3]

  const getDifficultyText = (difficulty?: CaseDifficulty | null) =>
    difficulty ? difficultyText[difficulty] : 'text-muted'

  return {
    getCategoryBadge,
    getCategoryAccent,
    getCategoryText,
    getCategoryBorder,
    getDifficultyText
  }
}
