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
            statusMessage: 'Case study ID is required'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data: existing } = await supabase
        .from('CaseStudies')
        .select('company_logo_url, document_url, resources:CaseStudyResources(document_url)')
        .eq('id', id)
        .maybeSingle()

    const { error } = await supabase
        .from('CaseStudies')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error deleting case study',
            message: error.message
        })
    }

    // Las filas de CaseStudyResources caen por el ON DELETE CASCADE, pero sus archivos
    // hay que sacarlos del bucket a mano.
    await removeFromBucket(supabase, 'images', existing?.company_logo_url)
    await removeFromBucket(supabase, 'documents', existing?.document_url)

    for (const resource of existing?.resources ?? []) {
        await removeFromBucket(supabase, 'documents', resource.document_url)
    }

    return { message: 'Case study deleted successfully' }
})
