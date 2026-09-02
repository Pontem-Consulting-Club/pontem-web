import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)

    if (!idParam || Number.isNaN(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Case study ID is required'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data, error } = await supabase
        .from('CaseStudies')
        .select('*, resources:CaseStudyResources(*)')
        .eq('id', id)
        .order('position', { referencedTable: 'CaseStudyResources', ascending: true })
        .maybeSingle()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching case study',
            message: error.message
        })
    }

    if (!data) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Case study not found'
        })
    }

    return data
})
