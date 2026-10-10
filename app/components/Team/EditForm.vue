<template>
    <UCard class="text-center">
        <UForm class="flex flex-col items-center gap-4" @submit.prevent="handleSubmit">
            <!-- Imita el nombre de la tarjeta del integrante -->
            <UInput v-model="form.name" placeholder="Nombre" variant="ghost"
                :ui="{ base: 'text-center text-lg font-semibold text-primary placeholder:text-primary/50 md:text-lg' }" />

            <USelect v-model="form.coordination" :items="TEAM_COORDINATION_OPTIONS" placeholder="Selecciona una coordinación"
                value-key="value" :disabled="isSaving || !!isDeleting" />

            <UAlert v-if="displayError" color="error" icon="i-lucide-alert-circle" :description="displayError"
                class="w-full" />

            <div class="flex justify-between w-full">
                <UButton v-if="!isNew" type="button" color="error" icon="i-lucide-trash-2"
                    :loading="!!isDeleting" :disabled="isSaving || !!isDeleting" @click="emit('delete')">
                    Eliminar
                </UButton>
                <UButton color="neutral" icon="i-lucide-x" :disabled="isSaving || !!isDeleting"
                    @click="emit('cancel')">
                    Cancelar
                </UButton>
                <UButton type="submit" variant="solid" :loading="isSaving"
                    :disabled="!!isDeleting">
                    Guardar
                </UButton>
            </div>
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
import type { TeamRecord } from '~/types/content'
import { TEAM_COORDINATION_OPTIONS } from '~/constants/teamRoles'

const form = defineModel<Partial<TeamRecord>>('form', { required: true })

const props = defineProps<{
    isNew: boolean
    isSaving: boolean
    isDeleting?: boolean
    formError: string
}>()

const emit = defineEmits<{
    (event: 'submit' | 'cancel' | 'delete'): void
}>()

const displayError = computed(() => props.formError)

const handleSubmit = () => {
    emit('submit')
}
</script>
