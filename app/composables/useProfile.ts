import type { Database } from '~/types/database.types'
import { can as canDo, type AuthzProfile, type Capability } from '~~/shared/authz'

export type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * El perfil de quien esta con la sesion abierta, mas el chequeo de permisos.
 *
 * Se lee directo con el cliente de Supabase y no por una ruta del servidor: la
 * policy `profiles_select_own` ya limita la consulta a la propia fila.
 *
 * Ojo: `can()` aqui sirve para decidir que se muestra, nunca para autorizar. La
 * autorizacion de verdad vive en el servidor y en RLS (FR-08).
 */
export const useProfile = () => {
    const userId = useCurrentUserId()
    const supabase = useSupabaseClient<Database>()

    const { data: profile, refresh, status } = useAsyncData(
        'current-profile',
        async () => {
            if (!userId.value) return null

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId.value)
                .maybeSingle()

            if (error) return null
            return data
        },
        { watch: [userId], default: () => null }
    )

    const can = (capability: Capability) =>
        canDo(profile.value as AuthzProfile | null, capability)

    const isAdmin = computed(() => can('users.manage'))
    const isEditor = computed(() => can('content.edit'))
    const needsOnboarding = computed(() => profile.value?.state === 'invited')

    return { profile, refresh, status, can, isAdmin, isEditor, needsOnboarding }
}
