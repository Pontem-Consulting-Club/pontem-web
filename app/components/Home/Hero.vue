<template>
  <section class="relative h-[80vh] w-full overflow-hidden">
    <!-- Slides -->
    <HomeHeroSlide v-for="(slide, index) in slides" :key="slide.id" :slide="slide"
      :is-active="currentSlide === index" />

    <div v-if="slides.length === 0" class="absolute inset-0 bg-gray-800" />

    <!-- Edit / create form -->
    <HomeHeroEditForm v-if="isEditing" v-model:form="form" :is-new="isCreating" :is-saving="isSaving"
      :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="cancelEdit"
      @delete="handleDelete" />

    <!-- Admin controls -->
    <div v-if="isAuthenticated && !isEditing" class="absolute top-4 right-4 z-30 flex gap-1">
      <UButton v-if="currentSlideRecord" icon="i-lucide-arrow-up" size="xs" color="neutral" variant="solid"
        aria-label="Mover slide antes" :disabled="currentSlide === 0" @click="moveSlide(-1)" />
      <UButton v-if="currentSlideRecord" icon="i-lucide-arrow-down" size="xs" color="neutral" variant="solid"
        aria-label="Mover slide después" :disabled="currentSlide === slides.length - 1" @click="moveSlide(1)" />
      <UButton v-if="currentSlideRecord" icon="i-lucide-pencil" size="xs" color="primary" variant="solid"
        aria-label="Editar slide" @click="startEdit" />
      <UButton icon="i-lucide-plus" size="xs" color="primary" variant="solid" aria-label="Agregar slide"
        @click="startCreate" />
    </div>

    <!-- Slide Indicators -->
    <div v-if="!isEditing" class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
      <button v-for="(slide, index) in slides" :key="slide.id" class="w-4 h-2 rounded-lg transition-all duration-300"
        :class="currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'"
        :aria-label="`Go to slide ${index + 1}`" @click="goToSlide(index)" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HeroSlideRecord } from '~/types/content'

interface Props {
  autoplayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoplayInterval: 6000
})

const { data: slides, refresh } = await useFetch<HeroSlideRecord[]>('/api/hero-slides', {
  default: () => []
})

const { isAuthenticated } = useAuth()

const currentSlide = ref(0)
const isCreating = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const formError = ref('')
const form = ref<Partial<HeroSlideRecord>>({})

const currentSlideRecord = computed(() => slides.value[currentSlide.value] ?? null)

let intervalId: ReturnType<typeof setInterval> | null = null

const nextSlide = () => {
  if (slides.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const stopAutoplay = () => {
  if (!intervalId) return
  clearInterval(intervalId)
  intervalId = null
}

const startAutoplay = () => {
  stopAutoplay()
  intervalId = setInterval(nextSlide, props.autoplayInterval)
}

// keep the visible slide in range after a deletion
watch(slides, (value) => {
  if (currentSlide.value > value.length - 1) {
    currentSlide.value = Math.max(value.length - 1, 0)
  }
})

// pause the carousel while a slide is being edited or created
watch(isEditing, (editing) => {
  if (editing) {
    stopAutoplay()
  } else {
    startAutoplay()
  }
})

const normalizeValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return null
  const trimmed = value.toString().trim()
  return trimmed === '' ? null : trimmed
}

const validateForm = () => {
  if (!form.value.title || !form.value.title.toString().trim()) {
    return 'El título es obligatorio.'
  }

  return ''
}

const buildPayload = () => ({
  title: form.value.title?.toString().trim() || '',
  subtitle: normalizeValue(form.value.subtitle as string | null),
  button_text: normalizeValue(form.value.button_text as string | null),
  image_url: normalizeValue(form.value.image_url as string | null),
  link: normalizeValue(form.value.link as string | null)
})

const buildFormData = (payload: ReturnType<typeof buildPayload>, file?: File | null) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value ?? '')
  })

  if (file) {
    formData.append('image', file)
  }

  return formData
}

const resolveApiError = (error: unknown, fallback: string) => {
  const apiError = typeof error === 'object' && error !== null && 'data' in error
    ? (error as { data?: { statusMessage?: string, message?: string } })
    : null
  return apiError?.data?.statusMessage
    || apiError?.data?.message
    || (error instanceof Error ? error.message : fallback)
}

const startEdit = () => {
  if (!isAuthenticated.value || !currentSlideRecord.value) return
  form.value = { ...currentSlideRecord.value }
  formError.value = ''
  isCreating.value = false
  isEditing.value = true
}

const startCreate = () => {
  if (!isAuthenticated.value) return
  form.value = {
    title: '',
    subtitle: null,
    button_text: null,
    image_url: null,
    link: null
  }
  formError.value = ''
  isCreating.value = true
  isEditing.value = true
}

const cancelEdit = () => {
  formError.value = ''
  isEditing.value = false
  isCreating.value = false
}

const saveEdit = async (file?: File | null) => {
  const validationError = validateForm()
  if (validationError) {
    formError.value = validationError
    return
  }

  isSaving.value = true
  formError.value = ''

  try {
    const formData = buildFormData(buildPayload(), file)
    if (isCreating.value) {
      await $fetch('/api/admin/hero-slides', { method: 'POST', body: formData })
    } else {
      await $fetch(`/api/admin/hero-slides/${form.value.id}`, { method: 'PUT', body: formData })
    }
    isEditing.value = false
    isCreating.value = false
    await refresh()
  } catch (error: unknown) {
    formError.value = resolveApiError(error, 'Error al guardar los cambios')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async () => {
  if (isCreating.value || !form.value.id) return
  const confirmed = typeof window !== 'undefined'
    ? window.confirm('¿Eliminar esta slide? Esta acción no se puede deshacer.')
    : false

  if (!confirmed) return

  isDeleting.value = true
  formError.value = ''

  try {
    await $fetch(`/api/admin/hero-slides/${form.value.id}`, { method: 'DELETE' })
    isEditing.value = false
    await refresh()
  } catch (error: unknown) {
    formError.value = resolveApiError(error, 'Error al eliminar la slide')
  } finally {
    isDeleting.value = false
  }
}

const moveSlide = async (direction: -1 | 1) => {
  const targetIndex = currentSlide.value + direction
  if (targetIndex < 0 || targetIndex > slides.value.length - 1) return

  const ids = slides.value.map(slide => slide.id)
  const [moved] = ids.splice(currentSlide.value, 1)
  if (moved === undefined) return
  ids.splice(targetIndex, 0, moved)

  formError.value = ''

  try {
    await $fetch('/api/admin/hero-slides/reorder', { method: 'POST', body: { ids } })
    await refresh()
    currentSlide.value = targetIndex
  } catch (error: unknown) {
    formError.value = resolveApiError(error, 'Error al reordenar las slides')
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>
