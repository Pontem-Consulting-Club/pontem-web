import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'
import { CASE_NOTES_MAX_LENGTH, isValidCaseProgressStatus } from '~~/server/utils/caseStudies'

type ProgressInsert = Database['public']['Tables']['case_study_progress']['Insert']

/**
 * Guarda el estado, la autoevaluacion o las notas propias de un caso.
 *
 * Solo se escriben los campos que vienen en el cuerpo: marcar el estado no borra
 * las notas. `null` quita el valor. Las fechas y el historial los pone la base
 * con triggers, asi que no se aceptan desde aqui.
 */
export default defineEventHandler(async (event) => {
    const profile = await requireCan(event, 'cases.track')

    const idParam = getRouterParam(event, 'id')
    const caseStudyId = Number(idParam)

    if (!idParam || !Number.isInteger(caseStudyId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el identificador del caso.'
        })
    }

    const body = await readBody<Record<string, unknown>>(event)
    const payload: ProgressInsert = { profile_id: profile.id, case_study_id: caseStudyId }

    if (body && 'status' in body) {
        if (body.status !== null && !isValidCaseProgressStatus(body.status)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Estado inválido.'
            })
        }
        payload.status = body.status
    }

    if (body && 'self_rating' in body) {
        const rating = body.self_rating === null ? null : Number(body.self_rating)
        if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'La autoevaluación va de 1 a 5.'
            })
        }
        payload.self_rating = rating
    }

    if (body && 'notes' in body) {
        const notes = body.notes === null ? '' : String(body.notes).trim()
        if (notes.length > CASE_NOTES_MAX_LENGTH) {
            throw createError({
                statusCode: 400,
                statusMessage: `Las notas pueden tener hasta ${CASE_NOTES_MAX_LENGTH} caracteres.`
            })
        }
        payload.notes = notes || null
    }

    if (Object.keys(payload).length === 2) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No hay nada que guardar.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase
        .from('case_study_progress')
        .upsert(payload, { onConflict: 'profile_id,case_study_id' })
        .select('*')
        .single()

    if (error) {
        // El caso se borro o el id no existe: la llave foranea lo rechaza.
        if (error.code === '23503') {
            throw createError({
                statusCode: 404,
                statusMessage: 'No encontramos ese caso de estudio.'
            })
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Error saving case progress',
            message: error.message
        })
    }

    return data
})
