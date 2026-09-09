<template>
  <UContainer class="py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
    <UCard class="w-full max-w-md bg-white rounded-lg p-6 shadow-sm" variant="soft">
      <template #header>
        <h2 class="text-2xl font-bold text-center">
          Iniciar Sesión
        </h2>
      </template>

      <form class="space-y-6" autocomplete="on" @submit.prevent="handleSubmit">
        <UAlert v-if="error" icon="i-lucide-alert-circle" :description="error" />

        <UFormField label="Correo electrónico">
          <UInput v-model="email" type="email" name="email" autocomplete="email" class="w-full"
            :ui="{ base: 'text-gray-900 placeholder-gray-400' }" placeholder="Ingresa tu correo" size="lg"
            icon="i-lucide-mail" />
        </UFormField>

        <UFormField label="Contraseña">
          <UInput v-model="password" name="password" autocomplete="current-password"
            :type="showPassword ? 'text' : 'password'" placeholder="Ingresa tu contraseña" size="lg"
            icon="i-lucide-lock" class="w-full" :ui="{ base: 'text-gray-900 placeholder-gray-400' }">
            <template #trailing>
              <UButton variant="ghost" size="xs" :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showPassword = !showPassword" />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" block size="lg" :loading="isLoading">
          Entrar
        </UButton>

        <UButton to="/recuperar-clave" variant="ghost" block size="sm">
          Olvidé mi contraseña
        </UButton>
      </form>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
useHead({
  title: 'Iniciar Sesión - Pontem'
})

const { login, isAuthenticated } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const isLoading = ref(false)

// VIS-2: al entrar, seguir a donde la persona iba en vez de dejarla en la portada.
const route = useRoute()
const destination = computed(() => {
  const target = route.query.redirect
  const path = Array.isArray(target) ? target[0] : target
  // Solo rutas internas: un redirect a otro dominio seria un open redirect.
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/'
})

onMounted(() => {
  if (isAuthenticated.value) {
    router.push(destination.value)
  }
})

const handleSubmit = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Por favor, complete todos los campos.'
    return
  }

  isLoading.value = true

  try {
    const result = await login(email.value, password.value)

    if (result.success) {
      router.push(destination.value)
    } else {
      error.value = result.error || 'Error al iniciar sesión'
    }
  } catch {
    error.value = 'Error al conectar con el servidor'
  } finally {
    isLoading.value = false
  }
}
</script>
