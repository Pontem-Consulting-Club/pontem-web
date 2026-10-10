<template>
  <section class="py-16 md:py-24">
    <UContainer>
      <h2 class="mt-20 mb-8 text-center text-heading">
        Conéctate con nosotros y no te pierdas nuestros eventos
      </h2>

      <div class="mb-10 flex justify-center gap-10">
        <ULink v-for="link in socialLinks" :key="link.href" :to="link.href" target="_blank"
          :aria-label="`${link.label} de Pontem (se abre en otra pestaña)`"
          class="rounded-lg text-highlighted transition-colors hover:text-primary">
          <UIcon :name="link.icon" class="size-14" />
        </ULink>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/pontemconsultingclub/',
    icon: 'i-simple-icons-instagram'
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/pontemcc/mycompany/',
    icon: 'i-simple-icons-linkedin'
  }
]
</script>
