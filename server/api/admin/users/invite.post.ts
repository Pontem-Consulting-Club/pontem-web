import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'
import { isUserRole, type UserRole } from '~~/shared/authz'

/**
 * Invitacion por correo (ADM-1, FR-02).
 *
 * Supabase manda el correo y la persona elige su clave: Pontem nunca ve ni
 * guarda una contrasena (FR-05). Desde el registro abierto el trigger crea todo
 * perfil como `usuario` y activo, asi que aqui se le pone siempre el rol pedido
 * y se deja `invited` para que termine el onboarding.
 */
export default defineEventHandler(async (event) => {
    await requireCan(event, 'users.manage')

    const body = await readBody<{ email?: string; role?: string; display_name?: string }>(event)

    const email = body?.email?.toString().trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Escribe un correo válido.'
        })
    }

    const role: UserRole = isUserRole(body?.role) ? body.role : 'member'
    const displayName = body?.display_name?.toString().trim() || undefined

    const admin = serverSupabaseServiceRole<Database>(event)

    // Sin redirectTo, el enlace deja a la persona en la portada con una sesion
    // abierta y sin contrasena, sin ninguna pista de que hacer.
    const origin = getRequestURL(event).origin

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: displayName ? { display_name: displayName } : undefined,
        redirectTo: `${origin}/nueva-clave?bienvenida=1`
    })

    if (error) {
        // El caso corriente es invitar a alguien que ya tiene cuenta.
        const alreadyExists = error.message.toLowerCase().includes('already')
        throw createError({
            statusCode: alreadyExists ? 409 : 500,
            statusMessage: alreadyExists
                ? 'Esa persona ya tiene una cuenta.'
                : 'Error enviando la invitacion',
            message: error.message
        })
    }

    if (data.user) {
        const { error: roleError } = await admin
            .from('profiles')
            .update({ role, state: 'invited' })
            .eq('id', data.user.id)

        if (roleError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'La invitación se envió, pero no se pudo asignar el rol.',
                message: roleError.message
            })
        }
    }

    return { message: 'Invitación enviada', id: data.user?.id ?? null }
})
