<script setup lang="ts">
import type { CaseStudyResourceRecord } from '~/types/content'
import { CASE_RESOURCE_KIND_ICONS, CASE_RESOURCE_KIND_LABELS } from '~/constants/caseStudies'

interface Props {
  resources: CaseStudyResourceRecord[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'deleted'): void }>()

const { isEditor } = useProfile()
const supabase = useSupabaseClient()

const kindStyles: Record<string, { wrapper: string, text: string }> = {
  APUNTE: { wrapper: 'bg-secondary-50 text-secondary-800', text: 'text-secondary-700' },
  DATASET: { wrapper: 'bg-tertiary-50 text-tertiary-800', text: 'text-tertiary-700' },
  MASTERCLASS: { wrapper: 'bg-primary-50 text-primary-800', text: 'text-primary-700' }
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

const toast = useToast()
const { confirmDelete } = useConfirm()

const handleDelete = async (resource: CaseStudyResourceRecord) => {
  if (!(await confirmDelete(`el recurso «${resource.title}»`))) return

  deletingId.value = resource.id
  try {
    await $fetch(`/api/admin/case-studies/resources/${resource.id}`, { method: 'DELETE' })
    toast.add({ title: 'Recurso eliminado', icon: 'i-lucide-check', color: 'success' })
    emit('deleted')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-4' }">
    <h3 class="flex items-center gap-2 border-b border-muted pb-3 text-subheading text-highlighted">
      <UIcon name="i-lucide-library" class="size-5 text-tertiary-900" />
      Recursos Relacionados
    </h3>

    <p v-if="props.resources.length === 0" class="text-sm text-muted italic">
      Este caso todavía no tiene recursos asociados.
    </p>

    <div v-else class="flex flex-col gap-2">
      <component :is="resolveHref(resource) ? 'a' : 'div'" v-for="resource in props.resources" :key="resource.id"
        :href="resolveHref(resource) ?? undefined" :target="resolveHref(resource) ? '_blank' : undefined"
        :rel="resolveHref(resource) ? 'noopener noreferrer' : undefined"
        class="group p-3 rounded-xl border border-transparent hover:bg-muted hover:border-muted transition-colors flex gap-3 items-start">
        <div class="size-10 rounded-lg flex items-center justify-center shrink-0"
          :class="kindStyles[resource.kind]?.wrapper">
          <UIcon :name="CASE_RESOURCE_KIND_ICONS[resource.kind]" class="size-5" />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-xs font-semibold uppercase tracking-wider mb-1" :class="kindStyles[resource.kind]?.text">
            {{ CASE_RESOURCE_KIND_LABELS[resource.kind] }}
          </span>
          <span class="text-sm font-medium text-default group-hover:text-primary transition-colors line-clamp-2">
            {{ resource.title }}
          </span>
        </div>
        <UButton v-if="isEditor" icon="i-lucide-trash-2" size="xs" color="error" variant="ghost"
          :loading="deletingId === resource.id" aria-label="Eliminar recurso"
          @click.prevent.stop="handleDelete(resource)" />
      </component>
    </div>
  </UCard>
</template>
