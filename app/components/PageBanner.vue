<script setup lang="ts">
/**
 * Portada de una sección pública: foto oscurecida con el título encima, nada más.
 * La introducción y los llamados a la acción van debajo, en la página. Es una
 * UPageHero dentro del preset onImage (app/theme/presets.ts).
 *
 * Quien edita puede cambiar la foto desde aquí (tabla page_banners); sin foto propia
 * se usa la de por defecto de shared/pageBanners.ts.
 */
import { onImage } from '~/theme/presets'
import type { BannerPage } from '~~/shared/pageBanners'

const props = defineProps<{
  title: string
  page: BannerPage
}>()

const { image, isCustom, refresh } = usePageBanner(() => props.page)
const { isEditor } = useProfile()
const toast = useToast()
const { confirm } = useConfirm()

const file = ref<File | null>(null)
const saving = ref(false)

const save = async (body: FormData | { reset: true }, done: string) => {
  saving.value = true
  try {
    await $fetch(`/api/admin/page-banners/${props.page}`, { method: 'PUT', body })
    await refresh()
    toast.add({ title: done, icon: 'i-lucide-check', color: 'success' })
  } catch (error) {
    toast.add({ title: apiErrorMessage(error, 'No pudimos cambiar la foto. Inténtalo de nuevo.'), icon: 'i-lucide-circle-alert', color: 'error' })
  } finally {
    saving.value = false
  }
}

// La foto se guarda apenas se elige: el banner ya la muestra, no hay nada más que llenar.
watch(file, async (chosen) => {
  if (!chosen) return
  const body = new FormData()
  body.append('image', chosen)
  await save(body, 'Foto del banner actualizada')
  file.value = null
})

const resetImage = async () => {
  const confirmed = await confirm({
    title: '¿Volver a la foto original?',
    description: 'La foto que subiste se borra.',
    confirmLabel: 'Volver a la original',
    destructive: true
  })
  if (confirmed) await save({ reset: true }, 'El banner volvió a su foto original')
}
</script>

<template>
  <UTheme :ui="onImage">
    <!-- La foto termina en una ola suave, como las bandas y el pie. -->
    <UPageHero :title="title" class="clip-wave-hero" :ui="{ container: 'pt-20 pb-24 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32' }">
      <template #top>
        <!-- Es lo primero que se ve: va con prioridad. Sin `preload`: NuxtImg precarga
             la variante más grande (3072 px) aunque la pantalla pida otra. -->
        <NuxtImg :src="image" preset="banner" fetchpriority="high"
          alt="" class="absolute inset-0 -z-10 size-full object-cover" />
        <div aria-hidden="true" class="absolute inset-0 -z-10 bg-black/50" />

        <!-- Arriba a la derecha: abajo los recortaría la ola. -->
        <div v-if="isEditor" class="absolute top-4 right-4 z-10 flex flex-wrap justify-end gap-2">
          <ImagePicker v-model="file" mode="button" icon="i-lucide-image" :loading="saving"
            :labels="['Cambiar foto', 'Cambiar foto']" />
          <UButton v-if="isCustom" icon="i-lucide-rotate-ccw" :disabled="saving" @click="resetImage">
            Usar la foto original
          </UButton>
        </div>
      </template>
    </UPageHero>
  </UTheme>
</template>
