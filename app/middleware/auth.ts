export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  if (user.value) {
    return
  }

  const supabase = useSupabaseClient()
  const { data, error } = await supabase.auth.getSession()

  if (error || !data.session) {
    return navigateTo('/admin/login')
  }
})
