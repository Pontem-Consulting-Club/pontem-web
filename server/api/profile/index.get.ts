import { getRequestProfile } from '~~/server/utils/requireCan'

export default defineEventHandler(async (event) => {
    const profile = await getRequestProfile(event)

    if (!profile) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Necesitas iniciar sesion.'
        })
    }

    return profile
})
