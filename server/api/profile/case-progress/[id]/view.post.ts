import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'

/**
 * Anota que la persona abrio un caso. `record_case_view` decide si cuenta como
 * una visita nueva (pasaron 30 minutos desde la anterior) y escribe el historial.
 */
export default defineEventHandler(async (event) => {
    await requireCan(event, 'cases.track')

    const idParam = getRouterParam(event, 'id')
    const caseStudyId = Number(idParam)

    if (!idParam || !Number.isInteger(caseStudyId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Falta el identificador del caso.'
        })
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const { error } = await supabase.rpc('record_case_view', { p_case_study_id: caseStudyId })

    if (error) {
        if (error.code === 'P0002') {
            throw createError({
                statusCode: 404,
                statusMessage: 'No encontramos ese caso de estudio.'
            })
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Error recording case view',
            message: error.message
        })
    }

    return { ok: true }
})
