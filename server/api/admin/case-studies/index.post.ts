import { serverSupabaseClient } from '#supabase/server'
import type { Database, Tables } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'
import { isValidCaseCategory, isValidCaseDifficulty } from '~~/server/utils/caseStudies'
import { normalizeValue, parsePayload, uploadToBucket } from '~~/server/utils/uploads'

type CaseStudyRow = Tables<'CaseStudies'>

type CaseStudyPayload = Omit<CaseStudyRow, 'id' | 'created_at'>

export default defineEventHandler(async (event) => {
    await requireUser(event)

    const { body, files } = await parsePayload(event, ['logo', 'document'])

    if (!normalizeValue(body.title)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Title is required'
        })
    }

    const category = normalizeValue(body.category)
    if (!isValidCaseCategory(category)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'A valid category is required'
        })
    }

    const difficulty = normalizeValue(body.difficulty)
    if (difficulty && !isValidCaseDifficulty(difficulty)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid difficulty'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    let logoPath = normalizeValue(body.company_logo_url)
    if (files.logo) {
        logoPath = await uploadToBucket(supabase, 'images', 'cases', files.logo, 'jpg')
    }

    let documentPath = normalizeValue(body.document_url)
    let documentName = normalizeValue(body.document_name)
    let documentSize = body.document_size_bytes ? Number(body.document_size_bytes) : null

    if (files.document) {
        documentPath = await uploadToBucket(supabase, 'documents', 'casos', files.document, 'pdf')
        documentName = files.document.filename ?? 'documento.pdf'
        documentSize = files.document.data.length
    }

    const duration = normalizeValue(body.duration_minutes)

    const payload: CaseStudyPayload = {
        title: body.title.trim(),
        company: normalizeValue(body.company),
        company_logo_url: logoPath,
        category,
        difficulty: difficulty || null,
        duration_minutes: duration ? Number(duration) : null,
        case_type: normalizeValue(body.case_type),
        summary: normalizeValue(body.summary),
        problem_statement: normalizeValue(body.problem_statement),
        document_url: documentPath,
        document_name: documentName,
        document_size_bytes: documentSize,
        published_date: normalizeValue(body.published_date)
    }

    const { data, error } = await supabase
        .from('CaseStudies')
        .insert(payload)
        .select('id')
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating case study',
            message: error.message
        })
    }

    return { message: 'Case study created successfully', id: data.id }
})
