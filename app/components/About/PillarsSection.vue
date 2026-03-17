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
    <SectionHeader title="Nuestros Pilares" centered class="mb-14" />

    <div class="grid md:grid-cols-2 gap-10">
      <div
        v-for="pillar in pillars"
        :key="pillar.title"
        class="group rounded-3xl p-8 border border-gray-100 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-6"
      >
        <div class="flex items-start gap-4">
          <div
            :class="[
              'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
              pillar.color === 'pontemteal'
                ? 'bg-pontemteal-100 text-pontemteal-600'
                : 'bg-pontemred-100 text-pontemred-500'
            ]"
          >
            <UIcon :name="pillar.icon" class="w-7 h-7" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">{{ pillar.title }}</h3>
            <div
              :class="[
                'h-1 w-10 rounded-full transition-all duration-300 group-hover:w-16',
                pillar.color === 'pontemteal' ? 'bg-pontemteal-400' : 'bg-pontemred-400'
              ]"
            />
          </div>
        </div>

        <p class="text-gray-600 leading-relaxed text-sm">{{ pillar.description }}</p>

        <ul class="space-y-2">
          <li
            v-for="item in pillar.items"
            :key="item"
            class="flex items-start gap-2 text-sm text-gray-700"
          >
            <UIcon
              name="i-lucide-check-circle-2"
              :class="[
                'w-4 h-4 mt-0.5 shrink-0',
                pillar.color === 'pontemteal' ? 'text-pontemteal-500' : 'text-pontemred-500'
              ]"
            />
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
