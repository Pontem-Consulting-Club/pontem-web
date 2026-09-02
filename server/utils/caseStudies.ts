import type { Database } from '~~/app/types/database.types'

type CaseCategory = Database['public']['Enums']['CaseCategory']
type CaseDifficulty = Database['public']['Enums']['CaseDifficulty']
type CaseResourceKind = Database['public']['Enums']['CaseResourceKind']

export const CASE_CATEGORIES: CaseCategory[] = [
  'ESTRATEGIA',
  'OPERACIONES',
  'FINANZAS',
  'MARKETING',
  'IMPACTO_SOCIAL'
]

export const CASE_DIFFICULTIES: CaseDifficulty[] = [
  'FACIL',
  'MEDIO',
  'DIFICIL',
  'EXPERTO'
]

export const CASE_RESOURCE_KINDS: CaseResourceKind[] = [
  'APUNTE',
  'DATASET',
  'MASTERCLASS'
]

const CASE_CATEGORY_SET = new Set<string>(CASE_CATEGORIES)
const CASE_DIFFICULTY_SET = new Set<string>(CASE_DIFFICULTIES)
const CASE_RESOURCE_KIND_SET = new Set<string>(CASE_RESOURCE_KINDS)

export const isValidCaseCategory = (value: string | null | undefined): value is CaseCategory => {
  if (!value) return false
  return CASE_CATEGORY_SET.has(value)
}

export const isValidCaseDifficulty = (value: string | null | undefined): value is CaseDifficulty => {
  if (!value) return false
  return CASE_DIFFICULTY_SET.has(value)
}

export const isValidCaseResourceKind = (value: string | null | undefined): value is CaseResourceKind => {
  if (!value) return false
  return CASE_RESOURCE_KIND_SET.has(value)
}
