<template>
  <!-- La rotación se detiene mientras el puntero o el foco están dentro (WCAG 2.2.2). -->
  <section class="relative h-[80vh] w-full overflow-hidden clip-wave-hero" aria-roledescription="carrusel" aria-label="Destacados"
    @mouseenter="isHovering = true" @mouseleave="isHovering = false"
    @focusin="hasFocusInside = true" @focusout="hasFocusInside = false">
    <!-- Slides -->
    <HomeHeroSlide v-for="(slide, index) in slides" :key="slide.id" :slide="slide"
      :is-active="currentSlide === index" :load="loadedSlides.has(index)" :priority="index === 0" />

    <div v-if="slides.length === 0" class="absolute inset-0 bg-inverted" />

    <!-- Edit / create form -->
    <HomeHeroEditForm v-if="isEditing" v-model:form="form" :is-new="isCreating" :is-saving="isSaving"
      :is-deleting="isDeleting" :form-error="formError" @submit="saveEdit" @cancel="cancelEdit"
      @delete="handleDelete" />

    <!-- Admin controls -->
    <div v-if="isEditor && !isEditing" class="absolute top-4 right-4 z-30 flex gap-1">
      <UButton v-if="currentSlideRecord" icon="i-lucide-arrow-up" size="xs" color="neutral" variant="solid"
        aria-label="Mover slide antes" :disabled="currentSlide === 0" @click="moveSlide(-1)" />
      <UButton v-if="currentSlideRecord" icon="i-lucide-arrow-down" size="xs" color="neutral" variant="solid"
        aria-label="Mover slide después" :disabled="currentSlide === slides.length - 1" @click="moveSlide(1)" />
      <UButton v-if="currentSlideRecord" ref="editSlideButton" icon="i-lucide-pencil" size="xs" color="primary"
        variant="solid" aria-label="Editar slide" :disabled="otherEditorOpen" @click="startEdit" />
      <UButton ref="addSlideButton" icon="i-lucide-plus" size="xs" color="primary" variant="solid"
        aria-label="Agregar slide" :disabled="otherEditorOpen" @click="startCreate" />
    </div>

    <!-- Slide Indicators -->
    <!-- El punto es chico; el botón alrededor mide 24 px para poder tocarlo. -->
    <div v-if="!isEditing" class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-1">
      <button v-if="slides.length > 1" type="button"
        class="mr-2 grid size-8 place-items-center rounded-full bg-black/30 text-white hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-white"
        :aria-label="isPaused ? 'Reanudar el carrusel' : 'Pausar el carrusel'" @click="isPaused = !isPaused">
        <UIcon :name="isPaused ? 'i-lucide-play' : 'i-lucide-pause'" class="size-4" />
      </button>
      <button v-for="(slide, index) in slides" :key="slide.id" type="button"
        class="group grid size-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
        :aria-label="`Ir a la diapositiva ${index + 1}`" :aria-current="currentSlide === index ? 'true' : undefined"
        @click="goToSlide(index)">
        <span class="h-2 w-4 rounded-lg transition-all duration-300"
          :class="currentSlide === index ? 'bg-default scale-125' : 'bg-white/50 group-hover:bg-default'" />
      </button>
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

const { isEditor } = useProfile()

const currentSlide = ref(0)

// Solo se piden las fotos de la slide actual y la siguiente; las demás, cuando
// les toca. Antes llegaban las cuatro al entrar.
const loadedSlides = ref(new Set<number>())
watch([currentSlide, () => slides.value.length], ([current, total]) => {
  loadedSlides.value.add(current)
  if (total > 1) loadedSlides.value.add((current + 1) % total)
}, { immediate: true })
const isCreating = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

const toast = useToast()
const { confirmDelete, confirmDiscard } = useConfirm()
// Lo que había al abrir el formulario, para saber si hay cambios sin guardar.
const formOriginal = ref<Partial<HeroSlideRecord>>({})
const editSlideButton = useTemplateRef('editSlideButton')
const addSlideButton = useTemplateRef('addSlideButton')
// Al cerrar, el foco vuelve al botón que abrió el formulario (o al de agregar, si
// la slide se borró).
let reopenedFromCreate = false
const { othersOpen: otherEditorOpen } = useEditorSlot('portada', {
  isEditing,
  focusOnClose: () => {
    const button = reopenedFromCreate ? addSlideButton.value : (editSlideButton.value ?? addSlideButton.value)
    elementOf(button)?.focus()
  }
})
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

// La rotación corre solo si nadie la está usando: se detiene al editar, con el
// puntero o el foco dentro, con el botón de pausa y, desde el inicio, si el
// visitante pidió menos movimiento.
const isPaused = ref(false)
const isHovering = ref(false)
const hasFocusInside = ref(false)
const shouldPlay = computed(() => slides.value.length > 1 && !isEditing.value && !isPaused.value
  && !isHovering.value && !hasFocusInside.value)

watch(shouldPlay, play => (play ? startAutoplay() : stopAutoplay()))

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

const resolveApiError = apiErrorMessage

const startEdit = () => {
  if (!isEditor.value || !currentSlideRecord.value) return
  form.value = { ...currentSlideRecord.value }
  formOriginal.value = { ...form.value }
  formError.value = ''
  reopenedFromCreate = false
  isCreating.value = false
  isEditing.value = true
}

const startCreate = () => {
  if (!isEditor.value) return
  form.value = {
    title: '',
    subtitle: null,
    button_text: null,
    image_url: null,
    link: null
  }
  formOriginal.value = { ...form.value }
  formError.value = ''
  reopenedFromCreate = true
  isCreating.value = true
  isEditing.value = true
}

const cancelEdit = async (hasPendingFile = false) => {
  if ((hasPendingFile || formChanged(form.value, formOriginal.value)) && !(await confirmDiscard())) return
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
    toast.add({ title: isCreating.value ? 'Slide agregada' : 'Slide guardada', icon: 'i-lucide-check', color: 'success' })
    isEditing.value = false
    isCreating.value = false
    await refresh()
  } catch (error: unknown) {
    formError.value = resolveApiError(error, 'No pudimos guardar los cambios. Inténtalo de nuevo.')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async () => {
  if (isCreating.value || !form.value.id) return
  if (!(await confirmDelete('esta slide'))) return

  isDeleting.value = true
  formError.value = ''

  try {
    await $fetch(`/api/admin/hero-slides/${form.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Slide eliminada', icon: 'i-lucide-check', color: 'success' })
    reopenedFromCreate = true
    isEditing.value = false
    await refresh()
  } catch (error: unknown) {
    formError.value = resolveApiError(error, 'No pudimos eliminar la slide. Inténtalo de nuevo.')
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
    formError.value = resolveApiError(error, 'No pudimos cambiar el orden de las slides. Inténtalo de nuevo.')
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) isPaused.value = true
  if (shouldPlay.value) startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>
