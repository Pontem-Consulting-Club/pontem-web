import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

/** Foto elegida para el banner de cada sección pública (null = la de por defecto). */
export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient<Database>(event)
    const { data, error } = await supabase.from('page_banners').select('page, image_path')

    if (error) {
        throw createError({ statusCode: 500, statusMessage: 'Error fetching page banners', message: error.message })
    }

    return data
})
