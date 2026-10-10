<template>
    <!-- Escape cancela, igual que "Volver". -->
    <UCard @keydown.esc.stop="emit('cancel', !!pendingFile)">
        <div class="mb-4 flex items-center">
            <UButton icon="i-lucide-arrow-left" @click="emit('cancel', !!pendingFile)">
                Volver
            </UButton>
        </div>
        <UTheme :ui="inlineEdit">
        <UForm @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-6 md:flex-row">
                <div class="shrink-0 md:w-32">
                    <div class="rounded-lg bg-primary-50 p-4 text-center">
                        <!-- Imita la fecha de la tarjeta -->
                        <UInput v-model="dateModel" type="date" placeholder="Fecha" variant="ghost"
                            :ui="{ base: 'text-center text-sm text-primary-700 md:text-sm' }" />
                    </div>
                </div>

                <div class="flex flex-1 flex-col gap-3">
                    <UInput v-model="form.title" placeholder="Título" variant="ghost" autofocus
                        :ui="{ base: 'text-subheading text-highlighted placeholder:text-primary/50 md:text-subheading' }" />
                    <UInput v-model.nullable="form.subtitle" placeholder="Subtítulo" variant="ghost" />
                    <UTextarea v-model.nullable="form.description" :rows="3" placeholder="Descripción" variant="ghost"
                        autoresize :ui="{ base: [inlineEditField, 'text-justify'] }" />
                    <div class="flex flex-wrap gap-4 text-sm">
                        <UInput v-model.nullable="form.location" placeholder="Ubicación" variant="ghost" class="w-auto" />
                        <UInput v-model.nullable="form.link" type="url" placeholder="Enlace" variant="ghost" class="w-auto"
                            :ui="{ base: 'text-primary' }" />
                    </div>
                </div>

                <div class="md:w-48 shrink-0">
                    <ImagePicker v-model="pendingFile" :current="form.image_url" :disabled="isSaving || !!isDeleting"
                        :labels="['Subir imagen', 'Cambiar']" class="min-h-32" />
                </div>
            </div>

            <!-- FR-32: el modo decide si hay inscripcion y para quien. -->
            <UCard variant="inset" class="mt-6" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-2 text-sm font-medium text-default">
                    <UIcon name="i-lucide-clipboard-list" class="size-4" />
                    Inscripción
                </div>
                <div class="grid gap-4 sm:grid-cols-3">
                    <UFormField label="Modo" size="sm">
                        <USelectMenu v-model="registrationModeModel" :items="registrationModeOptions" value-key="value"
                            label-key="label" class="w-full" />
                    </UFormField>
                    <UFormField label="Cupo" size="sm" description="Vacío = sin límite">
                        <UInput v-model="capacityModel" type="number" min="1" placeholder="Sin límite"
                            :disabled="form.registration_mode === 'none'" />
                    </UFormField>
                    <UFormField label="Estado" size="sm">
                        <UCheckbox v-model="registrationOpenModel" label="Inscripción abierta"
                            :disabled="form.registration_mode === 'none'" />
                    </UFormField>
                </div>
                <p class="text-xs text-muted">{{ registrationHint }}</p>
            </UCard>

            <UAlert v-if="formError" color="error" icon="i-lucide-alert-circle" :description="formError"
                class="mt-4" />

            <div class="flex justify-between mt-4">
                <UButton v-if="!isNew" type="button" color="error" icon="i-lucide-trash-2"
                    :loading="!!isDeleting" :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                    Eliminar
                </UButton>
                <UButton type="submit" variant="solid" :loading="isSaving"
                    :disabled="!!isDeleting">
                    Guardar
                </UButton>
            </div>
        </UForm>
        </UTheme>
    </UCard>
</template>

<script setup lang="ts">
import { inlineEdit, inlineEditField } from '~/theme/presets'
import type { EventRecord } from '~/types/content'

const form = defineModel<Partial<EventRecord>>('form', { required: true })

const registrationModeOptions = [
    { label: 'Sin inscripción', value: 'none' },
    { label: 'Solo miembros', value: 'members_only' },
    { label: 'Abierto a invitados', value: 'open' }
]

const registrationHints: Record<string, string> = {
    none: 'El evento se anuncia, pero nadie se inscribe.',
    members_only: 'Solo cuentas con sesión iniciada pueden inscribirse.',
    open: 'Se inscriben miembros y también invitados sin cuenta, con nombre y correo.'
}

const registrationModeModel = computed({
    get: () => form.value.registration_mode ?? 'none',
    set: (value) => { form.value.registration_mode = value }
})

const registrationOpenModel = computed({
    get: () => form.value.registration_open ?? true,
    set: (value) => { form.value.registration_open = value }
})

const capacityModel = computed({
    get: () => form.value.capacity ?? null,
    set: (value) => {
        // Un UInput type="number" sin el modificador .number entrega el texto del
        // campo: al vaciarlo llega '' aunque el tipo del computed diga number.
        const raw = value as number | string | null
        const parsed = raw === null || raw === '' ? null : Number(raw)
        form.value.capacity = parsed === null || Number.isNaN(parsed) ? null : parsed
    }
})

const registrationHint = computed(() => registrationHints[registrationModeModel.value] ?? '')

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

// Se elige y se muestra el día de Chile. Antes se guardaba como medianoche UTC,
// que en Chile es el día anterior, y había que elegir un día más.
const dateModel = computed<string | undefined>({
    get: () => form.value.date ? clubDay(form.value.date) : undefined,
    set: (value) => {
        form.value.date = value ? setClubDay(value, form.value.date) : undefined
    }
})

const pendingFile = ref<File | null>(null)

const handleSubmit = () => {
    emit('submit', pendingFile.value)
}

</script>
