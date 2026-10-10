<template>
    <!-- Escape cancela, igual que el botón. -->
    <UCard @keydown.esc.stop="emit('cancel', !!pendingFile)">
        <!-- Apilado como la tarjeta (imagen arriba, texto abajo): asi cabe en una
             columna de la grilla de tres y en la lista de proyectos anteriores. -->
        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <ImagePicker v-model="pendingFile" :current="form.image_url" :disabled="isSaving || !!isDeleting"
                class="h-44" />

            <UFormField label="Título" required>
                <UInput v-model="form.title" placeholder="Ej. Fundación Raíces Urbanas" autofocus />
            </UFormField>

            <UFormField label="Subtítulo">
                <UInput v-model.nullable="form.subtitle" placeholder="Ej. Estrategia de canal digital" />
            </UFormField>

            <UFormField label="Descripción">
                <UTextarea v-model.nullable="form.description" :rows="3" autoresize
                    placeholder="Qué hizo el equipo y qué entregó" />
            </UFormField>

            <UFormField label="Semestre">
                <USelectMenu v-model="semesterModel" :items="semesters" :search-input="false"
                    placeholder="Elige un semestre" />
            </UFormField>

            <UCheckbox v-model="isActiveModel" label="Proyecto activo"
                description="Desmárcalo para moverlo a Proyectos anteriores." />

            <UFormField label="Enlace">
                <UInput v-model.nullable="form.link" type="url" placeholder="https://" />
            </UFormField>

            <UFormField label="Texto del botón" description="Si lo dejas vacío dice «Ver más».">
                <UInput v-model.nullable="form.link_text" placeholder="Ver más" />
            </UFormField>

            <UAlert v-if="formError" color="error" icon="i-lucide-alert-circle" :description="formError" />

            <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-muted">
                <UButton v-if="!isNew" type="button" color="error" icon="i-lucide-trash-2"
                    :loading="!!isDeleting" :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                    Eliminar
                </UButton>
                <UButton type="button" color="neutral" class="ml-auto" :disabled="isSaving"
                    @click="emit('cancel', !!pendingFile)">
                    Cancelar
                </UButton>
                <UButton type="submit" variant="solid" :loading="isSaving" :disabled="!!isDeleting">
                    {{ isNew ? 'Crear' : 'Guardar' }}
                </UButton>
            </div>
        </form>
    </UCard>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'


const form = defineModel<Partial<ProjectRecord>>('form', { required: true })

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

const handleSubmit = () => {
    emit('submit', pendingFile.value)
}

</script>
