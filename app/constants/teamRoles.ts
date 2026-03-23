import type { Database } from '~/types/database.types'

export type TeamCoordination = Database['public']['Enums']['ClubCoordination']

export const TEAM_COORDINATIONS: TeamCoordination[] = [
  'DIRECTORS',
  'COMMS_MKT',
  'SOC_CONSULT',
  'FINANCE',
  'PEOPLE_MGMT',
  'LEARNING_DEV',
  'EXTERNAL_REL',
  'IT'
]

export const TEAM_COORDINATION_LABELS: Record<TeamCoordination, string> = {
  DIRECTORS: 'Directores',
  COMMS_MKT: 'Comunicaciones & Marketing',
  SOC_CONSULT: 'Consultoría Social',
  FINANCE: 'Finanzas',
  PEOPLE_MGMT: 'Gestión de Personas',
  LEARNING_DEV: 'Learning & Development',
  EXTERNAL_REL: 'Relaciones Externas',
  IT: 'Tecnologías de la Información'
}

export const TEAM_COORDINATION_ICONS: Record<TeamCoordination, string> = {
  DIRECTORS: 'i-lucide-crown',
  COMMS_MKT: 'i-lucide-megaphone',
  SOC_CONSULT: 'i-lucide-heart-handshake',
  FINANCE: 'i-lucide-bar-chart-2',
  PEOPLE_MGMT: 'i-lucide-users',
  LEARNING_DEV: 'i-lucide-graduation-cap',
  EXTERNAL_REL: 'i-lucide-globe',
  IT: 'i-lucide-cpu'
}

export const TEAM_COORDINATION_OPTIONS: Array<{ label: string; value: TeamCoordination }> = TEAM_COORDINATIONS.map((coordination) => ({
  label: TEAM_COORDINATION_LABELS[coordination],
  value: coordination
}))

const TEAM_COORDINATION_SET = new Set<TeamCoordination>(TEAM_COORDINATIONS)

export const isValidTeamCoordination = (value: string | null | undefined): value is TeamCoordination => {
  if (!value) return false
  return TEAM_COORDINATION_SET.has(value as TeamCoordination)
}
