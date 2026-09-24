import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireCan } from '~~/server/utils/requireCan'

export default defineEventHandler(async (event) => {
  await requireCan(event, 'content.edit')

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!idParam || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'News ID is required'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)
  const { error } = await supabase
    .from('News')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting news',
      message: error.message
    })
  }

  return { message: 'News deleted successfully' }
})
