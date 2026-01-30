import { serverSupabaseClient } from '#supabase/server'
import type { Database, NewsRow } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

type NewsPayload = Pick<NewsRow, 'title' | 'subtitle' | 'type' | 'image_url' | 'author' | 'published_date' | 'content' | 'link'>

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!idParam || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'News ID is required'
    })
  }

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

  if (!body.title || !body.published_date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and published date are required'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  let imagePath = normalizeValue(body.image_url ?? null)
  let previousImagePath: string | null = null

  if (imagePart) {
    const { data: existingNews, error: existingError } = await supabase
      .from('News')
      .select('image_url')
      .eq('id', id)
      .single()

    if (existingError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error loading news image',
        message: existingError.message
      })
    }

    previousImagePath = existingNews?.image_url ?? null
  }
  if (imagePart) {
    const extension = imagePart.filename?.split('.').pop() || 'jpg'
    const fileId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`
    const filename = `${fileId}.${extension}`
    imagePath = `news/${filename}`

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

    if (previousImagePath && previousImagePath !== imagePath) {
      const { error: deleteError } = await supabase
        .storage
        .from('images')
        .remove([previousImagePath])

      if (deleteError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Error deleting previous image',
          message: deleteError.message
        })
      }
    }
  }

  const payload: NewsPayload = {
    title: body.title,
    subtitle: normalizeValue(body.subtitle ?? null),
    type: normalizeValue(body.type ?? null),
    image_url: imagePath,
    author: normalizeValue(body.author ?? null),
    published_date: body.published_date,
    content: normalizeValue(body.content ?? null),
    link: normalizeValue(body.link ?? null)
  }
  const { error } = await supabase
    .from('News')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating news',
      message: error.message
    })
  }

  return { message: 'News updated successfully' }
})
