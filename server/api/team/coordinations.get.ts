import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase
        .from('TeamCoordination')
        .select('*')
        .order('coordination', { ascending: true })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching team coordinations',
            message: error.message
        })
    }

    return data
})
