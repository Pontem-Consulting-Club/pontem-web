<template>
    <UContainer class="py-10 max-w-4xl">
        <div class="flex items-center justify-between mb-6">
            <div>
                <p class="text-sm text-gray-500">Edición</p>
                <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
            </div>
            <div class="flex gap-2">
                <UButton color="error" variant="ghost" icon="i-lucide-arrow-left" @click="goBack">
                    Volver
                </UButton>
            </div>
        </div>

        <UCard variant="soft" class="bg-white text-gray-900 border border-gray-200 shadow-sm">
            <template #header>
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold">{{ headerTitle }}</h2>
                    <span class="text-sm text-gray-500">ID: {{ id }}</span>
                </div>
            </template>

            <div v-if="isLoading" class="flex justify-center py-12">
                <LoadingSpinner />
            </div>

            <div v-else class="space-y-6 text-gray-800">
                <UAlert v-if="formError" color="error" icon="i-lucide-alert-circle" :description="formError" />

                <form class="space-y-4" autocomplete="on" @submit.prevent="saveEdit">
                    <div class="grid gap-4 md:grid-cols-2">
                        <template v-for="field in fields" :key="field.key">
                            <div :class="field.type === 'textarea' ? 'md:col-span-2' : ''">
                                <UFormField :label="field.label" :required="field.required"
                                    :ui="{ label: 'text-gray-800 font-medium' }">
                                    <component :is="field.type === 'textarea' ? 'UTextarea' : 'UInput'"
                                        v-model="form[field.key]" :type="field.inputType || 'text'"
                                        :placeholder="field.placeholder" color="neutral" variant="outline" :ui="{
                                            base: 'text-gray-900 placeholder:text-gray-500 bg-white',
                                            input: 'bg-white text-gray-900 placeholder:text-gray-500',
                                            ring: 'ring-gray-300 focus:ring-primary-500'
                                        }" />
                                </UFormField>
                            </div>
                        </template>
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <UButton type="button" variant="ghost" color="neutral" :disabled="isSaving" @click="goBack">
                            Cancelar
                        </UButton>
                        <UButton type="submit" color="primary" :loading="isSaving">
                            Guardar cambios
                        </UButton>
                    </div>
                </form>
            </div>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import type { EventRecord, ProjectRecord, NewsRecord } from '~/types/content'

useHead({ title: 'Editar - Admin' })

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()

const typeParam = route.params.type as 'events' | 'projects' | 'news'
const id = Number(route.params.id)

const validType = ['events', 'projects', 'news'].includes(typeParam)

if (!validType || Number.isNaN(id)) {
    router.replace('/admin')
}

const form = reactive<Partial<EventRecord & ProjectRecord & NewsRecord>>({})
const isLoading = ref(true)
const isSaving = ref(false)
const formError = ref('')

type FieldConfig = {
    key: 'title' | 'subtitle' | 'description' | 'date' | 'image_url' | 'location' | 'link' | 'link_text' | 'type' | 'author' | 'published_date' | 'content'
    label: string
    type?: 'textarea'
    inputType?: 'text' | 'url'
    required?: boolean
    placeholder?: string
}

const fieldsByType: Record<'events' | 'projects' | 'news', FieldConfig[]> = {
    events: [
        { key: 'title', label: 'Título', required: true },
        { key: 'subtitle', label: 'Subtítulo' },
        { key: 'date', label: 'Fecha', required: true, placeholder: 'YYYY-MM-DD' },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'location', label: 'Ubicación' },
        { key: 'link', label: 'Enlace', inputType: 'url' },
        { key: 'image_url', label: 'Imagen (URL)', inputType: 'url' }
    ],
    projects: [
        { key: 'title', label: 'Título', required: true },
        { key: 'subtitle', label: 'Subtítulo' },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'link_text', label: 'Texto del enlace' },
        { key: 'link', label: 'Enlace', inputType: 'url' },
        { key: 'image_url', label: 'Imagen (URL)', inputType: 'url' }
    ],
    news: [
        { key: 'title', label: 'Título', required: true },
        { key: 'subtitle', label: 'Subtítulo' },
        { key: 'type', label: 'Tipo' },
        { key: 'author', label: 'Autor' },
        { key: 'published_date', label: 'Fecha de publicación', required: true, placeholder: 'YYYY-MM-DD' },
        { key: 'content', label: 'Contenido', type: 'textarea' },
        { key: 'link', label: 'Enlace', inputType: 'url' },
        { key: 'image_url', label: 'Imagen (URL)', inputType: 'url' }
    ]
}

