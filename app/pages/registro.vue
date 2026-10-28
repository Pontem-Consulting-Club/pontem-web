<template>
  <UContainer class="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-center text-heading text-highlighted">Crear cuenta</h1>
      </template>

      <div v-if="sent" class="flex flex-col gap-4 text-center">
        <UIcon name="i-lucide-mail-check" class="mx-auto size-10 text-primary" />
        <p>
          Te enviamos un enlace a <strong>{{ email }}</strong> para confirmar tu correo. Ábrelo y luego inicia
          sesión. Revisa también la carpeta de spam.
        </p>
        <UButton :to="loginLink" block>Ir a iniciar sesión</UButton>
      </div>

      <form v-else method="post" class="flex flex-col gap-6" autocomplete="on" @submit.prevent="submit">
        <p class="text-sm text-toned">
          Con tu cuenta puedes guardar tu progreso en los casos de estudio: qué resolviste, cómo te fue y tus notas.
        </p>

        <UAlert v-if="error" icon="i-lucide-alert-circle" color="error" :description="error" />

        <UFormField label="Nombre">
          <UInput v-model="displayName" name="name" autocomplete="name" size="lg" icon="i-lucide-user"
            placeholder="Cómo quieres que te llamemos" />
        </UFormField>

        <UFormField label="Correo electrónico">
          <UInput v-model="email" type="email" name="email" autocomplete="email" size="lg" icon="i-lucide-mail"
            placeholder="Ingresa tu correo" />
        </UFormField>

        <UFormField label="Contraseña" :description="`Al menos ${MIN_LENGTH} caracteres.`">
          <UInput v-model="password" name="password" :type="show ? 'text' : 'password'" autocomplete="new-password"
            size="lg" icon="i-lucide-lock" placeholder="Elige una contraseña">
            <template #trailing>
              <UButton variant="ghost" color="neutral" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" :aria-pressed="show"
                @click="show = !show" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="Repítela">
          <UInput v-model="confirmation" :type="show ? 'text' : 'password'" autocomplete="new-password" size="lg"
            icon="i-lucide-lock" placeholder="Escríbela otra vez" />
        </UFormField>

        <!-- Igual que en /login: deshabilitado hasta hidratar para que un envío
             nativo no ponga la contraseña en la URL. -->
        <UButton variant="solid" type="submit" block size="lg" :loading="isLoading" :disabled="!isHydrated">
          Crear cuenta
        </UButton>

        <UButton :to="loginLink" variant="ghost" block size="sm">Ya tengo cuenta</UButton>
      </form>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
// Coincide con minimum_password_length de supabase/config.toml.
const MIN_LENGTH = 8

usePageMeta({
  title: 'Crear cuenta - Pontem',
  description: 'Crea tu cuenta en Pontem para guardar tu progreso en los casos de estudio.'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmation = ref('')
const show = ref(false)
const isLoading = ref(false)
const error = ref('')
const sent = ref(false)

const isHydrated = ref(false)
onMounted(() => {
  isHydrated.value = true
})

// Misma regla que /login: solo rutas internas, para no abrir un open redirect.
const destination = computed(() => {
  const target = route.query.redirect
  const path = Array.isArray(target) ? target[0] : target
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/mi-progreso'
})
const loginLink = computed(() => ({ path: '/login', query: { redirect: destination.value } }))

const submit = async () => {
  error.value = ''

  if (!displayName.value.trim() || !email.value.trim() || !password.value) {
    error.value = 'Completa todos los campos.'
    return
  }

  if (password.value.length < MIN_LENGTH) {
    error.value = `La contraseña necesita al menos ${MIN_LENGTH} caracteres.`
    return
  }

  if (password.value !== confirmation.value) {
    error.value = 'Las dos contraseñas no coinciden.'
    return
  }

  isLoading.value = true

  try {
    // El rol no viaja aqui: el trigger de la base le da 'usuario' a toda cuenta
    // nueva, sin mirar lo que mande el navegador.
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        data: { display_name: displayName.value.trim() },
        emailRedirectTo: `${window.location.origin}/login?confirmado=1&redirect=${encodeURIComponent(destination.value)}`
      }
    })

    if (authError) {
      error.value = authErrorMessage(authError, 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
      return
    }

    // Sin confirmacion de correo (como en local) la sesion llega al tiro.
    if (data.session) {
      const { data: claims } = await supabase.auth.getClaims()
      user.value = claims?.claims ?? null
      await router.push(destination.value)
      return
    }

    // Con confirmacion, Supabase responde igual exista o no la cuenta: decir
    // "ese correo ya existe" revelaria quien tiene cuenta.
    sent.value = true
  } catch {
    error.value = 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>
