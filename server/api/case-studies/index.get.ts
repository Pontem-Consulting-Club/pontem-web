import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase
        .from('CaseStudies')
        .select('*')
        .order('published_date', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching case studies',
            message: error.message
        })
    }

    return data
})
