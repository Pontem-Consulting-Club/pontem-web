import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'

/**
 * Directorio de personas (ADM-4).
 *
 * Llama a `admin_user_directory()`, que junta profiles con el correo de
 * auth.users y comprueba `is_admin()` dentro de la propia funcion. Antes esto
 * usaba la clave de servicio y armaba el cruce en JavaScript.
 */
export default defineEventHandler(async (event) => {
    await requireCan(event, 'users.manage')

    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase.rpc('admin_user_directory')

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error listing users',
            message: error.message
        })
    }

    return data ?? []
})
