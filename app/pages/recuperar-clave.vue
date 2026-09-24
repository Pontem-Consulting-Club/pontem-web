<template>
  <UContainer class="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
    <UCard class="w-full max-w-md rounded-lg bg-white p-6 shadow-sm" variant="soft">
      <template #header>
        <h2 class="text-center text-2xl font-bold">Recuperar contraseña</h2>
      </template>

      <div v-if="sent" class="flex flex-col gap-4 text-center">
        <UIcon name="i-lucide-mail-check" class="mx-auto h-10 w-10 text-primary-600" />
        <p>
          Si <strong>{{ email }}</strong> tiene una cuenta, le llegará un enlace para elegir una
          contraseña nueva. Revisa también la carpeta de spam.
        </p>
        <UButton to="/login" variant="soft" block>Volver a iniciar sesión</UButton>
      </div>

      <form v-else class="flex flex-col gap-6" @submit.prevent="submit">
        <p class="text-sm text-gray-600">
          Escribe tu correo y te enviamos un enlace para elegir una contraseña nueva.
        </p>

        <UAlert v-if="error" icon="i-lucide-alert-circle" color="error" :description="error" />

        <UFormField label="Correo electrónico">
          <UInput v-model="email" type="email" autocomplete="email" size="lg" icon="i-lucide-mail"
            placeholder="Ingresa tu correo" class="w-full" />
        </UFormField>

        <UButton type="submit" block size="lg" :loading="isLoading">Enviar enlace</UButton>
        <UButton to="/login" variant="ghost" block size="sm">Volver</UButton>
      </form>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
useHead({
  title: 'Recuperar contraseña - Pontem',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const supabase = useSupabaseClient()
const email = ref('')
const isLoading = ref(false)
const error = ref('')
const sent = ref(false)

const submit = async () => {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'Escribe tu correo.'
    return
  }

  isLoading.value = true

  const { error: authError } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
    redirectTo: `${window.location.origin}/nueva-clave`
  })

  isLoading.value = false

  if (authError) {
    error.value = authError.message
    return
  }

  // Se confirma igual exista o no la cuenta: decir "ese correo no existe"
  // convierte esta pantalla en un comprobador de quien es miembro del club.
  sent.value = true
}
</script>
