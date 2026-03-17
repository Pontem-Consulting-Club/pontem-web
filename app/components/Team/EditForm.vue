<template>
    <!-- Mirrors TeamMemberCard: centered portrait layout with circular image -->
    <UCard variant="soft" class="text-center bg-white">
        <UForm class="flex flex-col items-center gap-4" @submit.prevent="handleSubmit">
            <!-- Circular upload mirrors the h-20 w-20 rounded-full display image -->
            <UFileUpload :model-value="pendingFile" accept="image/*" variant="area" size="md" :preview="false"
                :interactive="false" :disabled="isSaving || !!isDeleting"
                :ui="{ base: 'h-full', wrapper: 'h-full', files: 'hidden', label: 'hidden', description: 'hidden' }"
                @update:model-value="setPendingFile">
                <template #default="{ open }">
                    <button type="button"
                        class="relative flex h-20 w-20 items-center justify-center bg-gray-200 overflow-hidden rounded-full border border-gray-200 text-white/80 transition hover:text-white"
                        :style="uploadBackgroundStyle" @click="open()">
                        <span v-if="uploadBackgroundStyle" class="absolute inset-0 bg-black/30 rounded-full" />
                        <UIcon name="i-lucide-upload" class="relative z-10 h-5 w-5" />
                    </button>
                </template>
            </UFileUpload>

            <!-- Name mirrors h3.text-lg.font-semibold.text-primary -->
            <UInput v-model="form.name" placeholder="Nombre" class="w-full" variant="none"
                :ui="{ base: 'text-center text-lg font-semibold text-primary placeholder:text-primary/50' }" />

            <USelect v-model="form.role" :items="TEAM_ROLE_OPTIONS" placeholder="Selecciona un rol"
                value-key="value" class="w-full" :disabled="isSaving || !!isDeleting"
                :ui="{ base: 'text-gray-700', content: 'text-gray-700' }" />

            <UAlert v-if="displayError" color="error" icon="i-lucide-alert-circle" :description="displayError"
                class="w-full" />

            <div class="flex justify-between w-full">
                <UButton v-if="!isNew" type="button" color="error" variant="soft" size="md" icon="i-lucide-trash-2"
                    :loading="!!isDeleting" :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                    Eliminar
                </UButton>
                <UButton variant="soft" icon="i-lucide-x" size="sm" :disabled="isSaving || !!isDeleting"
                    @click="emit('cancel')">
                    Cancelar
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
import type { TeamRecord } from '~/types/content'
import { TEAM_ROLE_OPTIONS } from '~/constants/teamRoles'

const form = defineModel<Partial<TeamRecord>>('form', { required: true })

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
