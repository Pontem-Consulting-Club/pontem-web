import type { Database } from '~~/app/types/database.types'

export type UserRole = Database['public']['Enums']['user_role']
export type ProfileState = Database['public']['Enums']['profile_state']

/**
 * El unico lugar donde un rol se traduce a lo que puede hacer (FR-07).
 *
 * Ninguna ruta ni componente compara `role === 'admin'` por su cuenta: todo pasa
 * por `can()`, `requireCan()` o `useCan()`. Esa es la costura que permite
 * cambiar mas adelante a una tabla de permisos sin tocar cada llamada.
 *
 * La tabla refleja la matriz de permisos del documento de requisitos. Si aqui y
 * el documento dejan de coincidir, uno de los dos esta mal.
 */
export const CAPABILITIES = {
    admin: [
        'content.edit',
        'registrations.read',
        'registrations.manage',
        'users.manage'
    ],
    editor: [
        'content.edit',
        'registrations.read',
        'registrations.manage'
    ],
    member: []
} as const satisfies Record<UserRole, readonly string[]>

export type Capability = (typeof CAPABILITIES)[UserRole][number]

export interface AuthzProfile {
    role: UserRole
    state: ProfileState
}

/**
 * Una cuenta desactivada no conserva permisos aunque su sesion siga viva
 * (FR-03), y una invitada todavia no tiene ninguno hasta terminar el onboarding.
 * La misma regla vive en `public.auth_role()` del lado de la base.
 */
export const can = (
    profile: AuthzProfile | null | undefined,
    capability: Capability
): boolean => {
    if (!profile || profile.state !== 'active') return false

    const granted: readonly string[] = CAPABILITIES[profile.role]
    return granted.includes(capability)
}

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    editor: 'Editor de contenido',
    member: 'Miembro'
}

export const PROFILE_STATE_LABELS: Record<ProfileState, string> = {
    invited: 'Invitado',
    active: 'Activo',
    inactive: 'Inactivo'
}

export const USER_ROLES: UserRole[] = ['admin', 'editor', 'member']

export const isUserRole = (value: unknown): value is UserRole =>
    typeof value === 'string' && (USER_ROLES as string[]).includes(value)
