<script setup lang="ts">
import type { CaseStudyRecord } from '~/types/content'
import { CASE_CATEGORY_OPTIONS, CASE_DIFFICULTY_OPTIONS } from '~/constants/caseStudies'

interface Props {
  isNew?: boolean
  isSaving?: boolean
  isDeleting?: boolean
  formError?: string
}

const props = withDefaults(defineProps<Props>(), {
  isNew: false,
  isSaving: false,
  isDeleting: false,
  formError: ''
})

const emit = defineEmits<{
  (e: 'submit', files: { logo: File | null, document: File | null }): void
  (e: 'cancel' | 'delete'): void
}>()

const form = defineModel<Partial<CaseStudyRecord>>('form', { required: true })

const inputUi = { base: 'text-gray-900 placeholder:text-gray-400' }

/* ── Logo de la empresa ─────────────────────────────────────── */

const logoInput = ref<HTMLInputElement | null>(null)
const pendingLogo = ref<File | null>(null)
const logoPreviewUrl = ref<string | null>(null)

const { url: storedLogoUrl } = useStorageImage(computed(() => form.value.company_logo_url ?? null))

const logoUrl = computed(() => logoPreviewUrl.value ?? storedLogoUrl.value)

const revokeLogoPreview = () => {
  if (!logoPreviewUrl.value) return
  try {
    URL.revokeObjectURL(logoPreviewUrl.value)
  } catch {
    // ignore
  }
  logoPreviewUrl.value = null
}

const handleLogoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  revokeLogoPreview()
  pendingLogo.value = file
  if (file) {
    logoPreviewUrl.value = URL.createObjectURL(file)
  }
}

/* ── Documento PDF (drag & drop) ────────────────────────────── */

const documentInput = ref<HTMLInputElement | null>(null)
const pendingDocument = ref<File | null>(null)
const isDragging = ref(false)
const documentError = ref('')

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return ''
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const selectedDocumentName = computed(() => pendingDocument.value?.name ?? form.value.document_name ?? null)

const selectedDocumentSize = computed(() => {
  if (pendingDocument.value) return formatBytes(pendingDocument.value.size)
  return formatBytes(form.value.document_size_bytes)
})

const setDocument = (file: File | null) => {
  documentError.value = ''

  if (file && file.type !== 'application/pdf') {
    documentError.value = 'El archivo del caso debe ser un PDF.'
    return
  }

  pendingDocument.value = file
}

const handleDocumentChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  setDocument(input.files?.[0] ?? null)
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  setDocument(event.dataTransfer?.files?.[0] ?? null)
}

const clearDocument = () => {
  pendingDocument.value = null
  documentError.value = ''
  if (documentInput.value) {
    documentInput.value.value = ''
  }
  // Limpia tambien el documento ya guardado: al enviar el formulario se persiste como null.
  form.value.document_url = null
  form.value.document_name = null
  form.value.document_size_bytes = null
}

/* ── Envio ──────────────────────────────────────────────────── */

const displayError = computed(() => documentError.value || props.formError)

const handleSubmit = () => {
  emit('submit', { logo: pendingLogo.value, document: pendingDocument.value })
}

