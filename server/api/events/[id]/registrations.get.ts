import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'

/**
 * Lista de inscritos de un evento (EDI-2, FR-21).
 *
 * Junta miembros e invitados en una sola lista, marcando cuales son invitados
 * para que en la puerta se sepa a quien se esta esperando.
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

    const { data, error } = await supabase
        .from('event_registrations')
        .select('id, status, attended, registered_at, guest_name, guest_email, profile_id, profiles(display_name, coordination)')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: true })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading registrations',
            message: error.message
        })
    }

    return (data ?? []).map((row) => ({
        id: row.id,
        status: row.status,
        attended: row.attended,
        registered_at: row.registered_at,
        is_guest: row.profile_id === null,
        name: row.profile_id ? (row.profiles?.display_name ?? 'Sin nombre') : (row.guest_name ?? 'Invitado'),
        detail: row.profile_id ? (row.profiles?.coordination ?? null) : row.guest_email
    }))
})
