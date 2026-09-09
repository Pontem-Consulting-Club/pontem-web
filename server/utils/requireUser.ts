import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Exige que la peticion traiga una sesion valida, sin mirar el rol.
 *
 * Para autorizar usa `requireCan`, no esto: aqui solo se comprueba que hay
 * alguien detras de la peticion.
 *
 * Ojo con lo que devuelve: en @nuxtjs/supabase 2.x `serverSupabaseUser` entrega
 * los claims del JWT y no un objeto User, asi que el identificador de la persona
 * es `sub` y NO `id`. Leer `.id` da undefined en silencio.
 */
export const requireUser = async (event: H3Event) => {
    const claims = await serverSupabaseUser(event)

    if (!claims?.sub) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Unauthorized'
        })
    }

    return claims
}
