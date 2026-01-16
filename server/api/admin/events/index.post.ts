import { serverSupabaseClient } from '#supabase/server'
import type { Database, EventRow } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

type EventPayload = Pick<EventRow, 'title' | 'subtitle' | 'description' | 'date' | 'image_url' | 'location' | 'link'>

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const body = await readBody<Partial<EventPayload>>(event)
  const { title, date } = body

  if (!title || !date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and date are required'
    })
  }

  const payload: EventPayload = {
    title,
    date,
    subtitle: body.subtitle ?? null,
    description: body.description ?? null,
    image_url: body.image_url ?? null,
    location: body.location ?? null,
    link: body.link ?? null
  }

  const supabase = await serverSupabaseClient<Database>(event)
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
