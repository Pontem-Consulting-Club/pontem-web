<script setup lang="ts">
import type { CaseStudyFiles } from '~/composables/useCaseStudyForm'

useHead({
  title: 'Nuevo caso de estudio - Pontem'
})

const router = useRouter()
const { isEditor, ready: profileReady } = useProfile()

const { form, formError, isSaving, emptyCaseStudy, create } = useCaseStudyForm()

form.value = emptyCaseStudy()

// La proteccion real vive en el servidor (requireCan 'content.edit') y en RLS; esto
// solo evita mostrar el formulario a quien no puede editar contenido.
// `navigateTo` (a diferencia de router.replace) tambien corta el render en SSR.
// Se espera el perfil antes de decidir: en el servidor, sin esperarlo, el rol
// todavia no se conoce y se sacaria del modo edicion incluso a quien edita.
await profileReady
watchEffect(async () => {
  if (!isEditor.value) {
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
  <UContainer v-if="isEditor" class="py-16">
    <div class="max-w-3xl mx-auto mb-6">
      <UButton to="/material-estudio" variant="soft" icon="i-lucide-arrow-left" size="md">
        Volver a Material de Estudio
      </UButton>
    </div>

    <CaseStudyEditForm v-model:form="form" :is-new="true" :is-saving="isSaving" :form-error="formError"
      @submit="handleSubmit" @cancel="handleCancel" />
  </UContainer>
</template>
