<template>
  <UCard variant="soft" class="rounded-xl bg-white/75">
    <div class="flex flex-col md:flex-row p-6 gap-4">
      <div class="flex flex-col justify-between flex-1">
        <h3 class="text-xl text-primary font-semibold mb-2">
          {{ project.title }}
        </h3>
        <p v-if="project.subtitle" class="text-gray font-semibold mb-3">
          {{ project.subtitle }}
        </p>
        <p v-if="project.description" class="mr-4 text-justify">
          {{ project.description }}
        </p>
        <UButton v-if="project.link" :href="project.link" target="_blank" variant="link" block class="p-4">
          {{ project.link_text || 'Ver más' }}
        </UButton>
      </div>
      <NuxtImg :src="imageUrl ?? '/LogoColorSolo.png'" alt="Imagen del proyecto" class="object-cover rounded-xl"
        width="500" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '~/types/content'

interface Props {
  project: ProjectRecord
}

const { project } = defineProps<Props>()
const { url: imageUrl } = useStorageImage(project.image_url)
</script>

