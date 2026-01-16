import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Ensures the incoming request has an authenticated Supabase user.
 * Throws a 401 error if the session is missing or invalid.
 */
export const requireUser = async (event: H3Event) => {
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Unauthorized'
        })
    }

    return user
}
