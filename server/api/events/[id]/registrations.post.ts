import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { getRequestProfile } from '~~/server/utils/requireCan'

type EventRow = Database['public']['Tables']['Events']['Row']

/**
 * Inscripcion a un evento (MEM-4, VIS-3).
 *
 * Dos caminos por la misma puerta:
 *  - con sesion, se inscribe a nombre propio y RLS hace de red de seguridad;
 *  - sin sesion, solo si el evento es `open`, y la fila la escribe el servidor
 *    con la clave de servicio porque `anon` no tiene policy de insert (FR-33).
 *
 * El cupo no se comprueba aqui: lo hace un trigger en la base, porque dos
 * personas pulsando a la vez pasarian las dos por un conteo hecho en el
 * servidor (FR-20).
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

    const supabase = await serverSupabaseClient<Database>(event)

    const { data: target, error: eventError } = await supabase
        .from('Events')
        .select('id, title, date, registration_mode, registration_open')
        .eq('id', eventId)
        .maybeSingle<Pick<EventRow, 'id' | 'title' | 'date' | 'registration_mode' | 'registration_open'>>()

    if (eventError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading event',
            message: eventError.message
        })
    }

    if (!target) {
        throw createError({ statusCode: 404, statusMessage: 'Ese evento no existe.' })
    }

    if (target.registration_mode === 'none') {
        throw createError({
            statusCode: 409,
            statusMessage: 'Este evento no requiere inscripcion.'
        })
    }

    if (!target.registration_open) {
        throw createError({
            statusCode: 409,
            statusMessage: 'La inscripcion para este evento esta cerrada.'
        })
    }

    if (target.date && new Date(target.date) <= new Date()) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Este evento ya ocurrio.'
        })
    }

    const profile = await getRequestProfile(event)

    // ---------------------------------------------------------------- miembro
    if (profile) {
        const { error } = await supabase
            .from('event_registrations')
            .insert({ event_id: eventId, profile_id: profile.id })

        if (error) {
            if (isDuplicate(error.message)) {
                return reviveRegistration(
                    supabase.from('event_registrations')
                        .update({ status: 'registered' })
                        .eq('event_id', eventId)
                        .eq('profile_id', profile.id)
                        .eq('status', 'cancelled')
                        .select('id')
                )
            }
            throw translateRegistrationError(error.message)
        }

        return { message: 'Inscripcion confirmada' }
    }

    // --------------------------------------------------------------- invitado
    if (target.registration_mode !== 'open') {
        throw createError({
            statusCode: 401,
            statusMessage: 'Este evento es solo para miembros. Inicia sesion para inscribirte.'
        })
    }

    const body = await readBody<{ guest_name?: string; guest_email?: string }>(event)

    // La funcion valida, limita el ritmo e inserta, todo dentro de Postgres. La
    // ruta solo aporta la IP, que la base no puede ver por su cuenta, y traduce
    // el codigo que devuelve a un estado HTTP.
    const { data: outcome, error } = await supabase.rpc('register_guest', {
        p_event_id: eventId,
        p_name: body?.guest_name?.toString() ?? '',
        p_email: body?.guest_email?.toString() ?? '',
        p_source: getRequestIP(event, { xForwardedFor: true }) ?? 'desconocida'
    })

    if (error) {
        throw translateRegistrationError(error.message)
    }

    if (outcome !== 'ok') {
        throw guestOutcomeError(outcome as string)
    }

    return { message: 'Inscripcion confirmada' }
})

/**
 * Los codigos que devuelve `register_guest`. La funcion no lanza excepciones
 * para los casos previstos, porque una excepcion desharia tambien el contador
 * del limite de ritmo.
 */
const GUEST_OUTCOMES: Record<string, { status: number; message: string }> = {
    falta_nombre:    { status: 400, message: 'Escribe tu nombre.' },
    correo_invalido: { status: 400, message: 'Escribe un correo valido.' },
    limite:          { status: 429, message: 'Demasiados intentos. Prueba de nuevo en unos minutos.' },
    no_existe:       { status: 404, message: 'Ese evento no existe.' },
    sin_invitados:   { status: 409, message: 'Este evento no admite invitados.' },
    cerrado:         { status: 409, message: 'La inscripcion para este evento esta cerrada.' },
    ya_paso:         { status: 409, message: 'Este evento ya ocurrio.' },
    ya_inscrito:     { status: 409, message: 'Ya estas inscrito en este evento.' },
    sin_cupo:        { status: 409, message: 'Este evento ya no tiene cupos disponibles.' }
}

const guestOutcomeError = (outcome: string) => {
    const known = GUEST_OUTCOMES[outcome]

    if (!known) {
        return createError({
            statusCode: 500,
            statusMessage: 'No pudimos completar la inscripcion.'
        })
    }

    return createError({
        statusCode: known.status,
        statusMessage: known.message
    })
}

const isDuplicate = (message: string) =>
    message.includes('event_registrations_one_per_member')
    || message.includes('event_registrations_one_per_guest')

/**
 * Reactiva una inscripcion cancelada en vez de rechazarla por duplicada.
 *
 * Cancelar marca la fila y no la borra (FR-19), y el indice unico no distingue
 * el estado. Sin esto, quien se baja de una actividad por error no podria
 * volver a inscribirse nunca.
 *
 * Si la actualizacion no toca ninguna fila es porque la inscripcion sigue
 * vigente: ahi si corresponde decir que ya estaba inscrito.
 */
const reviveRegistration = async (
    query: PromiseLike<{ data: { id: number }[] | null; error: { message: string } | null }>
) => {
    const { data, error } = await query

    if (error) {
        throw translateRegistrationError(error.message)
    }

    if (!data || data.length === 0) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Ya estas inscrito en este evento.'
        })
    }

    return { message: 'Inscripcion confirmada' }
}

/**
 * Traduce los errores de la base a algo que se entienda. Los indices y el
 * trigger de cupo son la autoridad; aqui solo se les pone palabras.
 */
const translateRegistrationError = (message: string) => {
    if (message.includes('Demasiados intentos')) {
        return createError({ statusCode: 429, statusMessage: message })
    }

    if (message.includes('Escribe tu nombre') || message.includes('Escribe un correo valido')) {
        return createError({ statusCode: 400, statusMessage: message })
    }

    if (message.includes('no existe')) {
        return createError({ statusCode: 404, statusMessage: message })
    }

    if (message.includes('no admite invitados')
        || message.includes('esta cerrada')
        || message.includes('ya ocurrio')
        || message.includes('Ya estas inscrito')) {
        return createError({ statusCode: 409, statusMessage: message })
    }

    if (message.includes('cupos disponibles')) {
        return createError({
            statusCode: 409,
            statusMessage: 'Este evento ya no tiene cupos disponibles.'
        })
    }

    if (message.includes('event_registrations_one_per_member')
        || message.includes('event_registrations_one_per_guest')) {
        return createError({
            statusCode: 409,
            statusMessage: 'Ya estas inscrito en este evento.'
        })
    }

    return createError({
        statusCode: 500,
        statusMessage: 'No pudimos completar la inscripcion',
        message
    })
}
