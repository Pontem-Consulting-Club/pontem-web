import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const { data, error } = await supabase
    .from('Events')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching events',
      message: error.message
    })
  }

  return data
})
