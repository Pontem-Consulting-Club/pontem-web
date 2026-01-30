import { serverSupabaseClient } from '#supabase/server'
import type { Database, EventRow } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

type EventPayload = Pick<EventRow, 'title' | 'subtitle' | 'description' | 'date' | 'image_url' | 'location' | 'link'>

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const normalizeValue = (value?: string | null) => {
    if (value === undefined || value === null) return null
    const trimmed = value.toString().trim()
    return trimmed === '' ? null : trimmed
  }

  const parsePayload = async () => {
    const contentType = getHeader(event, 'content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      const parts = await readMultipartFormData(event)
      const body: Record<string, string> = {}
      let imagePart: { data: Buffer; filename?: string; type?: string } | null = null

      if (parts) {
        for (const part of parts) {
          if (!part.name) continue
          if (part.name === 'image') {
            imagePart = {
              data: part.data,
              filename: part.filename,
              type: part.type
            }
            continue
          }
          body[part.name] = part.data.toString()
        }
      }

      return { body, imagePart }
    }

    const body = await readBody<Record<string, string | null | undefined>>(event)
    return { body: body ?? {}, imagePart: null }
  }

  const { body, imagePart } = await parsePayload()

  if (!body.title || !body.date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and date are required'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  let imagePath = normalizeValue(body.image_url ?? null)
  if (imagePart) {
    const extension = imagePart.filename?.split('.').pop() || 'jpg'
    const fileId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`
    const filename = `${fileId}.${extension}`
    imagePath = `events/${filename}`

    const { error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(imagePath, imagePart.data, {
        cacheControl: '3600',
        upsert: false,
        contentType: imagePart.type ?? 'application/octet-stream'
      })

    if (uploadError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error uploading image',
        message: uploadError.message
      })
    }
  }

  const payload: EventPayload = {
    title: body.title,
    date: body.date,
    subtitle: normalizeValue(body.subtitle ?? null),
    description: normalizeValue(body.description ?? null),
    image_url: imagePath,
    location: normalizeValue(body.location ?? null),
    link: normalizeValue(body.link ?? null)
  }
  const { error } = await supabase.from('Events').insert(payload)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating event',
      message: error.message
    })
  }

  return { message: 'Event created successfully' }
})
