<script setup lang="ts">
interface Pillar {
  icon: string
  title: string
  color: 'pontemteal' | 'pontemred'
  description: string
  items: string[]
}

const pillars: Pillar[] = [
  {
    icon: 'i-lucide-heart-handshake',
    title: 'Consultoría Social',
    color: 'pontemteal',
    description:
      'Llevamos la consultoría más allá del beneficio comercial. Trabajamos con organizaciones sociales y ONGs para resolver sus desafíos estratégicos, aplicando metodologías de primera línea para generar impacto real en la comunidad.',
    items: [
      'Diagnóstico estratégico para organizaciones sociales',
      'Proyectos con impacto medible en la comunidad',
      'Equipos multidisciplinarios liderados por estudiantes',
    ],
  },
  {
    icon: 'i-lucide-presentation',
    title: 'Formación en Consultoría',
    color: 'pontemred',
    description:
      'Acercamos a los estudiantes al mundo de la consultoría a través de talleres, charlas con profesionales e industria, y eventos de práctica de casos que simulan el ambiente real de entrevistas y proyectos.',
    items: [
      'Workshops y práctica intensiva de casos',
      'Charlas con consultores y líderes de la industria',
      'Simulacros de entrevistas y feedback personalizado',
    ],
  },
]
</script>

<template>
  <section>
    <SectionTitle title="Nuestros Pilares" class="mb-14" />

    <div class="grid md:grid-cols-2 gap-10">
      <UCard v-for="pillar in pillars" :key="pillar.title" :ui="{ body: 'flex flex-col gap-6' }">
        <h3 class="flex items-center gap-3 text-heading text-highlighted">
          <UIcon :name="pillar.icon" class="size-6 shrink-0"
            :class="pillar.color === 'pontemteal' ? 'text-secondary-700' : 'text-primary-500'" />
          {{ pillar.title }}
        </h3>

        <p class="text-toned text-sm/relaxed">{{ pillar.description }}</p>

        <ul class="space-y-2">
          <li
            v-for="item in pillar.items"
            :key="item"
            class="flex items-start gap-2 text-sm text-default"
          >
            <UIcon
              name="i-lucide-check-circle-2"
              :class="[
                'size-4 mt-0.5 shrink-0',
                pillar.color === 'pontemteal' ? 'text-secondary-700' : 'text-primary-500'
              ]"
            />
            {{ item }}
          </li>
        </ul>
      </UCard>
    </div>
  </section>
</template>
