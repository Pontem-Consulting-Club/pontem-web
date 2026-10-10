<template>
    <!-- Escape cancela, igual que "Volver". -->
    <UCard @keydown.esc.stop="emit('cancel', !!pendingFile)">
        <div class="mb-6 flex items-center">
            <UButton icon="i-lucide-arrow-left" @click="emit('cancel', !!pendingFile)">
                Volver
            </UButton>
        </div>
        <UTheme :ui="inlineEdit">
            <UForm class="flex flex-col gap-5" @submit.prevent="handleSubmit">
                <UFormField>
                    <ImagePicker v-model="pendingFile" :current="form.image_url" :disabled="isSaving || !!isDeleting"
                        class="min-h-75" />
                </UFormField>

                <USelect v-model="typeModel" placeholder="Tipo" variant="ghost" :items="newsTypes" class="max-w-30" />

                <UFormField>
                    <!-- Imita el título de la noticia -->
                    <UInput v-model="form.title" placeholder="Título" variant="ghost" autofocus
                        :ui="{ base: 'text-heading text-primary placeholder:text-primary/50 md:text-heading' }" />
                </UFormField>

                <UFormField>
                    <UInput v-model.nullable="form.subtitle" placeholder="Subtítulo" variant="ghost"
                        :ui="{ base: [inlineEditField, 'text-lg font-semibold md:text-lg'] }" />
                </UFormField>

                <UFormField>
                    <UTextarea v-model.nullable="form.content" :rows="10" placeholder="Descripción" variant="ghost" autoresize
                        :ui="{ base: [inlineEditField, 'text-justify'] }" />
                </UFormField>

                <div class="mb-4 flex items-center justify-between gap-2 text-sm">
                    <UFormField label="Autor">
                        <UInput v-model.nullable="form.author" placeholder="Autor" variant="ghost" />
                    </UFormField>

                    <UFormField label="Fecha">
                        <UInput v-model="publishedDateModel" type="date" variant="ghost" />
                    </UFormField>
                </div>

                <UAlert v-if="formError" color="error" icon="i-lucide-alert-circle" :description="formError" class="mb-4" />

                <div class="flex justify-between">
                    <UButton v-if="!isNew" type="button" color="error" icon="i-lucide-trash-2" :loading="!!isDeleting"
                        :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                        Eliminar
                    </UButton>
                    <UButton type="submit" variant="solid" :loading="isSaving" :disabled="!!isDeleting">
                        Guardar
                    </UButton>
                </div>
            </UForm>
        </UTheme>
    </UCard>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'
import { inlineEdit, inlineEditField } from '~/theme/presets'

const form = defineModel<Partial<NewsRecord>>('form', { required: true })

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

const newsTypes = ['Evento', 'Artículo', 'Anuncio']

const typeModel = computed<string | undefined>({
    get: () => form.value.type ?? undefined,
    set: (value) => {
        form.value.type = value ?? null
    }
})

// Igual que en eventos: el día que se elige es el día de Chile.
const publishedDateModel = computed<string | undefined>({
    get: () => form.value.published_date ? clubDay(form.value.published_date) : undefined,
    set: (value) => {
        form.value.published_date = value ? setClubDay(value, form.value.published_date) : undefined
    }
})

const pendingFile = ref<File | null>(null)

const handleSubmit = () => {
    emit('submit', pendingFile.value)
}
</script>
