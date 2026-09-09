import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'

/**
 * Marcar asistencia despues de la actividad (FR-21).
 *
 * Solo toca la columna `attended`: el estado de la inscripcion es cosa de quien
 * se inscribio, no de quien pasa lista.
 */
export default defineEventHandler(async (event) => {
    await requireCan(event, 'registrations.manage')

    const registrationId = Number(getRouterParam(event, 'registrationId'))
    const eventId = Number(getRouterParam(event, 'id'))

    if (Number.isNaN(registrationId) || Number.isNaN(eventId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el identificador de la inscripcion.'
        })
    }

    const body = await readBody<{ attended?: unknown }>(event)

    if (typeof body?.attended !== 'boolean') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Indica si la persona asistio o no.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data, error } = await supabase
        .from('event_registrations')
        .update({ attended: body.attended })
        .eq('id', registrationId)
        .eq('event_id', eventId)
        .select('id, attended')
        .maybeSingle()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'No pudimos guardar la asistencia',
            message: error.message
        })
    }

    if (!data) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Esa inscripcion no existe.'
        })
    }

    return data
})