onBeforeUnmount(revokeLogoPreview)
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-3xl mx-auto p-6 md:p-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ props.isNew ? 'Subir Nuevo Caso' : 'Editar Caso' }}
      </h1>
      <p class="text-sm text-gray-500">
        Añade material de estudio a la biblioteca. Asegúrate de proporcionar información precisa para
        facilitar su descubrimiento.
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <UFormField label="Título del caso" required>
        <UInput v-model="form.title" placeholder="Ej. Transformación Digital en Retail" size="lg" class="w-full"
          :ui="inputUi" />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Categoría" required>
          <USelectMenu v-model="form.category" :items="CASE_CATEGORY_OPTIONS" value-key="value" label-key="label"
            placeholder="Selecciona una categoría" size="lg" class="w-full" />
        </UFormField>

        <UFormField label="Empresa / Consultora">
          <UInput v-model="form.company" placeholder="Ej. McKinsey, BCG, Bain..." size="lg" class="w-full"
            :ui="inputUi" />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Dificultad">
          <USelectMenu v-model="form.difficulty" :items="CASE_DIFFICULTY_OPTIONS" value-key="value" label-key="label"
            placeholder="Selecciona dificultad" size="lg" class="w-full" />
        </UFormField>

        <UFormField label="Tiempo estimado (minutos)">
          <UInput v-model="form.duration_minutes" type="number" min="0" placeholder="Ej. 45" size="lg" class="w-full"
            :ui="inputUi" />
        </UFormField>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Tipo de caso">
          <UInput v-model="form.case_type" placeholder="Ej. Case Interview, Frameworks" size="lg" class="w-full"
            :ui="inputUi" />
        </UFormField>

        <UFormField label="Fecha de publicación">
          <UInput v-model="form.published_date" type="date" size="lg" class="w-full" :ui="inputUi" />
        </UFormField>
      </div>

      <UFormField label="Planteamiento del problema">
        <UTextarea v-model="form.summary" :rows="4" autoresize
          placeholder="Describe el contexto y el desafío del caso" class="w-full" :ui="inputUi" />
      </UFormField>

      <UFormField label="Encargo al equipo consultor">
        <UTextarea v-model="form.problem_statement" :rows="3" autoresize
          placeholder="Qué se le pide resolver al equipo" class="w-full" :ui="inputUi" />
      </UFormField>

      <UFormField label="Logo de la empresa">
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 rounded-full border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="logoUrl" :src="logoUrl" alt="Logo de la empresa" class="w-full h-full object-contain p-1">
            <UIcon v-else name="i-lucide-building-2" class="w-6 h-6 text-gray-300" />
          </div>
          <UButton icon="i-lucide-image" variant="soft" size="sm" @click="logoInput?.click()">
            {{ logoUrl ? 'Cambiar logo' : 'Subir logo' }}
          </UButton>
          <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="handleLogoChange">
        </div>
      </UFormField>

      <UFormField label="Archivo del caso (PDF)">
        <div v-if="!selectedDocumentName"
          class="w-full rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
          :class="isDragging ? 'border-primary bg-pontemred-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'"
          @click="documentInput?.click()" @dragenter.prevent="isDragging = true" @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
          <UIcon name="i-lucide-upload" class="w-8 h-8 text-gray-400" />
          <p class="text-sm text-gray-700">Arrastra y suelta tu archivo PDF aquí</p>
          <p class="text-xs text-gray-400">o haz clic para explorar</p>
        </div>

        <div v-else
          class="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-pontempurple-50 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-pontempurple-600" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ selectedDocumentName }}</p>
              <p v-if="selectedDocumentSize" class="text-xs text-gray-400">{{ selectedDocumentSize }}</p>
            </div>
          </div>
          <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" aria-label="Quitar archivo"
            @click="clearDocument" />
        </div>

        <input ref="documentInput" type="file" accept="application/pdf,.pdf" class="hidden"
          @change="handleDocumentChange">
      </UFormField>

      <UAlert v-if="displayError" color="error" icon="i-lucide-alert-circle" :description="displayError" />

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
        <UButton v-if="!props.isNew" color="error" variant="soft" icon="i-lucide-trash-2" :loading="props.isDeleting"
          @click="emit('delete')">
          Eliminar
        </UButton>
        <UButton color="neutral" variant="soft" :disabled="props.isSaving" @click="emit('cancel')">
          Cancelar
        </UButton>
        <UButton type="submit" icon="i-lucide-upload" :loading="props.isSaving">
          {{ props.isNew ? 'Publicar Caso' : 'Guardar cambios' }}
        </UButton>
      </div>
    </form>
  </div>
</template>
