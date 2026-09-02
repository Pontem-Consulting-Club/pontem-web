import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'
import { removeFromBucket } from '~~/server/utils/uploads'

export default defineEventHandler(async (event) => {
    await requireUser(event)

    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)

    if (!idParam || Number.isNaN(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Resource ID is required'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data: existing } = await supabase
        .from('CaseStudyResources')
        .select('document_url')
        .eq('id', id)
        .maybeSingle()

    const { error } = await supabase
        .from('CaseStudyResources')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error deleting case study resource',
            message: error.message
        })
    }

    await removeFromBucket(supabase, 'documents', existing?.document_url)

    return { message: 'Case study resource deleted successfully' }
})
