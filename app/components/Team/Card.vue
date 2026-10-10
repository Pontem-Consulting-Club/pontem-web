<template>
    <TeamEditForm v-if="isEditing" v-model:form="form" :is-new="_props.isNew" :is-saving="isSaving"
        :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="cancelEdit"
        @delete="handleDelete" />

    <div v-else class="relative">
        <ContentEditButton v-if="isEditor" ref="editButton" label="Editar integrante" :disabled="otherEditorOpen"
            @click="startEdit" />

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
    // Abre directo en el formulario, para editar a alguien elegido desde una lista.
    startEditing?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
    isNew: false,
    coordinationImageUrl: null,
    startEditing: false,
})

const member = toRef(_props, 'member')
const emit = defineEmits<{
    (e: 'updated' | 'created' | 'cancel-create' | 'closed'): void
}>()

const { isEditor } = useProfile()

const isEditing = ref(_props.isNew || _props.startEditing)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')
const form = ref<Partial<TeamRecord>>({ ..._props.member })

const toast = useToast()
const { confirmDelete, confirmDiscard } = useConfirm()
const editButton = useTemplateRef('editButton')
const { othersOpen: otherEditorOpen } = useEditorSlot(
    () => (_props.isNew ? 'integrante:nuevo' : `integrante:${member.value.id}`),
    { isEditing, focusOnClose: () => editButton.value?.focus() }
)

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
    if (!isEditor.value) return
    form.value = { ...member.value }
    formError.value = ''
    isEditing.value = true
}

const cancelEdit = async () => {
    if (formChanged(form.value, member.value) && !(await confirmDiscard())) return
    if (_props.isNew) {
        emit('cancel-create')
        return
    }
    form.value = { ...member.value }
    formError.value = ''
    isEditing.value = false
    emit('closed')
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
        toast.add({ title: _props.isNew ? 'Integrante agregado' : 'Integrante guardado', icon: 'i-lucide-check', color: 'success' })
        isEditing.value = false
        emit('updated')
        if (!_props.isNew) emit('closed')
    } catch (error: unknown) {
        formError.value = apiErrorMessage(error, 'No pudimos guardar los cambios. Inténtalo de nuevo.')
    } finally {
        isSaving.value = false
    }
}

const handleDelete = async () => {
    if (_props.isNew) return
    if (!(await confirmDelete('este integrante'))) return

    isDeleting.value = true
    formError.value = ''

    try {
        await $fetch(`/api/admin/team/${member.value.id}`, { method: 'DELETE' })
        toast.add({ title: 'Integrante eliminado', icon: 'i-lucide-check', color: 'success' })
        isEditing.value = false
        emit('updated')
        emit('closed')
    } catch (error: unknown) {
        formError.value = apiErrorMessage(error, 'No pudimos eliminar al integrante. Inténtalo de nuevo.')
    } finally {
        isDeleting.value = false
    }
}
</script>
