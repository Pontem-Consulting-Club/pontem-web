import { Constants } from '~/types/database.types'
import type { Database } from '~/types/database.types'

export type CaseCategory = Database['public']['Enums']['CaseCategory']
export type CaseDifficulty = Database['public']['Enums']['CaseDifficulty']
export type CaseResourceKind = Database['public']['Enums']['CaseResourceKind']

// Taxonomia de casos MBB: la categoria se define por la pregunta del cliente. Los
// slugs viven en la base; los nombres visibles, aqui, para renombrar sin migrar.
export const CASE_CATEGORIES: readonly CaseCategory[] = Constants.public.Enums.CaseCategory

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  'rentabilidad': 'Rentabilidad',
  'crecimiento-ingresos': 'Crecimiento de ingresos',
  'entrada-mercado': 'Entrada a mercado',
  'ma-inversion': 'M&A e inversión',
  'pricing': 'Pricing',
  'operaciones-supply-chain': 'Operaciones y supply chain',
  'estrategia-competitiva': 'Estrategia competitiva',
  'organizacion-transformacion': 'Organización y transformación',
  'sector-publico-impacto': 'Sector público e impacto',
  'estimacion': 'Estimación',
  'no-convencional': 'No convencional'
}

export const CASE_CATEGORY_ICONS: Record<CaseCategory, string> = {
  'rentabilidad': 'i-lucide-trending-down',
  'crecimiento-ingresos': 'i-lucide-trending-up',
  'entrada-mercado': 'i-lucide-door-open',
  'ma-inversion': 'i-lucide-handshake',
  'pricing': 'i-lucide-tag',
  'operaciones-supply-chain': 'i-lucide-settings-2',
  'estrategia-competitiva': 'i-lucide-swords',
  'organizacion-transformacion': 'i-lucide-users',
  'sector-publico-impacto': 'i-lucide-heart-handshake',
  'estimacion': 'i-lucide-calculator',
  'no-convencional': 'i-lucide-puzzle'
}

// Los casebooks son colecciones, no un caso: no tienen categoria y van en su
// propia pestana.
export const CASEBOOK_TYPE = 'Casebook'
export const CASEBOOK_LABEL = 'Casebooks'
export const CASEBOOK_ICON = 'i-lucide-graduation-cap'

// Pestana del listado: una categoria o la de casebooks.
export type CaseStudyTab = CaseCategory | 'casebooks'

export const getCaseCategoryLabel = (category?: CaseCategory | null) =>
  category ? CASE_CATEGORY_LABELS[category] : 'Casebook'

export const getCaseCategoryIcon = (category?: CaseCategory | null) =>
  category ? CASE_CATEGORY_ICONS[category] : CASEBOOK_ICON

export const CASE_CATEGORY_OPTIONS: Array<{ label: string, value: CaseCategory }> = CASE_CATEGORIES.map(category => ({
  label: CASE_CATEGORY_LABELS[category],
  value: category
}))

export const CASE_DIFFICULTIES: readonly CaseDifficulty[] = Constants.public.Enums.CaseDifficulty

export const CASE_DIFFICULTY_LABELS: Record<CaseDifficulty, string> = {
  'l1-introductorio': 'Introductorio',
  'l2-intermedio': 'Intermedio',
  'l3-avanzado': 'Avanzado'
}

export const CASE_DIFFICULTY_OPTIONS: Array<{ label: string, value: CaseDifficulty }> = CASE_DIFFICULTIES.map(difficulty => ({
  label: CASE_DIFFICULTY_LABELS[difficulty],
  value: difficulty
}))

export const CASE_RESOURCE_KINDS: CaseResourceKind[] = [
  'APUNTE',
  'DATASET',
  'MASTERCLASS'
]

export const CASE_RESOURCE_KIND_LABELS: Record<CaseResourceKind, string> = {
  APUNTE: 'Apunte Teórico',
  DATASET: 'Dataset',
  MASTERCLASS: 'Masterclass'
}

export const CASE_RESOURCE_KIND_ICONS: Record<CaseResourceKind, string> = {
  APUNTE: 'i-lucide-file-text',
  DATASET: 'i-lucide-bar-chart-2',
  MASTERCLASS: 'i-lucide-play-circle'
}

export const CASE_RESOURCE_KIND_OPTIONS: Array<{ label: string, value: CaseResourceKind }> = CASE_RESOURCE_KINDS.map(kind => ({
  label: CASE_RESOURCE_KIND_LABELS[kind],
  value: kind
}))

const CASE_CATEGORY_SET = new Set<CaseCategory>(CASE_CATEGORIES)
const CASE_DIFFICULTY_SET = new Set<CaseDifficulty>(CASE_DIFFICULTIES)
const CASE_RESOURCE_KIND_SET = new Set<CaseResourceKind>(CASE_RESOURCE_KINDS)

export const isValidCaseCategory = (value: string | null | undefined): value is CaseCategory => {
  if (!value) return false
  return CASE_CATEGORY_SET.has(value as CaseCategory)
}

export const isValidCaseDifficulty = (value: string | null | undefined): value is CaseDifficulty => {
  if (!value) return false
  return CASE_DIFFICULTY_SET.has(value as CaseDifficulty)
}

export const isValidCaseResourceKind = (value: string | null | undefined): value is CaseResourceKind => {
  if (!value) return false
  return CASE_RESOURCE_KIND_SET.has(value as CaseResourceKind)
}
