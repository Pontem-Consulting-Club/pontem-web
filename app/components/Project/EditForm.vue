<template>
    <UCard variant="soft" class="rounded-xl bg-white">
        <!-- Apilado como la tarjeta (imagen arriba, texto abajo): asi cabe en una
             columna de la grilla de tres y en la lista de proyectos anteriores. -->
        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <UFileUpload :model-value="pendingFile" accept="image/*" variant="area" size="md" :preview="false"
                :interactive="false" :disabled="isSaving || !!isDeleting"
                :ui="{ base: 'h-full', wrapper: 'h-full', files: 'hidden', label: 'hidden', description: 'hidden' }"
                @update:model-value="setPendingFile">
                <template #default="{ open }">
                    <button type="button"
                        class="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition"
                        :class="imagePreviewUrl ? 'border-transparent text-white' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'"
                        :style="uploadBackgroundStyle" @click="open()">
                        <span v-if="imagePreviewUrl" class="absolute inset-0 bg-black/40" />
                        <span class="relative z-10 flex flex-col items-center gap-2 text-sm font-medium">
                            <UIcon name="i-lucide-upload" class="h-5 w-5" />
                            <span>{{ imagePreviewUrl ? 'Cambiar imagen' : 'Subir imagen' }}</span>
                        </span>
                    </button>
                </template>
            </UFileUpload>

            <UFormField label="Título" required>
                <UInput v-model="form.title" placeholder="Ej. Fundación Raíces Urbanas" class="w-full" :ui="inputUi" />
            </UFormField>

            <UFormField label="Subtítulo">
                <UInput v-model.nullable="form.subtitle" placeholder="Ej. Estrategia de canal digital" class="w-full"
                    :ui="inputUi" />
            </UFormField>

            <UFormField label="Descripción">
                <UTextarea v-model.nullable="form.description" :rows="3" autoresize
                    placeholder="Qué hizo el equipo y qué entregó" class="w-full" :ui="inputUi" />
            </UFormField>

            <UFormField label="Semestre">
                <USelectMenu v-model="semesterModel" :items="semesters" :search-input="false"
                    placeholder="Elige un semestre" class="w-full" />
            </UFormField>

            <UCheckbox v-model="isActiveModel" label="Proyecto activo"
                description="Desmárcalo para moverlo a Proyectos anteriores." />

            <UFormField label="Enlace">
                <UInput v-model.nullable="form.link" type="url" placeholder="https://" class="w-full" :ui="inputUi" />
            </UFormField>

            <UFormField label="Texto del botón" description="Si lo dejas vacío dice «Ver más».">
                <UInput v-model.nullable="form.link_text" placeholder="Ver más" class="w-full" :ui="inputUi" />
            </UFormField>

            <UAlert v-if="displayError" color="error" icon="i-lucide-alert-circle" :description="displayError" />

            <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                <UButton v-if="!isNew" type="button" color="error" variant="soft" icon="i-lucide-trash-2"
                    :loading="!!isDeleting" :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                    Eliminar
                </UButton>
                <UButton type="button" color="neutral" variant="soft" class="ml-auto" :disabled="isSaving"
                    @click="emit('cancel')">
                    Cancelar
                </UButton>
                <UButton type="submit" color="primary" :loading="isSaving" :disabled="!!isDeleting">
                    {{ isNew ? 'Crear' : 'Guardar' }}
                </UButton>
            </div>
        </form>
    </UCard>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

const inputUi = { base: 'text-gray-900 placeholder:text-gray-400' }

const form = defineModel<Partial<ProjectRecord>>('form', { required: true })

const props = defineProps<{
    isNew: boolean
    isSaving: boolean
    isDeleting?: boolean
    formError: string
}>()

const emit = defineEmits<{
    (event: 'submit', file?: File | null): void
    (event: 'cancel' | 'delete'): void
}>()

// Se calcula una vez: si se recalculara con form.semester, la lista se
// reordenaria mientras se elige.
const semesters = semesterOptions(form.value.semester)

// USelectMenu no acepta null; en la tabla "sin semestre" es null.
const semesterModel = computed({
    get: () => form.value.semester ?? undefined,
    set: (value: string | undefined) => { form.value.semester = value ?? null }
})

// Un proyecto sin el dato cuenta como activo, igual que el default de la tabla.
const isActiveModel = computed({
    get: () => form.value.is_active !== false,
    set: (value: boolean | 'indeterminate') => { form.value.is_active = value === true }
})

const pendingFile = ref<File | null>(null)
const uploadPreviewUrl = ref<string | null>(null)
const uploadError = ref('')

const revokePreviewUrl = () => {
    if (!uploadPreviewUrl.value) return
    try {
        URL.revokeObjectURL(uploadPreviewUrl.value)
    } catch {
        // ignore
    }
    uploadPreviewUrl.value = null
}

const setPendingFile = (file: File | null | undefined) => {
    pendingFile.value = file ?? null
    revokePreviewUrl()
    if (pendingFile.value) {
        uploadPreviewUrl.value = URL.createObjectURL(pendingFile.value)
    }
}

const formImagePath = computed(() => {
    const value = form.value.image_url?.toString().trim()
    return value && value.length > 0 ? value : null
})

const { url: formImageUrl } = useStorageImage(formImagePath)

const imagePreviewUrl = computed(() => {
    if (uploadPreviewUrl.value) return uploadPreviewUrl.value
    return formImageUrl.value
})

const uploadBackgroundStyle = computed(() => {
    if (!imagePreviewUrl.value) return undefined
    return {
        backgroundImage: `url(${imagePreviewUrl.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
})

const displayError = computed(() => uploadError.value || props.formError)

const handleSubmit = () => {
    emit('submit', pendingFile.value)
}

onBeforeUnmount(() => {
    revokePreviewUrl()
})
</script>
