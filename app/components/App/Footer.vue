<template>
  <footer class="bg-gray-600/75 mt-24 pt-24 pb-12 text-white" style="clip-path: ellipse(150% 60% at 30% 61%);">
    <UContainer>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Logo Column -->
        <div class="flex justify-center md:justify-start">
          <img src="/LogoBlanco.png" alt="Pontem Consulting Club" class="h-24 w-auto object-contain">
        </div>

        <!-- Navigation Column -->
        <div class="text-center md:text-left">
          <h5 class="font-semibold mb-4 text-lg">Pontem</h5>
          <nav class="flex flex-col gap-2">
            <NuxtLink v-for="item in navigationWithAdmin" :key="item.to" :to="item.to"
              class="text-white/80 hover:text-white hover:font-bold transition-all text-sm">
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Contact Column -->
        <div class="text-center md:text-left">
          <h5 class="font-semibold mb-4 text-lg">Contacto</h5>
          <nav class="flex flex-col gap-2">
            <a v-for="link in socialLinks" :key="link.href" :href="link.href" target="_blank" rel="noopener noreferrer"
              :class="[
                'text-white/80 hover:text-white transition-all text-sm flex items-center gap-2 justify-center md:justify-start rounded px-2 py-1',
                link.hoverClass
              ]">
              <UIcon :name="link.icon" class="w-4 h-4" />
              {{ link.label }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-white/20 pt-8 text-center text-white/80 text-sm">
        <p class="mb-2">&copy; {{ new Date().getFullYear() }} Pontem Consulting Club. Todos los derechos reservados.</p>
        <p>
          Desarrollado por
          <a href="https://www.linkedin.com/in/santiago-ernst/" target="_blank" rel="noopener noreferrer"
            class="text-secondary hover:text-white transition-colors">
            Santiago Ernst y Carlos Cruz
          </a>
        </p>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
const { navigation } = useNavigation()

const navigationWithAdmin = [...navigation, { label: 'Admin', to: '/login' }]

const socialLinks = [
  {
    label: 'Email',
    href: 'mailto:clubconsultoria.uc@gmail.com',
    icon: 'i-lucide-mail',
    hoverClass: 'hover:text-white'
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/pontemcc/mycompany/',
    icon: 'i-simple-icons-linkedin',
    hoverClass: 'hover:text-white'
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/pontemconsultingclub/',
    icon: 'i-simple-icons-instagram',
    hoverClass: 'hover:text-white'
  }
]
</script>
