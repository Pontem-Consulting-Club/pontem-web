import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'
import { isUserRole } from '~~/shared/authz'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Cambio de rol y de estado de otra persona (ADM-2, ADM-3).
 *
 * Las dos reglas duras (nadie se cambia el rol a si mismo, y nunca cero
 * administradores activos) las hace cumplir la base con triggers. Aqui se
 * repiten para poder responder con un mensaje que se entienda en vez de dejar
 * salir un error de Postgres en crudo.
 */
export default defineEventHandler(async (event) => {
    const actor = await requireCan(event, 'users.manage')

    const targetId = getRouterParam(event, 'id')
    if (!targetId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el identificador de la persona.'
        })
    }

    const body = await readBody<{ role?: string; state?: string }>(event)
    const payload: ProfileUpdate = {}

    if (body?.role !== undefined) {
        if (!isUserRole(body.role)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Rol invalido.'
            })
        }

        if (targetId === actor.id && body.role !== actor.role) {
            throw createError({
                statusCode: 409,
                statusMessage: 'No puedes cambiarte el rol a ti mismo. Pideselo a otra persona administradora.'
            })
        }

        payload.role = body.role
    }

    if (body?.state !== undefined) {
        if (!['invited', 'active', 'inactive'].includes(body.state)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Estado invalido.'
            })
        }
        payload.state = body.state as ProfileUpdate['state']
    }

    if (Object.keys(payload).length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No hay nada que cambiar.'
        })
    }

    const admin = serverSupabaseServiceRole<Database>(event)

    // ADM-5: comprobamos antes de escribir para poder explicar el motivo.
    const dropsAdmin = payload.role !== undefined && payload.role !== 'admin'
    const deactivates = payload.state !== undefined && payload.state !== 'active'

    if (dropsAdmin || deactivates) {
        const { count, error: countError } = await admin
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'admin')
            .eq('state', 'active')
            .neq('id', targetId)

        if (countError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Error comprobando administradores',
                message: countError.message
            })
        }

        if ((count ?? 0) === 0) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Es la unica cuenta administradora activa. Nombra a otra antes de cambiar esta.'
            })
        }
    }

    const { data, error } = await admin
        .from('profiles')
        .update(payload)
        .eq('id', targetId)
        .select('*')
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error updating user',
            message: error.message
        })
    }

    return data
})
