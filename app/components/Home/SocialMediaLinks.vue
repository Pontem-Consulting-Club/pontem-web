<script setup lang="ts">
const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/pontemconsultingclub/',
    logo: '/instagram-logo.png'
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/pontemcc/mycompany/',
    logo: '/linkedin-logo.png'
  }
]
</script>

<template>
  <section class="py-16 md:py-24">
    <UContainer>
      <div class="text-center mb-4">
        <h5 class="text-xl md:text-2xl font-bold mt-20 mb-4">
          Conéctate con nosotros y no te pierdas nuestros eventos
        </h5>
      </div>

      <div class="flex justify-center gap-10 mb-10">
        <a v-for="link in socialLinks" :key="link.href" :href="link.href" target="_blank" rel="noopener noreferrer"
          class="social-logo-link">
          <img :src="link.logo" :alt="link.label + ' Logo'" class="social-logo">
        </a>
      </div>
    </UContainer>
  </section>
</template>

<style scoped>
.social-logo {
  cursor: pointer;
  width: 70px;
  height: auto;
  transition: transform 0.2s ease;
  filter: grayscale(100%);
}

.social-logo:hover {
  transform: scale(1.1);
  filter: grayscale(0%);
}
</style>
