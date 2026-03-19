import type { Database } from '~~/app/types/database.types'

type ClubCoordination = Database['public']['Enums']['ClubCoordination']

export const TEAM_COORDINATIONS: ClubCoordination[] = [
  'DIRECTORS',
  'COMMS_MKT',
  'SOC_CONSULT',
  'FINANCE',
  'PEOPLE_MGMT',
  'LEARNING_DEV',
  'EXTERNAL_REL',
  'IT'
]

export const TEAM_COORDINATION_SET = new Set<string>(TEAM_COORDINATIONS)

export const isValidTeamCoordination = (value: string | null | undefined): value is ClubCoordination => {
  if (!value) return false
  return TEAM_COORDINATION_SET.has(value)
}
