<template>
  <!-- Una sección como las demás: título a la izquierda y dos botones con nombre, en
       vez de íconos sueltos bajo un título centrado. -->
  <UPageSection title="Síguenos" description="Publicamos las actividades, convocatorias y novedades del club en Instagram y LinkedIn.">
    <div class="flex flex-wrap gap-3">
      <UButton v-for="link in socialLinks" :key="link.href" :to="link.href" target="_blank" :icon="link.icon"
        color="neutral" variant="outline" size="lg"
        :aria-label="`${link.label} de Pontem (se abre en otra pestaña)`">
        {{ link.label }}
      </UButton>
    </div>
  </UPageSection>
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