type EditType = keyof typeof fieldsByType

const fields = computed<FieldConfig[]>(() => fieldsByType[typeParam as EditType] ?? [])

const pageTitle = computed(() => {
    if (typeParam === 'events') return 'Editar evento'
    if (typeParam === 'projects') return 'Editar proyecto'
    return 'Editar noticia'
})

const headerTitle = computed(() => `${pageTitle.value} #${id}`)

const normalizeValue = (value?: string | null) => {
    if (value === undefined || value === null) return null
    const trimmed = value.toString().trim()
    return trimmed === '' ? null : trimmed
}

const buildPayload = (type: EditType) => {
    if (type === 'events') {
        return {
            title: form.title?.toString().trim() || '',
            date: form.date?.toString().trim() || '',
            subtitle: normalizeValue(form.subtitle as string | null),
            description: normalizeValue(form.description as string | null),
            image_url: normalizeValue(form.image_url as string | null),
            location: normalizeValue(form.location as string | null),
            link: normalizeValue(form.link as string | null)
        }
    }

    if (type === 'projects') {
        return {
            title: form.title?.toString().trim() || '',
            subtitle: normalizeValue(form.subtitle as string | null),
            description: normalizeValue(form.description as string | null),
            image_url: normalizeValue(form.image_url as string | null),
            link: normalizeValue(form.link as string | null),
            link_text: normalizeValue(form.link_text as string | null)
        }
    }

    return {
        title: form.title?.toString().trim() || '',
        subtitle: normalizeValue(form.subtitle as string | null),
        type: normalizeValue(form.type as string | null),
        image_url: normalizeValue(form.image_url as string | null),
        author: normalizeValue(form.author as string | null),
        published_date: form.published_date?.toString().trim() || '',
        content: normalizeValue(form.content as string | null),
        link: normalizeValue(form.link as string | null)
    }
}

const validateForm = (type: EditType) => {
    if (!form.title || !form.title.toString().trim()) {
        return 'El título es obligatorio.'
    }

    if (type === 'events' && (!form.date || !form.date.toString().trim())) {
        return 'La fecha es obligatoria.'
    }

    if (type === 'news' && (!form.published_date || !form.published_date.toString().trim())) {
        return 'La fecha de publicación es obligatoria.'
    }

    return ''
}

const fetchItem = async () => {
    isLoading.value = true
    formError.value = ''

    try {
        if (!validType || Number.isNaN(id)) {
            throw new Error('Ruta inválida')
        }

        const list = await $fetch<(EventRecord | ProjectRecord | NewsRecord)[]>(`/api/admin/${typeParam}`)
        const found = list.find((item) => item.id === id)

        if (!found) {
            throw new Error('Elemento no encontrado')
        }

        Object.assign(form, found)
    } catch (error: unknown) {
        formError.value = error instanceof Error ? error.message : 'Error cargando el elemento'
    } finally {
        isLoading.value = false
    }
}

const saveEdit = async () => {
    if (!validType || Number.isNaN(id)) {
        router.replace('/admin')
        return
    }

    const validationError = validateForm(typeParam as EditType)
    if (validationError) {
        formError.value = validationError
        return
    }

    isSaving.value = true
    formError.value = ''

    try {
        const payload = buildPayload(typeParam as EditType)
        await $fetch(`/api/admin/${typeParam}/${id}`, { method: 'PUT', body: payload })
        router.push('/admin')
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

const goBack = () => {
    router.push('/admin')
}

onMounted(() => {
    fetchItem()
})
</script>
