import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { getRequestProfile } from '~~/server/utils/requireCan'
import { isValidTeamCoordination } from '~~/server/utils/teamRoles'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Edicion del perfil propio (FR-13).
 *
 * Solo se arman aqui los campos que la persona puede tocar. Rol, estado,
 * entitlement del coach y handle no aparecen: aunque alguien los mandara en el
 * cuerpo, el trigger `profiles_guard_privileged_columns` los revierte igual.
 */
export default defineEventHandler(async (event) => {
    const profile = await getRequestProfile(event)

    if (!profile) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Necesitas iniciar sesion.'
        })
    }

    const body = await readBody<Record<string, unknown>>(event)

    const normalize = (value: unknown) => {
        if (value === undefined || value === null) return null
        const trimmed = value.toString().trim()
        return trimmed === '' ? null : trimmed
    }

    const displayName = normalize(body?.display_name)
    if (!displayName) {
        throw createError({
            statusCode: 400,
            statusMessage: 'El nombre para mostrar es obligatorio.'
        })
    }

    const coordination = normalize(body?.coordination)
    if (coordination && !isValidTeamCoordination(coordination)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Coordinacion invalida.'
        })
    }

    let generation: number | null = null
    if (body?.generation !== undefined && body?.generation !== null && body.generation !== '') {
        generation = Number(body.generation)
        if (Number.isNaN(generation) || generation < 1990 || generation > 2100) {
            throw createError({
                statusCode: 400,
                statusMessage: 'El anio de generacion no parece valido.'
            })
        }
    }

    const isPublic = body?.is_public === true || body?.is_public === 'true'

    const payload: ProfileUpdate = {
        display_name: displayName,
        bio: normalize(body?.bio),
        coordination: coordination as ProfileUpdate['coordination'],
        generation,
        is_public: isPublic,
        // MEM-1: aceptar la invitacion y completar el perfil es lo que activa la
        // cuenta. Es la unica transicion de estado que permite el trigger.
        state: profile.state === 'invited' ? 'active' : profile.state
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profile.id)
        .select('*')
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error updating profile',
            message: error.message
        })
    }

    return data
})
