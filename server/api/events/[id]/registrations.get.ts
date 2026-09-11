import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'

/**
 * Lista de inscritos de un evento (EDI-2, FR-21).
 *
 * Junta miembros e invitados en una sola lista, marcando cuales son invitados
 * para que en la puerta se sepa a quien se esta esperando.
 *
 * Los nombres salen de `event_registration_roster()` y no de un join a
 * profiles: las policies de profiles no dejan a un editor leer otras cuentas, y
 * el join le devolvia "Sin nombre" en cada miembro.
 */
export default defineEventHandler(async (event) => {
    await requireCan(event, 'registrations.read')

    const idParam = getRouterParam(event, 'id')
    const eventId = Number(idParam)

    if (!idParam || Number.isNaN(eventId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el identificador del evento.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data, error } = await supabase.rpc('event_registration_roster', { p_event_id: eventId })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading registrations',
            message: error.message
        })
    }

    return data ?? []
})
