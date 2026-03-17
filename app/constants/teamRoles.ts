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

export type TeamRole = typeof TEAM_ROLES[number]

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  'directores': 'Directores',
  'comunicaciones & marketing': 'Comunicaciones & Marketing',
  'consultoría social': 'Consultoría Social',
  'finanzas': 'Finanzas',
  'gestión de personas': 'Gestión de Personas',
  'learning & development': 'Learning & Development',
  'relaciones externas': 'Relaciones Externas',
  'tecnologías de la información': 'Tecnologías de la Información'
}

export const TEAM_ROLE_OPTIONS: Array<{ label: string; value: string }> = TEAM_ROLES.map((role) => ({
  label: TEAM_ROLE_LABELS[role],
  value: role
}))
