export const TEAM_ROLES = [
  'Dirección',
  'Consultoría Social',
  'Tecnología e Innovación',
  'Relaciones Externas',
  'Comunicaciones y Marketing',
  'Gestión de Personas',
  'Finanzas',
  'Proyectos Empresariales'
] as const

export const TEAM_ROLE_SET = new Set<string>(TEAM_ROLES)

export const isValidTeamRole = (value: string | null | undefined): value is (typeof TEAM_ROLES)[number] => {
  if (!value) return false
  return TEAM_ROLE_SET.has(value)
}
