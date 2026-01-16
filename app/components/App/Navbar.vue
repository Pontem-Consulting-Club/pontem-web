<template>
  <header class="fixed h-20 w-full z-50 bg-white/75 drop-shadow-md backdrop-blur-xs">
    <nav class="flex h-full items-center justify-around px-8 md:px-16 py-4 relative">
      <!-- Logo -->
      <NuxtLink to="/">
        <img src="/pontemog_optimized_.png" alt="Pontem" class="object-contain h-12">
      </NuxtLink>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8 pl-8">
        <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to"
          class="hover:text-pontemred-500 transition-colors text-sm text-center font-medium"
          active-class="text-pontemred-500">
          {{ item.label }}
        </NuxtLink>
      </div>

      <!-- Mobile Menu Toggle -->
      <button ref="menuButtonRef"
        class="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pontemred-500"
        aria-label="Toggle mobile menu" :aria-expanded="isMobileMenuOpen" @click="toggleMobileMenu">
        <svg :class="['w-6 h-6 transform transition-transform duration-300', isMobileMenuOpen ? 'rotate-90' : '']"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>

    <!-- Mobile Navigation Sidebar -->
    <Transition enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95">

      <div v-if="isMobileMenuOpen" ref="menuRef"
        class="md:hidden absolute right-0 top-full w-fit bg-white/90 backdrop-blur-md shadow-lg z-60 rounded-bl-lg overflow-hidden">
        <nav class="py-2 flex flex-col">
          <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to"
            class="px-5 py-2 gap-5 transition-colors text-left font-medium" active-class="text-pontemred-500">
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

    </Transition>

    <!-- Mobile Menu Overlay -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isMobileMenuOpen" class="fixed left-0 right-0 bottom-0 top-24 bg-black/30 lg:hidden z-30"
        @click="closeMobileMenu" />
    </Transition>
  </header>
</template>

<script setup lang="ts">
const isMobileMenuOpen = ref(false)
const { navigation } = useNavigation()

const menuRef = ref<HTMLElement | null>(null)
const menuButtonRef = ref<HTMLElement | null>(null)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const onDocumentClick = (e: MouseEvent) => {
  if (!isMobileMenuOpen.value) return
  const target = e.target as Node | null
  if (!target) return
  if (menuRef.value && menuRef.value.contains(target)) return
  if (menuButtonRef.value && menuButtonRef.value.contains(target)) return
  closeMobileMenu()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) closeMobileMenu()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>