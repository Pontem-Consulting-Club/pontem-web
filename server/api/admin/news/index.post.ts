import { serverSupabaseClient } from '#supabase/server'
import type { Database, NewsRow } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

type NewsPayload = Pick<NewsRow, 'title' | 'subtitle' | 'type' | 'image_url' | 'author' | 'published_date' | 'content' | 'link'>

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const body = await readBody<Partial<NewsPayload>>(event)

  if (!body.title || !body.published_date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and published date are required'
    })
  }

  const payload: NewsPayload = {
    title: body.title,
    subtitle: body.subtitle ?? null,
    type: body.type ?? null,
    image_url: body.image_url ?? null,
    author: body.author ?? null,
    published_date: body.published_date,
    content: body.content ?? null,
    link: body.link ?? null
  }

  const supabase = await serverSupabaseClient<Database>(event)
  const { error } = await supabase.from('News').insert(payload)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating news',
      message: error.message
    })
  }

  return { message: 'News created successfully' }
})
