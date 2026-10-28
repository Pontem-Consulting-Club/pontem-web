import type { Database } from '~/types/database.types'

export type CaseProgress = Database['public']['Tables']['case_study_progress']['Row']
export type CaseActivity = Pick<
    Database['public']['Tables']['case_study_activity']['Row'],
    'id' | 'case_study_id' | 'kind' | 'status' | 'self_rating' | 'created_at'
>
export type CaseProgressChanges = Partial<Pick<CaseProgress, 'status' | 'self_rating' | 'notes'>>

/**
 * El progreso propio en los casos, compartido por todas las tarjetas, el detalle
 * del caso y /mi-progreso.
 *
 * Igual que `useMyRegistrations`, una clave fija hace que las N tarjetas del
 * listado usen una sola peticion, y se decide con el id de la sesion y no con el
 * perfil: en el servidor el perfil todavia no esta cargado cuando esto corre. Una
 * cuenta invitada o desactivada recibe 403, y eso es "sin progreso", no un error.
 */
export const useMyCaseProgress = () => {
    const userId = useCurrentUserId()
    const { can } = useProfile()
    const requestFetch = useRequestFetch()

    const canTrack = computed(() => can('cases.track'))

    const { data, refresh, status, error } = useAsyncData(
        'my-case-progress',
        async () => {
            if (!userId.value) return null
            try {
                return await requestFetch<{ progress: CaseProgress[]; activity: CaseActivity[] }>(
                    '/api/profile/case-progress'
                )
            } catch (e) {
                const code = (e as { statusCode?: number }).statusCode
                if (code === 401 || code === 403) return null
                throw e
            }
        },
        { watch: [userId], default: () => null }
    )

    const progress = computed(() => data.value?.progress ?? [])
    const activity = computed(() => data.value?.activity ?? [])

    const byCase = computed(() => new Map(progress.value.map(row => [row.case_study_id, row])))
    const progressFor = (caseStudyId: number) => byCase.value.get(caseStudyId) ?? null

    const save = async (caseStudyId: number, changes: CaseProgressChanges) => {
        const saved = await $fetch<CaseProgress>(`/api/profile/case-progress/${caseStudyId}`, {
            method: 'PUT',
            body: changes
        })
        await refresh()
        return saved
    }

    // Una visita que no se pudo anotar no le importa a quien lee el caso: no se
    // muestra error.
    const recordView = async (caseStudyId: number) => {
        if (!canTrack.value) return
        try {
            await $fetch(`/api/profile/case-progress/${caseStudyId}/view`, { method: 'POST' })
            await refresh()
        } catch {
            // Sin aviso a proposito.
        }
    }

    return { canTrack, progress, activity, progressFor, save, recordView, refresh, status, error }
}
