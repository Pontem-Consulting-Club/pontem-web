import { serverSupabaseClient } from '#supabase/server'
import type { Database, Tables } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

type HeroSlideRow = Tables<'HeroSlides'>

type HeroSlidePayload = Pick<HeroSlideRow, 'title' | 'subtitle' | 'button_text' | 'image_url' | 'link' | 'position'>

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

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required'
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
    imagePath = `hero/${filename}`

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

  const { data: lastSlide, error: lastSlideError } = await supabase
    .from('HeroSlides')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lastSlideError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error loading hero slides order',
      message: lastSlideError.message
    })
  }

  const payload: HeroSlidePayload = {
    title: body.title as string,
    subtitle: normalizeValue(body.subtitle ?? null),
    button_text: normalizeValue(body.button_text ?? null),
    image_url: imagePath,
    link: normalizeValue(body.link ?? null),
    position: (lastSlide?.position ?? 0) + 1
  }
  const { error } = await supabase.from('HeroSlides').insert(payload)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating hero slide',
      message: error.message
    })
  }

  return { message: 'Hero slide created successfully' }
})
