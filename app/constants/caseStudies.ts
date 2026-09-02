import type { Database } from '~/types/database.types'

export type CaseCategory = Database['public']['Enums']['CaseCategory']
export type CaseDifficulty = Database['public']['Enums']['CaseDifficulty']
export type CaseResourceKind = Database['public']['Enums']['CaseResourceKind']

export const CASE_CATEGORIES: CaseCategory[] = [
  'ESTRATEGIA',
  'OPERACIONES',
  'FINANZAS',
  'MARKETING',
  'IMPACTO_SOCIAL'
]

export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  ESTRATEGIA: 'Estrategia',
  OPERACIONES: 'Operaciones',
  FINANZAS: 'Finanzas',
  MARKETING: 'Marketing',
  IMPACTO_SOCIAL: 'Impacto Social'
}

export const CASE_CATEGORY_ICONS: Record<CaseCategory, string> = {
  ESTRATEGIA: 'i-lucide-target',
  OPERACIONES: 'i-lucide-settings-2',
  FINANZAS: 'i-lucide-bar-chart-2',
  MARKETING: 'i-lucide-megaphone',
  IMPACTO_SOCIAL: 'i-lucide-heart-handshake'
}

export const CASE_CATEGORY_OPTIONS: Array<{ label: string, value: CaseCategory }> = CASE_CATEGORIES.map(category => ({
  label: CASE_CATEGORY_LABELS[category],
  value: category
}))

export const CASE_DIFFICULTIES: CaseDifficulty[] = [
  'FACIL',
  'MEDIO',
  'DIFICIL',
  'EXPERTO'
]

export const CASE_DIFFICULTY_LABELS: Record<CaseDifficulty, string> = {
  FACIL: 'Fácil',
  MEDIO: 'Media',
  DIFICIL: 'Alta',
  EXPERTO: 'Experto'
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
