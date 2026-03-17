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

export type TeamRole = (typeof TEAM_ROLES)[number]
