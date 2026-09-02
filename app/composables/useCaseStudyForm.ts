import type { CaseStudyRecord } from '~/types/content'

export interface CaseStudyFiles {
  logo: File | null
  document: File | null
}

/**
 * Estado y operaciones del formulario de casos de estudio, compartidos por la pagina de alta
 * (`/material-estudio/casos/nuevo`) y la de edicion (`/material-estudio/casos/[id]?edit=1`).
 *
 * Sigue el mismo criterio que el resto de los formularios del sitio: string vacio -> null,
 * envio como FormData cuando hay archivos, y errores de la API resueltos a un texto plano.
 */
export const useCaseStudyForm = () => {
  const form = ref<Partial<CaseStudyRecord>>({})
  const formError = ref('')
  const isSaving = ref(false)
  const isDeleting = ref(false)

  const emptyCaseStudy = (): Partial<CaseStudyRecord> => ({
    title: '',
    company: null,
    company_logo_url: null,
    category: 'ESTRATEGIA',
    difficulty: null,
    duration_minutes: null,
    case_type: null,
    summary: null,
    problem_statement: null,
    document_url: null,
    document_name: null,
    document_size_bytes: null,
    published_date: new Date().toISOString().slice(0, 10)
  })

  const normalizeValue = (value?: string | number | null) => {
    if (value === undefined || value === null) return ''
    const trimmed = value.toString().trim()
    return trimmed
  }

  const validateForm = () => {
    if (!normalizeValue(form.value.title)) {
      return 'El título es obligatorio.'
    }

    if (!normalizeValue(form.value.category)) {
      return 'La categoría es obligatoria.'
    }

    const duration = normalizeValue(form.value.duration_minutes)
    if (duration && Number.isNaN(Number(duration))) {
      return 'El tiempo estimado debe ser un número de minutos.'
    }

    return ''
  }

  const buildFormData = (files: CaseStudyFiles) => {
    const formData = new FormData()

    const fields: Array<keyof CaseStudyRecord> = [
      'title',
      'company',
      'company_logo_url',
      'category',
      'difficulty',
      'duration_minutes',
      'case_type',
      'summary',
      'problem_statement',
      'document_url',
      'document_name',
      'document_size_bytes',
      'published_date'
    ]

    for (const field of fields) {
      formData.append(field, normalizeValue(form.value[field] as string | number | null))
    }

    if (files.logo) {
      formData.append('logo', files.logo)
    }

    if (files.document) {
      formData.append('document', files.document)
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

  /** Crea el caso y devuelve su id, o `null` si la validacion o la API fallaron. */
  const create = async (files: CaseStudyFiles): Promise<number | null> => {
    const validationError = validateForm()
    if (validationError) {
      formError.value = validationError
      return null
    }

    isSaving.value = true
    formError.value = ''

    try {
      const response = await $fetch<{ id: number }>('/api/admin/case-studies', {
        method: 'POST',
        body: buildFormData(files)
      })
      return response.id
    } catch (error: unknown) {
      formError.value = resolveApiError(error, 'Error al crear el caso de estudio')
      return null
    } finally {
      isSaving.value = false
    }
  }

  const update = async (id: number, files: CaseStudyFiles): Promise<boolean> => {
    const validationError = validateForm()
    if (validationError) {
      formError.value = validationError
      return false
    }

    isSaving.value = true
    formError.value = ''

    try {
      await $fetch(`/api/admin/case-studies/${id}`, {
        method: 'PUT',
        body: buildFormData(files)
      })
      return true
    } catch (error: unknown) {
      formError.value = resolveApiError(error, 'Error al guardar los cambios')
      return false
    } finally {
      isSaving.value = false
    }
  }

  const remove = async (id: number): Promise<boolean> => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('¿Eliminar este caso de estudio? Esta acción no se puede deshacer.')
      : false

    if (!confirmed) return false

    isDeleting.value = true
    formError.value = ''

    try {
      await $fetch(`/api/admin/case-studies/${id}`, { method: 'DELETE' })
      return true
    } catch (error: unknown) {
      formError.value = resolveApiError(error, 'Error al eliminar el caso de estudio')
      return false
    } finally {
      isDeleting.value = false
    }
  }

  return {
    form,
    formError,
    isSaving,
    isDeleting,
    emptyCaseStudy,
    create,
    update,
    remove
  }
}
