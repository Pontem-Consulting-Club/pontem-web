import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireUser } from '~~/server/utils/requireUser'
import { isStorageKey } from '~~/server/utils/storagePaths'

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!idParam || Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Hero slide ID is required'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  const { data: existingSlide } = await supabase
    .from('HeroSlides')
    .select('image_url')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('HeroSlides')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting hero slide',
      message: error.message
    })
  }

  const imagePath = existingSlide?.image_url ?? null
  if (imagePath && isStorageKey(imagePath)) {
    await supabase.storage.from('images').remove([imagePath])
  }

  return { message: 'Hero slide deleted successfully' }
})
