<script setup lang="ts">
import { TEAM_COORDINATION_LABELS } from '~/constants/teamRoles'

interface Props {
  name: string
  coordination: keyof typeof TEAM_COORDINATION_LABELS
  imageUrl?: string | null
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
  icon: 'i-lucide-user'
})

const placeholderLogo = '/LogoColorSolo.png'
const { url: storageUrl } = useStorageImage(computed(() => props.imageUrl ?? null))
const imageSrc = ref<string>(placeholderLogo)

watchEffect(() => {
  imageSrc.value = storageUrl.value ?? placeholderLogo
})

const handleImageError = () => {
  imageSrc.value = placeholderLogo
}

const coordinationLabel = computed(() => TEAM_COORDINATION_LABELS[props.coordination] ?? props.coordination)
</script>

<template>
  <UCard variant="soft" class="text-center hover:shadow-lg transition-shadow bg-white">
    <div class="flex justify-center mb-4">
      <img :src="imageSrc" :alt="name" class="h-20 w-20 rounded-full object-cover border border-gray-200"
        @error="handleImageError">
    </div>
    <h3 class="text-lg font-semibold text-primary mb-1">
      {{ name }}
    </h3>
    <p class="">
      {{ coordinationLabel }}
    </p>
  </UCard>
</template>
