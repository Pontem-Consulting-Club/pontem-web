import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { getRequestProfile } from '~~/server/utils/requireCan'
import { isValidTeamCoordination } from '~~/server/utils/teamRoles'
import { can, type AuthzProfile } from '~~/shared/authz'

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
            message: 'Necesitas iniciar sesión.'
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
            statusMessage: 'Coordinación inválida.'
        })
    }

    let generation: number | null = null
    if (body?.generation !== undefined && body?.generation !== null && body.generation !== '') {
        generation = Number(body.generation)
        if (Number.isNaN(generation) || generation < 1990 || generation > 2100) {
            throw createError({
                statusCode: 400,
                statusMessage: 'El año de generación no parece válido.'
            })
        }
    }

    // Coordinacion, generacion y perfil publico son datos del club: un `usuario`
    // no los tiene. La vista `public_profiles` tampoco lo mostraria.
    const isClubMember = can(profile as AuthzProfile, 'profile.publish')
    const isPublic = isClubMember && (body?.is_public === true || body?.is_public === 'true')

    const payload: ProfileUpdate = {
        display_name: displayName,
        bio: normalize(body?.bio),
        coordination: isClubMember ? coordination as ProfileUpdate['coordination'] : null,
        generation: isClubMember ? generation : null,
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
