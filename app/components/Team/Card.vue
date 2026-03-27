<template>
    <TeamEditForm v-if="isEditing" v-model:form="form" :is-new="_props.isNew" :is-saving="isSaving"
        :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="cancelEdit"
        @delete="handleDelete" />

    <div v-else class="relative">
        <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="xs" color="primary" variant="ghost"
            class="absolute top-2 right-2 z-10" @click="startEdit" />

<TeamMemberCard :name="member.name" :coordination="member.coordination" :image-url="coordinationImageUrl" />
    </div>
</template>

<script setup lang="ts">
import type { TeamRecord } from '~/types/content'
import { isValidTeamCoordination } from '~/constants/teamRoles'

interface Props {
    member: TeamRecord
    isNew?: boolean
    coordinationImageUrl?: string | null
}

const _props = withDefaults(defineProps<Props>(), {
    isNew: false,
    coordinationImageUrl: null,
})

const member = toRef(_props, 'member')
const emit = defineEmits<{
    (e: 'updated' | 'created' | 'cancel-create'): void
}>()

const { isAuthenticated } = useAuth()

const isEditing = ref(_props.isNew)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')
const form = ref<Partial<TeamRecord>>({})

watch(member, (value) => {
    if (_props.isNew || !isEditing.value) {
        form.value = { ...value }
    }
}, { immediate: true, deep: true })

const validateForm = () => {
    if (!form.value.name || !form.value.name.toString().trim()) {
        return 'El nombre es obligatorio.'
    }
    if (!form.value.coordination || !form.value.coordination.toString().trim()) {
        return 'La coordinación es obligatoria.'
    }
    if (!isValidTeamCoordination(form.value.coordination.toString().trim())) {
        return 'Selecciona una coordinación válida.'
    }
    return ''
}

const buildPayload = () => ({
    name: form.value.name?.toString().trim() || '',
    coordination: form.value.coordination?.toString().trim() || '',
})

const startEdit = () => {
    if (_props.isNew) return
    if (!isAuthenticated.value) return
    form.value = { ...member.value }
    formError.value = ''
    isEditing.value = true
}

const cancelEdit = () => {
    if (_props.isNew) {
        emit('cancel-create')
        return
    }
    form.value = { ...member.value }
    formError.value = ''
    isEditing.value = false
}

const saveEdit = async () => {
    const validationError = validateForm()
    if (validationError) {
        formError.value = validationError
        return
    }

    isSaving.value = true
    formError.value = ''

    try {
        const payload = buildPayload()
        if (_props.isNew) {
            await $fetch('/api/admin/team', { method: 'POST', body: payload })
            emit('created')
            emit('updated')
        } else {
            await $fetch(`/api/admin/team/${member.value.id}`, { method: 'PUT', body: payload })
        }
        isEditing.value = false
        emit('updated')
    } catch (error: unknown) {
        const apiError = typeof error === 'object' && error !== null && 'data' in error
            ? (error as { data?: { statusMessage?: string; message?: string } })
            : null
        formError.value = apiError?.data?.statusMessage
            || apiError?.data?.message
            || (error instanceof Error ? error.message : 'Error al guardar los cambios')
    } finally {
        isSaving.value = false
    }
}

const handleDelete = async () => {
    if (_props.isNew) return
    const confirmed = typeof window !== 'undefined'
        ? window.confirm('¿Eliminar este integrante? Esta acción no se puede deshacer.')
        : false

    if (!confirmed) return

    isDeleting.value = true
    formError.value = ''

    try {
        await $fetch(`/api/admin/team/${member.value.id}`, { method: 'DELETE' })
        isEditing.value = false
        emit('updated')
    } catch (error: unknown) {
        const apiError = typeof error === 'object' && error !== null && 'data' in error
            ? (error as { data?: { statusMessage?: string; message?: string } })
            : null
        formError.value = apiError?.data?.statusMessage
            || apiError?.data?.message
            || (error instanceof Error ? error.message : 'Error al eliminar el integrante')
    } finally {
        isDeleting.value = false
    }
}
</script>
