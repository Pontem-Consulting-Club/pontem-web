import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { getRequestProfile } from '~~/server/utils/requireCan'

const SIN_DATOS = { registered: 0, attended: 0, cancelled: 0, upcoming: 0 }

/**
 * Las inscripciones propias y las estadisticas que salen de ellas (MEM-5).
 *
 * Los numeros los cuenta la vista `my_registration_stats`, que se mira con los
 * permisos de quien pregunta. No hay contadores guardados que puedan
 * desincronizarse (FR-22).
 *
 * Ambas consultas filtran por la persona aunque RLS ya limite las filas: a
 * editores y admins, `registrations_select_staff` les deja ver las
 * inscripciones de todos, y sin el filtro la vista devolvia una fila por
 * persona y `maybeSingle()` fallaba con 500.
 */
export default defineEventHandler(async (event) => {
    const profile = await getRequestProfile(event)

    if (!profile) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Necesitas iniciar sesion.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const [{ data: rows, error }, { data: stats, error: statsError }] = await Promise.all([
        supabase
            .from('event_registrations')
            .select('id, status, attended, registered_at, Events(id, title, date, location)')
            .eq('profile_id', profile.id)
            .order('registered_at', { ascending: false }),
        supabase
            .from('my_registration_stats')
            .select('registered, attended, cancelled, upcoming')
            .eq('profile_id', profile.id)
            .maybeSingle()
    ])

    if (error || statsError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading registrations',
            message: (error ?? statsError)!.message
        })
    }

    return {
        registrations: (rows ?? []).map(row => ({
            id: row.id,
            status: row.status,
            attended: row.attended,
            event: row.Events
        })),
        // Sin inscripciones la vista no devuelve fila: eso son ceros, no un error.
        stats: stats ?? SIN_DATOS
    }
})
