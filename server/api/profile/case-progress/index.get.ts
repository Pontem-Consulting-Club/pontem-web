import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'

// El historial completo puede crecer mucho; la pagina solo muestra lo reciente.
const ACTIVITY_LIMIT = 50

/**
 * El progreso propio en los casos de estudio y lo ultimo del historial.
 *
 * Ambas consultas filtran por la persona aunque RLS ya limite las filas a las
 * propias: si algun dia el staff pudiera ver el progreso de otros, esta ruta
 * seguiria devolviendo solo el de quien pregunta.
 */
export default defineEventHandler(async (event) => {
    const profile = await requireCan(event, 'cases.track')
    const supabase = await serverSupabaseClient<Database>(event)

    const [{ data: progress, error }, { data: activity, error: activityError }] = await Promise.all([
        supabase
            .from('case_study_progress')
            .select('*')
            .eq('profile_id', profile.id),
        supabase
            .from('case_study_activity')
            .select('id, case_study_id, kind, status, self_rating, created_at')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(ACTIVITY_LIMIT)
    ])

    if (error || activityError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error loading case progress',
            message: (error ?? activityError)!.message
        })
    }

    return {
        progress: progress ?? [],
        activity: activity ?? []
    }
})
