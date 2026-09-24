import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

/**
 * Perfil publico por handle (VIS-1).
 *
 * Lee la vista `public_profiles`, no la tabla: la vista ya filtra por
 * `is_public` y estado activo, y expone solo las columnas publicas. Ni el rol
 * ni el correo ni las estadisticas salen por aqui (FR-14).
 */
export default defineEventHandler(async (event) => {
    const handle = getRouterParam(event, 'handle')?.toLowerCase().trim()

    if (!handle) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el handle.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('handle', handle)
        .maybeSingle()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading profile',
            message: error.message
        })
    }

    if (!data) {
        throw createError({
            statusCode: 404,
            statusMessage: 'No encontramos ese perfil.'
        })
    }

    return data
})
