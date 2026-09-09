import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { getRequestProfile } from '~~/server/utils/requireCan'

/**
 * Cancelar la inscripcion propia (MEM-5, FR-19).
 *
 * Marca la fila como cancelada en vez de borrarla: el historial de quien se
 * inscribio y se bajo tambien es informacion util para organizar.
 */
export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    const eventId = Number(idParam)

    if (!idParam || Number.isNaN(eventId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el identificador del evento.'
        })
    }

    const profile = await getRequestProfile(event)

    if (!profile) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Necesitas iniciar sesion.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data, error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('profile_id', profile.id)
        .select('id')

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'No pudimos cancelar la inscripcion',
            message: error.message
        })
    }

    if (!data || data.length === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: 'No estabas inscrito en este evento.'
        })
    }

    return { message: 'Inscripcion cancelada' }
})
