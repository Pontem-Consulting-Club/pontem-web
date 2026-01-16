import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase
        .from('News')
        .select('*')
        .order('published_date', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching news',
            message: error.message
        })
    }

    return data
})
