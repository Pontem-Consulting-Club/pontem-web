<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

interface Props {
  project: ProjectRecord
  onDelete: (id: number) => void
  onEdit: (project: ProjectRecord) => void
}

defineProps<Props>()
</script>

<template>
  <AdminListItem :id="project.id" :on-delete="onDelete" :on-edit="() => onEdit(project)">
    <h3 class="text-lg font-semibold">
      {{ project.title }}
    </h3>
    <p v-if="project.subtitle" class="text-primary-600 text-sm">
      {{ project.subtitle }}
    </p>
    <p v-if="project.description" class="text-sm mt-1">
      {{ project.description }}
    </p>
  </AdminListItem>
</template>
