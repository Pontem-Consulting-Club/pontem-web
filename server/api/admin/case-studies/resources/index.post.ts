import { serverSupabaseClient } from '#supabase/server'
import type { Database, Tables } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'
import { isValidCaseResourceKind } from '~~/server/utils/caseStudies'
import { normalizeValue, parsePayload, uploadToBucket } from '~~/server/utils/uploads'

type CaseStudyResourceRow = Tables<'CaseStudyResources'>

type CaseStudyResourcePayload = Omit<CaseStudyResourceRow, 'id' | 'created_at'>

export default defineEventHandler(async (event) => {
    await requireCan(event, 'content.edit')

    const { body, files } = await parsePayload(event, ['document'])

    const caseStudyId = Number(normalizeValue(body.case_study_id))
    if (!caseStudyId || Number.isNaN(caseStudyId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el identificador del caso.'
        })
    }

    const title = normalizeValue(body.title)
    if (!title) {
        throw createError({
            statusCode: 400,
            statusMessage: 'El título es obligatorio.'
        })
    }

    const kind = normalizeValue(body.kind)
    if (!isValidCaseResourceKind(kind)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Elige un tipo de recurso válido.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    let documentPath = normalizeValue(body.document_url)
    if (files.document) {
        documentPath = await uploadToBucket(supabase, 'documents', 'casos/recursos', files.document, 'pdf')
    }

    const { data: lastResource, error: lastResourceError } = await supabase
        .from('CaseStudyResources')
        .select('position')
        .eq('case_study_id', caseStudyId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (lastResourceError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading case study resources order',
            message: lastResourceError.message
        })
    }

    const payload: CaseStudyResourcePayload = {
        case_study_id: caseStudyId,
        kind,
        title,
        link: normalizeValue(body.link),
        document_url: documentPath,
        position: (lastResource?.position ?? 0) + 1
    }

    const { error } = await supabase.from('CaseStudyResources').insert(payload)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating case study resource',
            message: error.message
        })
    }

    return { message: 'Case study resource created successfully' }
})
