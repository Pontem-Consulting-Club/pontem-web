export const TEAM_ROLES = [
  'directores',
  'comunicaciones & marketing',
  'consultoría social',
  'finanzas',
  'gestión de personas',
  'learning & development',
  'relaciones externas',
  'tecnologías de la información'
] as const

export const TEAM_ROLE_SET = new Set<string>(TEAM_ROLES)

export const isValidTeamRole = (value: string | null | undefined): value is (typeof TEAM_ROLES)[number] => {
  if (!value) return false
  return TEAM_ROLE_SET.has(value)
}
