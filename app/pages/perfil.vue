<template>
  <div>
    <UContainer>
      <UPageHeader title="Mi cuenta" />
    </UContainer>

    <UContainer class="py-16">
      <UAlert v-if="needsOnboarding" icon="i-lucide-hand" color="primary" variant="soft" class="mb-8"
        title="Confirma tu nombre"
        description="Tu cuenta queda activa cuando guardes tu nombre por primera vez." />

      <div v-if="!profile" class="flex justify-center">
        <LoadingSpinner />
      </div>

      <div v-else class="mx-auto flex max-w-2xl flex-col gap-8">
        <UCard>
          <UForm :state="form" class="flex flex-col gap-5" @submit.prevent="save">
            <UFormField label="Nombre para mostrar" required>
              <UInput v-model="form.display_name" size="lg" placeholder="Cómo quieres que te vean" />
            </UFormField>

            <dl class="rounded-lg border border-default divide-y divide-default text-sm">
              <div class="flex items-center justify-between gap-4 px-4 py-3">
                <dt class="text-muted">Correo</dt>
                <dd class="truncate font-medium">{{ email }}</dd>
              </div>
              <div class="flex items-center justify-between px-4 py-3">
                <dt class="text-muted">Rol</dt>
                <dd class="font-medium">{{ roleLabel }}</dd>
              </div>
              <div class="flex items-center justify-between px-4 py-3">
                <dt class="text-muted">Estado</dt>
                <dd class="font-medium">{{ stateLabel }}</dd>
              </div>
            </dl>

            <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :description="error" />
            <UAlert v-if="savedMessage" color="success" icon="i-lucide-check" :description="savedMessage" />

            <div class="flex justify-end">
              <UButton variant="solid" type="submit" size="lg" :loading="isSaving">Guardar</UButton>
            </div>
          </UForm>
        </UCard>

        <!-- Las dos rutas ya existen: /nueva-clave usa la sesión abierta, /recuperar-clave manda un enlace. -->
        <UCard :ui="{ body: 'flex flex-col gap-4' }">
          <h2 class="text-subheading text-highlighted">Contraseña</h2>
          <div class="flex flex-wrap gap-3">
            <UButton to="/nueva-clave" icon="i-lucide-key-round" variant="outline">
              Cambiar contraseña
            </UButton>
            <UButton to="/recuperar-clave" icon="i-lucide-mail" variant="ghost" color="neutral">
              Olvidé mi contraseña
            </UButton>
          </div>
        </UCard>

        <UCard :ui="{ body: 'flex flex-wrap items-center justify-between gap-3' }">
          <UButton v-if="can('cases.track')" to="/mi-progreso" icon="i-lucide-chart-no-axes-column"
            variant="ghost" color="neutral">
            Ver mi progreso
          </UButton>
          <UButton icon="i-lucide-log-out" color="error" variant="soft" class="ms-auto" @click="logout">
            Cerrar sesión
          </UButton>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ROLE_LABELS, PROFILE_STATE_LABELS } from '~~/shared/authz'
import type { Profile } from '~/composables/useProfile'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'Mi cuenta - Pontem',
  // FR-29: el perfil no se indexa, sea cual sea el entorno.
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const { profile, refresh, needsOnboarding, can, ready: profileReady } = useProfile()
const { user, logout } = useAuth()

const email = computed(() => user.value?.email ?? '')
const roleLabel = computed(() => profile.value ? ROLE_LABELS[profile.value.role] : '')
const stateLabel = computed(() => profile.value ? PROFILE_STATE_LABELS[profile.value.state] : '')

const form = reactive({ display_name: '' })
const isSaving = ref(false)
const error = ref('')
const savedMessage = ref('')

const save = async () => {
  error.value = ''
  savedMessage.value = ''

  if (!form.display_name.trim()) {
    error.value = 'El nombre para mostrar es obligatorio.'
    return
  }

  isSaving.value = true
  try {
    // ponytail: PUT /api/profile reemplaza todos los campos; se reenvían los
    // actuales para no borrar biografía, coordinación ni generación ya guardadas.
    const current = profile.value
    await $fetch<Profile>('/api/profile', {
      method: 'PUT',
      body: {
        display_name: form.display_name,
        bio: current?.bio ?? null,
        coordination: current?.coordination ?? null,
        generation: current?.generation ?? null,
        is_public: current?.is_public ?? false
      }
    })
    await refresh()
    savedMessage.value = 'Cambios guardados.'
  } catch (e) {
    error.value = apiErrorMessage(e, 'No pudimos guardar los cambios.')
  } finally {
    isSaving.value = false
  }
}

// El formulario se llena despues de esperar el perfil: con un `watch` inmediato
// el servidor lo veia null y el HTML salia con el nombre vacio.
await profileReady
form.display_name = profile.value?.display_name ?? ''
watch(profile, value => { if (value) form.display_name = value.display_name })
</script>
