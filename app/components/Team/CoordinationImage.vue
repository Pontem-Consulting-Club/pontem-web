<template>
  <div class="relative h-full bg-elevated">
    <!-- Imagen o placeholder -->
    <img v-if="imageUrl" :src="imageUrl" class="size-full object-cover" >
    <div v-else class="size-full bg-linear-to-r from-primary-100 to-secondary-50 flex items-center justify-center">
      <UIcon :name="icon" class="size-12 text-primary-400" />
    </div>

    <!-- Overlay gradiente siempre visible -->
    <div class="absolute inset-0 bg-linear-to-r from-primary-500/40 to-secondary-300/40" />

    <!-- Admin: sin imagen → botón "Agregar foto" centrado -->
    <div v-if="isEditor && !imagePath"
      class="absolute inset-0 flex items-center justify-center">
      <UButton icon="i-lucide-image" size="sm" color="neutral" @click="fileInput?.click()">
        Agregar foto
      </UButton>
    </div>

    <!-- Admin: con imagen → overlay en hover con Cambiar y Eliminar -->
    <div v-if="isEditor && imagePath"
      class="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
      <UButton icon="i-lucide-image" size="sm" color="neutral" @click="fileInput?.click()">
        Cambiar
      </UButton>
      <UButton icon="i-lucide-trash-2" size="sm" color="error" :loading="isDeleting" @click="handleDelete">
        Eliminar
      </UButton>
    </div>

    <!-- Input file oculto -->
    <input v-if="isEditor" ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" >
  </div>
</template>

<script setup lang="ts">
interface Props {
  imagePath: string | null
  icon: string
  coordination: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'updated'): void }>()

const { isEditor } = useProfile()
const fileInput = ref<HTMLInputElement | null>(null)
const isDeleting = ref(false)

const { url: imageUrl, reload } = useStorageImage(computed(() => props.imagePath))

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('image', file)
  await $fetch(`/api/admin/team/coordinations/${props.coordination}`, { method: 'PUT', body: formData })
  input.value = ''
  await reload()
  emit('updated')
}

const handleDelete = async () => {
  isDeleting.value = true
  try {
    await $fetch(`/api/admin/team/coordinations/${props.coordination}`, { method: 'PUT', body: { image_url: null } })
    emit('updated')
  } finally {
    isDeleting.value = false
  }
}
</script>
