<script setup lang="ts">
import type { CaseStudyFiles } from '~/composables/useCaseStudyForm'

useHead({
  title: 'Nuevo caso de estudio - Pontem'
})

const router = useRouter()
const { isAuthenticated } = useAuth()

const { form, formError, isSaving, emptyCaseStudy, create } = useCaseStudyForm()

form.value = emptyCaseStudy()

// La proteccion real vive en el server (requireUser); esto solo evita mostrar el formulario.
// `navigateTo` (a diferencia de router.replace) tambien corta el render en SSR.
watchEffect(async () => {
  if (!isAuthenticated.value) {
    await navigateTo('/material-estudio', { replace: true })
  }
})

const handleSubmit = async (files: CaseStudyFiles) => {
  const id = await create(files)
  if (id) {
    router.push(`/material-estudio/casos/${id}`)
  }
}

const handleCancel = () => {
  router.push('/material-estudio')
}
</script>

<template>
  <UContainer v-if="isAuthenticated" class="py-16">
    <div class="max-w-3xl mx-auto mb-6">
      <UButton to="/material-estudio" variant="soft" icon="i-lucide-arrow-left" size="md">
        Volver a Material de Estudio
      </UButton>
    </div>

    <CaseStudyEditForm v-model:form="form" :is-new="true" :is-saving="isSaving" :form-error="formError"
      @submit="handleSubmit" @cancel="handleCancel" />
  </UContainer>
</template>
