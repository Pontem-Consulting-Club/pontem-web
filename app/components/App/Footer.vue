<template>
  <UFooter>
    <template #top>
      <UContainer>
        <!-- Las columnas usan h3: este h2 evita el salto desde el h1 en páginas cortas. -->
        <h2 class="sr-only">Pie de página</h2>
        <UFooterColumns :columns="columns" aria-label="Pie de página">
          <template #left>
            <img src="/LogoBlanco.png" alt="Pontem Consulting Club" class="mx-auto h-24 w-auto lg:mx-0">
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <div class="flex flex-col gap-2 text-center lg:text-left">
        <p>&copy; {{ new Date().getFullYear() }} Pontem Consulting Club. Todos los derechos reservados.</p>
        <p>
          Desarrollado por
          <ULink to="https://www.linkedin.com/in/santiago-ernst/" target="_blank"
            class="text-secondary-300 hover:text-white">
            Santiago Ernst y Carlos Cruz
          </ULink>
        </p>
      </div>
    </template>
  </UFooter>
</template>

<script setup lang="ts">
import type { FooterColumn } from '@nuxt/ui'

const { navigation } = useNavigation()

const columns: FooterColumn[] = [
  {
    label: 'Pontem',
    children: [...navigation, { label: 'Admin', to: '/login' }]
  },
  {
    label: 'Contacto',
    children: [
      { label: 'Email', to: 'mailto:clubconsultoria.uc@gmail.com', icon: 'i-lucide-mail' },
      { label: 'LinkedIn', to: 'https://www.linkedin.com/company/pontemcc/mycompany/', target: '_blank', icon: 'i-simple-icons-linkedin' },
      { label: 'Instagram', to: 'https://www.instagram.com/pontemconsultingclub/', target: '_blank', icon: 'i-simple-icons-instagram' }
    ]
  }
]
</script>
