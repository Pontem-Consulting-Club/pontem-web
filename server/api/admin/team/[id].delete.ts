import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

export default defineEventHandler(async (event) => {
    await requireUser(event)

    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)

    if (!idParam || Number.isNaN(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Team member ID is required'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const { error } = await supabase
        .from('Team')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error deleting team member',
            message: error.message
        })
    }

    return { message: 'Team member deleted successfully' }
})
