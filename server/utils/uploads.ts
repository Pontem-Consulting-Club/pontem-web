import type { H3Event } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isStorageKey } from '~~/server/utils/storagePaths'

export interface FilePart {
    data: Buffer
    filename?: string
    type?: string
}

export interface ParsedPayload {
    body: Record<string, string>
    files: Record<string, FilePart | null>
}

/**
 * Normaliza un valor de formulario: string vacio -> null.
 * Mismo criterio que usan los formularios del front antes de enviar.
 */
export const normalizeValue = (value?: string | number | null) => {
    if (value === undefined || value === null) return null
    const trimmed = value.toString().trim()
    return trimmed === '' ? null : trimmed
}

/**
 * Lee el body de una request que puede venir como multipart/form-data o como JSON.
 * `fileFields` indica que campos del multipart se tratan como archivo en vez de texto.
 *
 * Es la misma logica que hay inline en los handlers de hero-slides/news/events, extraida
 * porque los casos de estudio suben dos archivos distintos (logo y documento).
 */
export const parsePayload = async (event: H3Event, fileFields: string[] = []): Promise<ParsedPayload> => {
    const files: Record<string, FilePart | null> = {}
    for (const field of fileFields) {
        files[field] = null
    }

    const contentType = getHeader(event, 'content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
        const parts = await readMultipartFormData(event)
        const body: Record<string, string> = {}

        if (parts) {
            for (const part of parts) {
                if (!part.name) continue

                if (fileFields.includes(part.name)) {
                    // Un input de archivo vacio llega como una parte sin contenido.
                    if (part.data.length > 0) {
                        files[part.name] = {
                            data: part.data,
                            filename: part.filename,
                            type: part.type
                        }
                    }
                    continue
                }

                body[part.name] = part.data.toString()
            }
        }

        return { body, files }
    }

    const raw = await readBody<Record<string, string | number | null | undefined>>(event)
    const body: Record<string, string> = {}

    for (const [key, value] of Object.entries(raw ?? {})) {
        if (value === undefined || value === null) continue
        body[key] = value.toString()
    }

    return { body, files }
}

/**
 * Sube un archivo al bucket indicado bajo `<folder>/<uuid>.<ext>` y devuelve su path relativo.
 */
export const uploadToBucket = async (
    supabase: SupabaseClient,
    bucket: string,
    folder: string,
    file: FilePart,
    fallbackExtension = 'bin'
) => {
    const extension = file.filename?.split('.').pop() || fallbackExtension
    const fileId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`
    const path = `${folder}/${fileId}.${extension}`

    const { error } = await supabase
        .storage
        .from(bucket)
        .upload(path, file.data, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type ?? 'application/octet-stream'
        })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error uploading file',
            message: error.message
        })
    }

    return path
}

/**
 * Borra un archivo del bucket solo si es una key del bucket. Los paths que apuntan a
 * `public/` o a una URL externa se ignoran (ver server/utils/storagePaths.ts).
 */
export const removeFromBucket = async (
    supabase: SupabaseClient,
    bucket: string,
    path: string | null | undefined
) => {
    if (!path || !isStorageKey(path)) return
    await supabase.storage.from(bucket).remove([path])
}
