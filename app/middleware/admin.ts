import type { Database } from '~/types/database.types'
import { can, type AuthzProfile } from '~~/shared/authz'

/**
 * Exige la capacidad `users.manage`. Es comodidad de interfaz: la autorizacion
 * de verdad la hace el servidor en cada ruta y RLS en cada tabla (FR-08).
 *
 * Devuelve 403 y no 404 a proposito: quien no tiene acceso necesita entender
 * que la pagina existe pero no es para su rol, no creer que hay un bug (EDI-3).
 *
 * Consulta la fila directo en vez de apoyarse en el estado de `useProfile()`:
 * en SSR el middleware corre antes de que ese `useAsyncData` haya resuelto, y
 * esperarlo aqui dejaba fuera incluso a las cuentas administradoras.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const userId = useCurrentUserId()

    if (!userId.value) {
        return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
    }

    const supabase = useSupabaseClient<Database>()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, state')
        .eq('id', userId.value)
        .maybeSingle()

    if (!can(profile as AuthzProfile | null, 'users.manage')) {
        throw createError({
            statusCode: 403,
            statusMessage: 'No tienes acceso a esta seccion.',
            fatal: true
        })
    }
})
