import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event)

    const { data: active, error: activeError } = await supabase
        .from('Projects')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })

    if (activeError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching active projects',
            message: activeError.message
        })
    }

    const { data: past, error: pastError } = await supabase
        .from('Projects')
        .select('*')
        .eq('is_active', false)
        .order('id', { ascending: false })

    if (pastError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching past projects',
            message: pastError.message
        })
    }

    return { active, past }
})
