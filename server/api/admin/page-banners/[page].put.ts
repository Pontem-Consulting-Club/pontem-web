import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'
import { parsePayload, removeFromBucket, uploadToBucket } from '~~/server/utils/uploads'
import { isBannerPage } from '~~/shared/pageBanners'

// Las fotos de banner suelen venir de una cámara o un celular: el optimizador de
// imágenes las achica al servirlas, así que el límite es más alto que el del avatar.
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Cambia la foto del banner de una sección. Con una imagen (multipart, campo
 * `image`) la sube al bucket `images`; con JSON `{ reset: true }` vuelve a la foto
 * por defecto. En los dos casos se borra la foto anterior del bucket.
 */
export default defineEventHandler(async (event) => {
    await requireCan(event, 'content.edit')

    const page = getRouterParam(event, 'page')
    if (!isBannerPage(page)) {
        throw createError({ statusCode: 400, statusMessage: 'Esa sección no tiene banner.' })
    }

    const supabase = await serverSupabaseClient<Database>(event)

    const { data: current, error: readError } = await supabase
        .from('page_banners').select('image_path').eq('page', page).maybeSingle()
    if (readError) {
        throw createError({ statusCode: 500, statusMessage: 'Error reading page banner', message: readError.message })
    }

    let imagePath: string | null = null
    const contentType = getHeader(event, 'content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
        const { files } = await parsePayload(event, ['image'])
        const file = files.image
        if (!file) throw createError({ statusCode: 400, statusMessage: 'No llegó ningún archivo.' })
        if (file.data.length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'La imagen supera los 10 MB.' })
        if (!ALLOWED.includes(file.type ?? '')) {
            throw createError({ statusCode: 415, statusMessage: 'Formato no admitido. Usa JPG, PNG, WebP o AVIF.' })
        }
        imagePath = await uploadToBucket(supabase, 'images', 'banners', file, 'jpg')
    } else {
        const body = await readBody<{ reset?: boolean }>(event)
        if (!body?.reset) throw createError({ statusCode: 400, statusMessage: 'No hay nada que cambiar.' })
    }

    const { error } = await supabase
        .from('page_banners')
        .update({ image_path: imagePath, updated_at: new Date().toISOString() })
        .eq('page', page)

    if (error) {
        // No dejar una foto huérfana en el bucket si la fila no se pudo actualizar.
        await removeFromBucket(supabase, 'images', imagePath)
        throw createError({ statusCode: 500, statusMessage: 'Error updating page banner', message: error.message })
    }

    await removeFromBucket(supabase, 'images', current?.image_path)

    return { page, image_path: imagePath }
})
