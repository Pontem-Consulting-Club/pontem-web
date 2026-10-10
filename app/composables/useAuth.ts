export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isLoading = useState('authLoading', () => false)
  const authError = useState<string | null>('authError', () => null)

  const isAuthenticated = computed(() => Boolean(user.value))

  const login = async (email: string, password: string) => {
    isLoading.value = true
    authError.value = null

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const message = authErrorMessage(error, 'No pudimos iniciar sesión. Inténtalo de nuevo.')
        authError.value = message
        return { success: false, error: message }
      }

      // El modulo de Supabase actualiza useSupabaseUser() de forma asincrona
      // (onAuthStateChange -> getClaims). Si quien llama navega apenas vuelve
      // esta funcion, el middleware `auth` todavia ve la sesion vacia y lo manda
      // de vuelta a /login. Se deja el usuario listo antes de devolver el control.
      const { data } = await supabase.auth.getClaims()
      user.value = data?.claims ?? null

      return { success: true }
    } catch (error) {
      const message = authErrorMessage(error, 'No pudimos iniciar sesión. Inténtalo de nuevo.')
      authError.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      authError.value = authErrorMessage(error, 'Tu sesión expiró. Vuelve a iniciar sesión.')
      return null
    }

    return data.session
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    refreshSession
  }
}
