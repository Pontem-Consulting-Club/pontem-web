<template>
    <UCard variant="soft" class="bg-white rounded-lg px-6 pb-6 shadow-sm">
        <div class="flex items-center mb-6">
            <UButton variant="soft" icon="i-lucide-arrow-left" @click="emit('cancel')">
                Volver
            </UButton>
        </div>
        <UForm class="flex flex-col gap-5" @submit.prevent="handleSubmit">
            <UFormField>
                <UFileUpload :model-value="pendingFile" accept="image/*" variant="area" size="md" :preview="false"
                    :interactive="false" :disabled="isSaving || isUploading" class="min-h-48"
                    :ui="{ base: 'h-full', wrapper: 'h-full', files: 'hidden', label: 'hidden', description: 'hidden' }"
                    @update:model-value="setPendingFile">
                    <template #default="{ open }">
                        <button type="button"
                            class="relative flex h-full min-h-75 w-full items-center justify-center bg-gray-200 overflow-hidden rounded-lg text-white/80 transition hover:text-white"
                            :style="uploadBackgroundStyle" @click="open()">
                            <span v-if="uploadBackgroundStyle" class="absolute inset-0 bg-black/30" />
                            <span class="relative z-10 flex flex-col items-center gap-2 text-sm font-medium">
                                <UIcon name="i-lucide-upload" class="h-5 w-5" />
                                <span>{{ imagePreviewUrl ? 'Cambiar imagen' : 'Subir imagen' }}</span>
                            </span>
                        </button>
                    </template>
                </UFileUpload>
            </UFormField>

            <USelect v-model="typeModel" placeholder="Tipo" variant="none" :items="newsTypes" class="max-w-30"
                :ui="{ value: 'text-gray-600 font-bold', placeholder: 'text-gray-400', content: 'bg-white text-gray-700', item: 'text-gray-700 hover:bg-pontemred/10' }" />

            <UFormField>
                <UInput v-model="form.title" placeholder="Título" class="w-full h-fit" variant="none"
                    :ui="{ base: 'text-primary text-2xl text-wrap font-bold placeholder:text-primary/50' }" />
            </UFormField>

            <UFormField>
                <UInput v-model="form.subtitle" placeholder="Subtítulo" class="w-full h-fit" variant="none"
                    :ui="{ base: [baseUIClasses, 'text-lg font-bold'] }" />
            </UFormField>

            <UFormField>
                <UTextarea v-model="form.content" :rows="10" placeholder="Descripción" class="w-full" variant="none"
                    autoresize :ui="{ base: [baseUIClasses, 'text-md text-justify'] }" />
            </UFormField>

            <div class="flex items-center justify-between text-sm mb-4 gap-2">
                <UFormField>
                    <span class="text-gray-700 font-medium pl-3">Autor:</span>
                    <UInput v-model="form.author" placeholder="Autor" variant="none" :ui="{ base: baseUIClasses }" />
                </UFormField>

                <UFormField>
                    <span class="text-gray-700 font-medium">Fecha:</span>
                    <UInput v-model="publishedDateModel" type="date" variant="none" :ui="{ base: baseUIClasses }" />
                </UFormField>
            </div>


            <UAlert v-if="displayError" color="error" icon="i-lucide-alert-circle" :description="displayError"
                class="mb-4" />

            <div class="flex justify-end">
                <UButton type="submit" color="primary" size="md" variant="soft" :loading="isSaving">
                    Guardar
                </UButton>
            </div>
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const baseUIClasses = 'text-gray-600 placeholder:text-gray-400'

const form = defineModel<Partial<NewsRecord>>('form', { required: true })

const props = defineProps<{
    isNew: boolean
    isSaving: boolean
    formError: string
}>()

const emit = defineEmits<{
    (event: 'submit' | 'cancel'): void
}>()

const newsTypes = ['Evento', 'Artículo', 'Anuncio']

const typeModel = computed<string | undefined>({
    get: () => form.value.type ?? undefined,
    set: (value) => {
        form.value.type = value ?? null
    }
})

const publishedDateModel = computed<string | undefined>({
    get: () => {
        const value = form.value.published_date?.toString()
        if (!value) return undefined
        return value.split('T')[0]
    },
    set: (value) => {
        if (!value) {
            form.value.published_date = undefined
            return
        }
        const isoDate = new Date(`${value}T00:00:00Z`).toISOString()
        form.value.published_date = isoDate
    }
})

const {
    pendingFile,
    previewUrl: uploadPreviewUrl,
    isUploading,
    error: uploadError,
    setPendingFile,
    uploadPendingFile
} = useDeferredImageUpload({ folder: 'news' })

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

const handleSubmit = async () => {
    const uploadedPath = await uploadPendingFile()
    if (uploadError.value) return
    if (uploadedPath) {
        form.value.image_url = uploadedPath
    }

    emit('submit')
}
</script>
