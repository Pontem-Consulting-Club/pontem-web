<script setup lang="ts">
interface Props {
  id: number
  onDelete: (id: number) => void
  onEdit: () => void
}

defineProps<Props>()
</script>

<template>
  <UCard variant="soft" class="hover:shadow-md transition-shadow bg-white text-gray-800 border border-gray-200">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 text-gray-800">
        <slot />
      </div>
      <div class="flex flex-col gap-2">
        <UButton color="secondary" variant="ghost" icon="i-lucide-pencil" aria-label="Editar" @click="onEdit()" />
        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" aria-label="Eliminar" @click="onDelete(id)" />
      </div>
    </div>
  </UCard>
</template>
