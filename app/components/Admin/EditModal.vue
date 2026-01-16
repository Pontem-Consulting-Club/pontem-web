<script setup lang="ts">
export interface AdminFieldConfig {
    key: string
    label: string
    type?: 'textarea'
    inputType?: 'text' | 'url'
    required?: boolean
    placeholder?: string
}

withDefaults(defineProps<{
    title: string
    fields: AdminFieldConfig[]
    error?: string
    loading?: boolean
}>(), {
    error: '',
    loading: false
})

const emit = defineEmits<{ (e: 'submit'): void }>()

const isOpen = defineModel<boolean>({ default: false })
const formData = defineModel<Partial<Record<string, string | number | null>>>('formData', { required: true })

const handleSubmit = () => emit('submit')
const handleClose = () => { isOpen.value = false }
</script>

<template>
    <UModal v-model="isOpen" :ui="{ overlay: 'z-50 bg-black/50 backdrop-blur-sm', wrapper: 'z-50', content: 'z-50' }">
        <UCard variant="soft" class="bg-white text-gray-900 border border-gray-200 shadow-xl">
            <template #header>
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-sm text-gray-500">
                            Edición
                        </p>
                        <h3 class="text-lg font-semibold">
                            {{ title }}
                        </h3>
                    </div>
                    <UButton icon="i-lucide-x" variant="ghost" color="neutral" @click="handleClose" />
                </div>
            </template>

            <form class="space-y-4" autocomplete="on" @submit.prevent="handleSubmit">
                <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :description="error" />

                <div v-if="!fields.length" class="text-sm text-gray-500">
                    Selecciona un elemento para editar.
                </div>

                <div v-else class="space-y-4">
                    <div v-for="field in fields" :key="field.key" class="space-y-1">
                        <UFormField :label="field.label" :required="field.required">
                            <component :is="field.type === 'textarea' ? 'UTextarea' : 'UInput'"
                                v-model="formData[field.key]" :type="field.inputType || 'text'"
                                :placeholder="field.placeholder" />
                        </UFormField>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <UButton type="button" variant="ghost" color="neutral" :disabled="loading" @click="handleClose">
                        Cancelar
                    </UButton>
                    <UButton type="submit" color="primary" :loading="loading" :disabled="!fields.length">
                        Guardar cambios
                    </UButton>
                </div>
            </form>
        </UCard>
    </UModal>
</template>
