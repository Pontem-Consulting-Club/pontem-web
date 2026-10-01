import { Constants } from '~~/app/types/database.types'
import type { Database } from '~~/app/types/database.types'

type CaseCategory = Database['public']['Enums']['CaseCategory']
type CaseDifficulty = Database['public']['Enums']['CaseDifficulty']
type CaseResourceKind = Database['public']['Enums']['CaseResourceKind']

export const CASE_CATEGORIES: readonly CaseCategory[] = Constants.public.Enums.CaseCategory
export const CASE_DIFFICULTIES: readonly CaseDifficulty[] = Constants.public.Enums.CaseDifficulty
export const CASE_RESOURCE_KINDS: readonly CaseResourceKind[] = Constants.public.Enums.CaseResourceKind

// Los casebooks son colecciones sin categoria; todo lo demas la exige.
export const CASEBOOK_TYPE = 'Casebook'

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
