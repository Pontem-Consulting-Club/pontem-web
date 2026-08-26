<template>
    <div class="absolute inset-0 z-30">
        <div v-if="imagePreviewUrl" class="absolute inset-0 bg-cover bg-center grayscale"
            :style="{ backgroundImage: `url(${imagePreviewUrl})` }" />
        <div v-else class="absolute inset-0 bg-gray-800" />
        <div class="absolute inset-0 bg-black/70" />

        <div class="relative z-10 h-full overflow-y-auto flex items-center">
            <div class="container mx-auto px-4 md:px-8 lg:px-32 py-8">
                <UForm :state="form" class="max-w-2xl text-white flex flex-col gap-3" @submit.prevent="handleSubmit">
                    <UInput v-model="form.title" placeholder="Título" variant="none" :class="fieldClasses"
                        :ui="{ base: [titleUIClasses] }" />
                    <UTextarea v-model="form.subtitle" :rows="2" placeholder="Subtítulo" variant="none" autoresize
                        :class="fieldClasses" :ui="{ base: [baseUIClasses] }" />

                    <div class="flex flex-wrap gap-3">
                        <UInput v-model="form.button_text" placeholder="Texto del botón" variant="none"
                            :class="fieldClasses" :ui="{ base: [baseUIClasses] }" />
                        <UInput v-model="form.link" placeholder="Enlace (/eventos o https://...)" variant="none"
                            :class="[fieldClasses, 'grow']" :ui="{ base: [baseUIClasses] }" />
                    </div>

                    <UFileUpload :model-value="pendingFile" accept="image/*" variant="area" size="md" :preview="false"
                        :interactive="false" :disabled="isSaving || !!isDeleting"
                        :ui="{ files: 'hidden', label: 'hidden', description: 'hidden' }"
                        @update:model-value="setPendingFile">
                        <template #default="{ open }">
                            <button type="button"
                                class="flex w-fit items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
                                @click="open()">
                                <UIcon name="i-lucide-upload" class="h-4 w-4" />
                                <span>{{ imagePreviewUrl ? 'Cambiar imagen' : 'Subir imagen' }}</span>
                            </button>
                        </template>
                    </UFileUpload>

                    <UAlert v-if="displayError" color="error" icon="i-lucide-alert-circle" :description="displayError"
                        class="mt-2" />

                    <div class="flex flex-wrap justify-between gap-3 mt-4">
                        <div class="flex gap-3">
                            <UButton type="button" variant="soft" color="neutral" icon="i-lucide-arrow-left"
                                :disabled="isSaving || !!isDeleting" @click="emit('cancel')">
                                Volver
                            </UButton>
                            <UButton v-if="!isNew" type="button" color="error" variant="soft" icon="i-lucide-trash-2"
                                :loading="!!isDeleting" :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                                Eliminar
                            </UButton>
                        </div>
                        <UButton type="submit" color="primary" variant="soft" :loading="isSaving"
                            :disabled="!!isDeleting">
                            Guardar
                        </UButton>
                    </div>
                </UForm>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { HeroSlideRecord } from '~/types/content'

const titleUIClasses = 'text-3xl md:text-4xl font-bold text-white placeholder:text-white/50'
const baseUIClasses = 'text-white placeholder:text-white/50'
// the form sits on top of the slide photo, so each control needs its own surface to read as editable
const fieldClasses = 'rounded-lg bg-white/10 px-3 py-1 ring-1 ring-white/25 transition focus-within:ring-white/60'

const form = defineModel<Partial<HeroSlideRecord>>('form', { required: true })

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

const displayError = computed(() => uploadError.value || props.formError)

const handleSubmit = () => {
    emit('submit', pendingFile.value)
}

onBeforeUnmount(() => {
    revokePreviewUrl()
})
</script>
