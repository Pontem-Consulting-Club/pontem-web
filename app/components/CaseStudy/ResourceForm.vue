<script setup lang="ts">
import type { CaseResourceKind } from '~/constants/caseStudies'
import { CASE_RESOURCE_KIND_OPTIONS } from '~/constants/caseStudies'

const props = defineProps<{
  caseStudyId: number
}>()

const emit = defineEmits<{ (e: 'created'): void }>()

const isOpen = ref(false)
const isSaving = ref(false)
const error = ref('')

const kind = ref<CaseResourceKind>('APUNTE')
const title = ref('')
const link = ref('')
const documentInput = ref<HTMLInputElement | null>(null)
const pendingDocument = ref<File | null>(null)

const reset = () => {
  kind.value = 'APUNTE'
  title.value = ''
  link.value = ''
  pendingDocument.value = null
  error.value = ''
  if (documentInput.value) {
    documentInput.value.value = ''
  }
}

const close = () => {
  isOpen.value = false
  reset()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  pendingDocument.value = input.files?.[0] ?? null
}

const handleSubmit = async () => {
  if (!title.value.trim()) {
    error.value = 'El título es obligatorio.'
    return
  }

  if (!link.value.trim() && !pendingDocument.value) {
    error.value = 'Agrega un enlace o un archivo.'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('case_study_id', props.caseStudyId.toString())
    formData.append('kind', kind.value)
    formData.append('title', title.value.trim())
    formData.append('link', link.value.trim())

    if (pendingDocument.value) {
      formData.append('document', pendingDocument.value)
    }

    await $fetch('/api/admin/case-studies/resources', { method: 'POST', body: formData })
    close()
    emit('created')
  } catch (err: unknown) {
    const apiError = typeof err === 'object' && err !== null && 'data' in err
      ? (err as { data?: { statusMessage?: string, message?: string } })
      : null
    error.value = apiError?.data?.statusMessage
      || apiError?.data?.message
      || (err instanceof Error ? err.message : 'Error al agregar el recurso')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
    <UButton v-if="!isOpen" icon="i-lucide-plus" variant="soft" size="sm" block @click="isOpen = true">
      Agregar recurso
    </UButton>

    <form v-else class="flex flex-col gap-3" @submit.prevent="handleSubmit">
      <UFormField label="Tipo">
        <USelectMenu v-model="kind" :items="CASE_RESOURCE_KIND_OPTIONS" value-key="value" label-key="label"
          class="w-full" />
      </UFormField>

      <UFormField label="Título" required>
        <UInput v-model="title" placeholder="Ej. Frameworks de entrada a mercados" class="w-full"
          :ui="{ base: 'text-gray-900 placeholder:text-gray-400' }" />
      </UFormField>

      <UFormField label="Enlace" hint="o sube un archivo">
        <UInput v-model="link" type="url" placeholder="https://..." class="w-full"
          :ui="{ base: 'text-gray-900 placeholder:text-gray-400' }" />
      </UFormField>

      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-paperclip" variant="soft" size="xs" @click="documentInput?.click()">
          {{ pendingDocument ? 'Cambiar archivo' : 'Adjuntar archivo' }}
        </UButton>
        <span v-if="pendingDocument" class="text-xs text-gray-500 truncate">{{ pendingDocument.name }}</span>
        <input ref="documentInput" type="file" accept="application/pdf,.pdf,.xlsx,.xls" class="hidden"
          @change="handleFileChange">
      </div>

      <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :description="error" />

      <div class="flex justify-end gap-2 pt-2">
        <UButton color="neutral" variant="soft" size="sm" :disabled="isSaving" @click="close">
          Cancelar
        </UButton>
        <UButton type="submit" size="sm" :loading="isSaving">
          Guardar
        </UButton>
      </div>
    </form>
  </div>
</template>
