<template>
    <UCard variant="soft" class="rounded-xl bg-white/75">
        <div class="flex items-center mb-4">
            <UButton variant="soft" icon="i-lucide-arrow-left" @click="emit('cancel')">
                Volver
            </UButton>
        </div>
        <UForm @submit.prevent="handleSubmit">
            <!-- Mirrors the display card's flex flex-col md:flex-row layout -->
            <div class="flex flex-col md:flex-row gap-4">
                <!-- Left column: text fields matching display order and styles -->
                <div class="flex flex-col flex-1 gap-3">
                    <UInput v-model="form.title" placeholder="Título" variant="none"
                        :ui="{ base: 'text-xl text-primary font-semibold placeholder:text-primary/50' }" />
                    <UInput v-model="form.subtitle" placeholder="Subtítulo" variant="none"
                        :ui="{ base: [baseUIClasses, 'font-semibold'] }" />
                    <UTextarea v-model="form.description" :maxrows="0" placeholder="Descripción" variant="none" autoresize
                        :ui="{ base: [baseUIClasses, 'text-justify'] }" />
                    <div class="flex gap-2 mt-1">
                        <UInput v-model="form.link_text" placeholder="Texto del enlace" variant="none"
                            :ui="{ base: baseUIClasses }" />
                        <UInput v-model="form.link" type="url" placeholder="Enlace" variant="none"
                            :ui="{ base: baseUIClasses }" />
                    </div>
                </div>

                <!-- Right column: image upload mirrors the display image position -->
                <div class="relative m-auto w-130 max-w-full">
                    <UFileUpload :model-value="pendingFile" accept="image/*" variant="area" size="md" :preview="false"
                        :interactive="false" :disabled="isSaving || !!isDeleting"
                        :ui="{ base: 'h-full', wrapper: 'h-full', files: 'hidden', label: 'hidden', description: 'hidden' }"
                        @update:model-value="setPendingFile">
                        <template #default="{ open }">
                            <button type="button"
                                class="relative flex min-h-48 w-full min-w-48 items-center justify-center bg-gray-200 overflow-hidden rounded-xl text-white/80 transition hover:text-white"
                                :style="uploadBackgroundStyle" @click="open()">
                                <span v-if="uploadBackgroundStyle" class="absolute inset-0 bg-black/30" />
                                <span class="relative z-10 flex flex-col items-center gap-2 text-sm font-medium">
                                    <UIcon name="i-lucide-upload" class="h-5 w-5" />
                                    <span>{{ imagePreviewUrl ? 'Cambiar imagen' : 'Subir imagen' }}</span>
                                </span>
                            </button>
                        </template>
                    </UFileUpload>
                </div>
            </div>

            <UAlert v-if="displayError" color="error" icon="i-lucide-alert-circle" :description="displayError"
                class="mt-4" />

            <div class="flex justify-between mt-4">
                <UButton v-if="!isNew" type="button" color="error" variant="soft" size="md" icon="i-lucide-trash-2"
                    :loading="!!isDeleting" :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                    Eliminar
                </UButton>
                <UButton type="submit" color="primary" size="md" variant="soft" :loading="isSaving"
                    :disabled="!!isDeleting">
                    Guardar
                </UButton>
            </div>
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

const baseUIClasses = 'text-gray-600 placeholder:text-gray-400'

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
