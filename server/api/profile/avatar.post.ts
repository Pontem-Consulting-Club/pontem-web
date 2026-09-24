import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { getRequestProfile } from '~~/server/utils/requireCan'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Subida de la foto propia (FR-16).
 *
 * Siempre escribe en `avatars/<id de la persona>/`, que es justo lo que deja
 * pasar la policy `members_write_own_avatar`. La ruta no se arma con nada que
 * venga del cuerpo de la peticion, asi que nadie puede apuntar a la carpeta de
 * otra persona cambiando un campo.
 */
export default defineEventHandler(async (event) => {
    const profile = await getRequestProfile(event)

    if (!profile) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Necesitas iniciar sesion.'
        })
    }

    const parts = await readMultipartFormData(event)
    const file = parts?.find((part) => part.name === 'avatar')

    if (!file) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No llego ningun archivo.'
        })
    }

    if (file.data.length > MAX_BYTES) {
        throw createError({
            statusCode: 413,
            statusMessage: 'La imagen supera los 5 MB.'
        })
    }

    const contentType = file.type ?? ''
    if (!ALLOWED.includes(contentType)) {
        throw createError({
            statusCode: 415,
            statusMessage: 'Formato no admitido. Usa JPG, PNG, WebP o AVIF.'
        })
    }

    const extension = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
    const path = `avatars/${profile.id}/${crypto.randomUUID()}.${extension}`

    const supabase = await serverSupabaseClient<Database>(event)

    const { error: uploadError } = await supabase
        .storage
        .from('images')
        .upload(path, file.data, { contentType, upsert: false })

    if (uploadError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error uploading avatar',
            message: uploadError.message
        })
    }

    const { error } = await supabase
        .from('profiles')
        .update({ avatar_path: path })
        .eq('id', profile.id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error saving avatar path',
            message: error.message
        })
    }

    // La foto anterior queda huerfana en el bucket a proposito: borrarla aqui
    // haria que un fallo a mitad de camino dejara el perfil sin imagen.
    return { avatar_path: path }
})
