import type { Database } from '~~/app/types/database.types'

type RegistrationMode = Database['public']['Enums']['registration_mode']

const MODES: RegistrationMode[] = ['none', 'members_only', 'open']

/**
 * Interpreta los campos de inscripcion que llegan en el formulario de un evento
 * (FR-32, FR-34).
 *
 * Vienen como texto porque el formulario se envia con FormData, asi que aqui se
 * reconstruyen los tipos y se rechaza lo que no calce, en vez de dejar que la
 * base reviente con un error que no dice nada.
 */
export const parseEventRegistrationFields = (body: Record<string, unknown>) => {
    const rawMode = body.registration_mode?.toString().trim()
    const mode: RegistrationMode = rawMode && MODES.includes(rawMode as RegistrationMode)
        ? rawMode as RegistrationMode
        : 'none'

    const rawCapacity = body.capacity?.toString().trim()
    let capacity: number | null = null

    if (rawCapacity) {
        capacity = Number(rawCapacity)
        if (!Number.isInteger(capacity) || capacity < 1) {
            throw createError({
                statusCode: 400,
                statusMessage: 'El cupo tiene que ser un numero entero mayor que cero.'
            })
        }
    }

    // Sin inscripcion no hay cupo que guardar: dejarlo puesto confundiria a
    // quien vuelva a abrir el formulario mas adelante.
    if (mode === 'none') {
        capacity = null
    }

    const rawOpen = body.registration_open?.toString().trim().toLowerCase()
    const registrationOpen = rawOpen === undefined || rawOpen === '' ? true : rawOpen === 'true'

    return {
        registration_mode: mode,
        capacity,
        registration_open: registrationOpen
    }
}
