import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const supabase = await serverSupabaseClient<Database>(event)
  const { data, error } = await supabase
    .from('Projects')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching projects',
      message: error.message
    })
  }

  return data
})
