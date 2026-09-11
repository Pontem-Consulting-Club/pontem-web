<template>
  <UContainer class="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
    <UCard class="w-full max-w-md rounded-lg bg-white p-6 shadow-sm" variant="soft">
      <template #header>
        <h2 class="text-center text-2xl font-bold">{{ heading }}</h2>
      </template>

      <LoadingSpinner v-if="isResolving" />

      <div v-else-if="!hasSession" class="flex flex-col gap-4 text-center">
        <UIcon name="i-lucide-link-2-off" class="mx-auto h-10 w-10 text-gray-400" />
        <p>
          Este enlace ya no sirve. Los enlaces de recuperación caducan al usarse o
          después de un rato.
        </p>
        <UButton to="/recuperar-clave" variant="soft" block>Pedir uno nuevo</UButton>
      </div>

      <form v-else class="flex flex-col gap-6" @submit.prevent="submit">
        <p v-if="isInvitation" class="text-sm text-gray-600">
          Te damos la bienvenida a Pontem. Elige una contraseña para entrar a tu cuenta.
        </p>

        <UAlert v-if="error" icon="i-lucide-alert-circle" color="error" :description="error" />

        <UFormField label="Nueva contraseña" :description="`Al menos ${MIN_LENGTH} caracteres.`">
          <UInput v-model="password" :type="show ? 'text' : 'password'" autocomplete="new-password" size="lg"
            icon="i-lucide-lock" class="w-full" placeholder="Escribe tu nueva contraseña">
            <template #trailing>
              <UButton variant="ghost" size="xs" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="show = !show" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="Repítela">
          <UInput v-model="confirmation" :type="show ? 'text' : 'password'" autocomplete="new-password" size="lg"
            icon="i-lucide-lock" class="w-full" placeholder="Escríbela otra vez" />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="isLoading">Guardar</UButton>
      </form>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
// Coincide con minimum_password_length de supabase/config.toml.
const MIN_LENGTH = 8

useHead({
  title: 'Nueva contraseña - Pontem',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

// La invitación llega con ?bienvenida=1; el olvido de contraseña, sin nada.
const isInvitation = computed(() => route.query.bienvenida !== undefined)
const heading = computed(() => isInvitation.value ? 'Elige tu contraseña' : 'Nueva contraseña')

const password = ref('')
const confirmation = ref('')
const show = ref(false)
const isLoading = ref(false)
const error = ref('')

// El enlace del correo abre la app con una sesión ya iniciada. Sin ella no hay
// nada que cambiar. Hasta leer la URL en el navegador no sabemos si la hay.
const isResolving = ref(true)
const hasSession = computed(() => Boolean(user.value))

onMounted(async () => {
  // La recuperación llega como PKCE (?code=) y el cliente la resuelve solo. La
  // invitación no: inviteUserByEmail la genera el servidor, sin PKCE, y vuelve con
  // la sesión en el fragmento (#access_token=...). El cliente del módulo usa PKCE
  // y descarta ese formato, así que sin esto nadie podía aceptar una invitación.
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const accessToken = fragment.get('access_token')
  const refreshToken = fragment.get('refresh_token')

  if (fragment.get('type') === 'invite' && accessToken && refreshToken) {
    // Son credenciales: fuera de la barra de direcciones y del historial.
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
  }

  // Espera a que el cliente termine con la URL y deja el usuario listo sin
  // depender de cuándo llegue el evento de onAuthStateChange.
  const { data } = await supabase.auth.getClaims()
  user.value = data?.claims ?? null
  isResolving.value = false
})

const submit = async () => {
  error.value = ''

  if (password.value.length < MIN_LENGTH) {
    error.value = `La contraseña necesita al menos ${MIN_LENGTH} caracteres.`
    return
  }

  if (password.value !== confirmation.value) {
    error.value = 'Las dos contraseñas no coinciden.'
    return
  }

  isLoading.value = true
  const { error: authError } = await supabase.auth.updateUser({ password: password.value })
  isLoading.value = false

  if (authError) {
    error.value = authError.message
    return
  }

  await router.push('/perfil')
}
</script>
