<script setup lang="ts">
import type { CaseStudyResourceRecord } from '~/types/content'
import { CASE_RESOURCE_KIND_ICONS, CASE_RESOURCE_KIND_LABELS } from '~/constants/caseStudies'

interface Props {
  resources: CaseStudyResourceRecord[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'deleted'): void }>()

const { isAuthenticated } = useAuth()
const supabase = useSupabaseClient()

const kindStyles: Record<string, { wrapper: string, text: string }> = {
  APUNTE: { wrapper: 'bg-pontemteal-50 text-pontemteal-700', text: 'text-pontemteal-700' },
  DATASET: { wrapper: 'bg-pontempurple-50 text-pontempurple-600', text: 'text-pontempurple-600' },
  MASTERCLASS: { wrapper: 'bg-pontemred-50 text-pontemred-500', text: 'text-pontemred-500' }
}

/**
 * Un recurso puede apuntar a una URL externa o a un archivo del bucket `documents`.
 */
const resolveHref = (resource: CaseStudyResourceRecord) => {
  const link = resource.link?.trim()
  if (link) return link

  const path = resource.document_url?.trim()
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('/')) return path

  return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
}

const deletingId = ref<number | null>(null)

const handleDelete = async (resource: CaseStudyResourceRecord) => {
  const confirmed = typeof window !== 'undefined'
    ? window.confirm(`¿Eliminar el recurso "${resource.title}"?`)
    : false

  if (!confirmed) return

  deletingId.value = resource.id
  try {
    await $fetch(`/api/admin/case-studies/resources/${resource.id}`, { method: 'DELETE' })
    emit('deleted')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
    <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
      <UIcon name="i-lucide-library" class="w-5 h-5 text-pontempurple-500" />
      Recursos Relacionados
    </h3>

    <p v-if="props.resources.length === 0" class="text-sm text-gray-400 italic">
      Este caso todavía no tiene recursos asociados.
    </p>

    <div v-else class="flex flex-col gap-2">
      <component :is="resolveHref(resource) ? 'a' : 'div'" v-for="resource in props.resources" :key="resource.id"
        :href="resolveHref(resource) ?? undefined" :target="resolveHref(resource) ? '_blank' : undefined"
        :rel="resolveHref(resource) ? 'noopener noreferrer' : undefined"
        class="group p-3 rounded-xl border border-transparent hover:bg-gray-50 hover:border-gray-100 transition-colors flex gap-3 items-start">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="kindStyles[resource.kind]?.wrapper">
          <UIcon :name="CASE_RESOURCE_KIND_ICONS[resource.kind]" class="w-5 h-5" />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-xs font-semibold uppercase tracking-wider mb-1" :class="kindStyles[resource.kind]?.text">
            {{ CASE_RESOURCE_KIND_LABELS[resource.kind] }}
          </span>
          <span class="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-2">
            {{ resource.title }}
          </span>
        </div>
        <UButton v-if="isAuthenticated" icon="i-lucide-trash-2" size="xs" color="error" variant="ghost"
          :loading="deletingId === resource.id" aria-label="Eliminar recurso"
          @click.prevent.stop="handleDelete(resource)" />
      </component>
    </div>
  </div>
</template>
