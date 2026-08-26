import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const body = await readBody<{ ids?: unknown }>(event)
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : []

  if (ids.length === 0 || ids.some(id => Number.isNaN(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A list of hero slide IDs is required'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from('HeroSlides')
      .update({ position: index + 1 })
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error reordering hero slides',
        message: error.message
      })
    }
  }

  return { message: 'Hero slides reordered successfully' }
})
