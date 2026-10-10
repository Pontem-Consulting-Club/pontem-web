<template>
    <!-- Escape cancela, igual que "Volver". -->
    <div class="absolute inset-0 z-30" @keydown.esc.stop="emit('cancel', !!pendingFile)">
        <div v-if="previewUrl" class="absolute inset-0 bg-cover bg-center grayscale"
            :style="{ backgroundImage: `url(${previewUrl})` }" />
        <div v-else class="absolute inset-0 bg-inverted" />
        <div class="absolute inset-0 bg-black/70" />

        <div class="relative z-10 flex h-full items-center overflow-y-auto">
            <UContainer class="py-8">
                <UTheme :ui="onImage">
                    <UForm :state="form" class="flex max-w-2xl flex-col gap-3 text-white" @submit.prevent="handleSubmit">
                        <!-- Imita el título de la portada -->
                        <UInput v-model="form.title" placeholder="Título" variant="none" autofocus
                            :ui="{ base: [onImageField, 'text-title md:text-title'] }" />
                        <UTextarea v-model.nullable="form.subtitle" :rows="2" placeholder="Subtítulo" variant="none"
                            autoresize />

                        <div class="flex flex-wrap gap-3">
                            <UInput v-model.nullable="form.button_text" placeholder="Texto del botón" variant="none"
                                class="w-auto" />
                            <UInput v-model.nullable="form.link" placeholder="Enlace (/eventos o https://...)" variant="none"
                                class="w-auto grow" />
                        </div>

                        <ImagePicker v-model="pendingFile" :current="form.image_url" mode="button"
                            :disabled="isSaving || !!isDeleting" class="w-fit" />

                        <UAlert v-if="formError" color="error" icon="i-lucide-alert-circle" :description="formError"
                            class="mt-2" />

                        <div class="mt-4 flex flex-wrap justify-between gap-3">
                            <div class="flex gap-3">
                                <UButton type="button" icon="i-lucide-arrow-left" :disabled="isSaving || !!isDeleting"
                                    @click="emit('cancel', !!pendingFile)">
                                    Volver
                                </UButton>
                                <UButton v-if="!isNew" type="button" icon="i-lucide-trash-2" :loading="!!isDeleting"
                                    :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                                    Eliminar
                                </UButton>
                            </div>
                            <UButton type="submit" :loading="isSaving" :disabled="!!isDeleting">
                                Guardar
                            </UButton>
                        </div>
                    </UForm>
                </UTheme>
            </UContainer>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { HeroSlideRecord } from '~/types/content'
import { onImage, onImageField } from '~/theme/presets'

const form = defineModel<Partial<HeroSlideRecord>>('form', { required: true })

defineProps<{
    isNew: boolean
    isSaving: boolean
    isDeleting?: boolean
    formError: string
}>()

const emit = defineEmits<{
    (event: 'submit', file?: File | null): void
    /** `hasPendingFile`: se eligió una imagen que todavía no se sube. */
    (event: 'cancel', hasPendingFile: boolean): void
    (event: 'delete'): void
}>()

const pendingFile = ref<File | null>(null)
// El fondo del formulario muestra la imagen elegida, como quedará la portada.
const { previewUrl } = useImagePreview(pendingFile, computed(() => form.value.image_url))

const handleSubmit = () => {
    emit('submit', pendingFile.value)
}
</script>
