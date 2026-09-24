import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/app/types/database.types'
import { can, type AuthzProfile, type Capability } from '~~/shared/authz'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

/**
 * Carga el perfil de quien hace la peticion. Devuelve null si no hay sesion.
 *
 * Lee con el cliente del usuario a proposito: la policy `profiles_select_own`
 * ya limita la consulta a su propia fila, asi que no hace falta la clave
 * secreta para algo tan rutinario.
 */
export const getRequestProfile = async (event: H3Event): Promise<ProfileRow | null> => {
    // Ojo: en @nuxtjs/supabase 2.x esto devuelve los claims del JWT, no un
    // objeto User. El identificador viene en `sub`, y `id` no existe.
    const claims = await serverSupabaseUser(event)
    if (!claims?.sub) return null

    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', claims.sub)
        .maybeSingle()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading profile',
            message: error.message
        })
    }

    return data
}

/**
 * Corta la peticion si quien la hace no tiene la capacidad pedida (FR-08).
 *
 * 401 si no hay sesion y 403 si la hay pero no alcanza: son cosas distintas y
 * el cliente necesita distinguirlas para saber si mandar a /login o mostrar
 * "no tienes acceso a esta seccion" (EDI-3).
 */
export const requireCan = async (event: H3Event, capability: Capability): Promise<ProfileRow> => {
    const profile = await getRequestProfile(event)

    if (!profile) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Necesitas iniciar sesion.'
        })
    }

    if (!can(profile as AuthzProfile, capability)) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: 'No tienes acceso a esta seccion.'
        })
    }

    return profile
}
