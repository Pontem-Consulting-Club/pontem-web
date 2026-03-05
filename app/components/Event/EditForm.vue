<template>
    <UCard variant="soft" class="bg-white/90 rounded-3xl px-6 pb-6 shadow-sm">
        <div class="flex items-center mb-4">
            <UButton variant="soft" icon="i-lucide-arrow-left" @click="emit('cancel')">
                Volver
            </UButton>
        </div>
        <UForm @submit.prevent="handleSubmit">
            <div class="flex flex-col md:flex-row gap-6">
                <div class="md:w-32 shrink-0">
                    <div class="bg-primary-50 rounded-lg p-4 text-center">
                        <UInput v-model="dateModel" type="date" placeholder="Fecha" variant="none"
                            :ui="{ base: 'text-primary-600 text-sm text-center' }" />
                    </div>
                </div>

                <div class="flex-1 flex flex-col gap-3">
                    <UInput v-model="form.title" placeholder="Título" variant="none"
                        :ui="{ base: 'text-xl font-semibold placeholder:text-primary/50' }" />
                    <UInput v-model="form.subtitle" placeholder="Subtítulo" variant="none"
                        :ui="{ base: [baseUIClasses] }" />
                    <UTextarea v-model="form.description" :rows="3" placeholder="Descripción" variant="none" autoresize
                        :ui="{ base: [baseUIClasses, 'text-justify'] }" />
                    <div class="flex flex-wrap gap-4 text-sm">
                        <UInput v-model="form.location" placeholder="Ubicación" variant="none"
                            :ui="{ base: baseUIClasses }" />
                        <UInput v-model="form.link" type="url" placeholder="Enlace" variant="none"
                            :ui="{ base: 'text-primary-600 placeholder:text-gray-400' }" />
                    </div>
                </div>

                <div class="md:w-48 shrink-0">
                    <UFileUpload :model-value="pendingFile" accept="image/*" variant="area" size="md" :preview="false"
                        :interactive="false" :disabled="isSaving || !!isDeleting"
                        :ui="{ base: 'h-full', wrapper: 'h-full', files: 'hidden', label: 'hidden', description: 'hidden' }"
                        @update:model-value="setPendingFile">
                        <template #default="{ open }">
                            <button type="button"
                                class="relative flex h-32 w-full items-center justify-center bg-gray-200 overflow-hidden rounded-lg text-white/80 transition hover:text-white"
                                :style="uploadBackgroundStyle" @click="open()">
                                <span v-if="uploadBackgroundStyle" class="absolute inset-0 bg-black/30" />
                                <span class="relative z-10 flex flex-col items-center gap-1 text-xs font-medium">
                                    <UIcon name="i-lucide-upload" class="h-4 w-4" />
                                    <span>{{ imagePreviewUrl ? 'Cambiar' : 'Subir imagen' }}</span>
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
import type { EventRecord } from '~/types/content'

const baseUIClasses = 'text-gray-600 placeholder:text-gray-400'

const form = defineModel<Partial<EventRecord>>('form', { required: true })

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

const dateModel = computed<string | undefined>({
    get: () => {
        const value = form.value.date?.toString()
        if (!value) return undefined
        return value.split('T')[0]
    },
    set: (value) => {
        if (!value) {
            form.value.date = undefined
            return
        }
        const isoDate = new Date(`${value}T00:00:00Z`).toISOString()
        form.value.date = isoDate
    }
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
