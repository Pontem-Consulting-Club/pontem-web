import { serverSupabaseClient } from '#supabase/server'
import type { Database, ProjectRow } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

type ProjectPayload = Pick<ProjectRow, 'title' | 'subtitle' | 'description' | 'image_url' | 'link' | 'link_text'>

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const body = await readBody<Partial<ProjectPayload>>(event)

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required'
    })
  }

  const payload: ProjectPayload = {
    title: body.title,
    subtitle: body.subtitle ?? null,
    description: body.description ?? null,
    image_url: body.image_url ?? null,
    link: body.link ?? null,
    link_text: body.link_text ?? null
  }

  const supabase = await serverSupabaseClient<Database>(event)
  const { error } = await supabase.from('Projects').insert(payload)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating project',
      message: error.message
    })
  }

  return { message: 'Project created successfully' }
})
