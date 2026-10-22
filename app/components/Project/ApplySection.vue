<template>
  <!-- id="postula": el botón de la introducción y el inicio enlazan aquí. El margen
       deja el título a la vista bajo la cabecera fija al llegar por el ancla. -->
  <UPageSection id="postula" title="Postula tu organización"
    description="Si tu organización trabaja por el bien de la sociedad y tiene un desafío en estrategia, finanzas u operaciones, un equipo de Pontem puede trabajarlo contigo."
    class="glass-band scroll-mt-(--ui-header-height)">
    <div class="grid gap-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-16">
      <!-- Cómo funciona -->
      <div>
        <h3 class="mb-6 text-heading text-highlighted">Cómo funciona</h3>
        <ol class="space-y-6">
          <li v-for="(step, index) in steps" :key="step.title" class="flex gap-4">
            <span aria-hidden="true"
              class="grid size-10 shrink-0 place-items-center rounded-full bg-primary-700 font-semibold text-white">
              {{ index + 1 }}
            </span>
            <div class="pt-1.5">
              <p class="font-semibold text-highlighted">{{ step.title }}</p>
              <p class="mt-1 text-toned">{{ step.description }}</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Quiénes y en qué, con el llamado -->
      <UCard variant="feature" :ui="{ body: 'flex flex-col gap-8' }">
        <div>
          <h3 class="mb-3 text-subheading text-highlighted">Quiénes pueden postular</h3>
          <ul class="space-y-2">
            <li v-for="item in audience" :key="item" class="flex items-start gap-2 text-default">
              <UIcon name="i-lucide-check-circle-2" class="mt-1 size-4 shrink-0 text-secondary-700" />
              {{ item }}
            </li>
          </ul>
        </div>

        <div>
          <h3 class="mb-3 text-subheading text-highlighted">En qué podemos ayudar</h3>
          <ul class="flex flex-wrap gap-2">
            <li v-for="area in areas" :key="area">
              <UBadge :label="area" size="lg" />
            </li>
          </ul>
        </div>

        <!-- El botón abre el correo con el asunto y una pauta ya escritos. La
             dirección queda a la vista para quien no tiene un programa de correo. -->
        <div class="flex flex-col gap-3">
          <UButton :to="mailtoHref" icon="i-lucide-mail" size="xl" variant="solid" block>
            Postular por correo
          </UButton>
          <p class="text-center text-sm text-toned">
            O escríbenos a
            <ULink :to="`mailto:${email}`" class="font-medium text-primary-700 underline underline-offset-4">{{ email }}</ULink>
          </p>
        </div>
      </UCard>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
const email = 'clubconsultoria.uc@gmail.com'

const steps = [
  {
    title: 'Escríbenos',
    description: 'Cuéntanos sobre tu organización y el desafío que quieren abordar.'
  },
  {
    title: 'Conversamos',
    description: 'Nos reunimos para entender la necesidad y ver cómo podemos aportar.'
  },
  {
    title: 'Formamos el equipo',
    description: 'Un equipo multidisciplinario de consultores estudiantes toma el proyecto.'
  },
  {
    title: 'Trabajamos durante el semestre',
    description: 'Avanzamos junto a tu equipo y cerramos con recomendaciones concretas para aplicar.'
  }
]

const audience = [
  'Fundaciones y ONG',
  'Cooperativas y organizaciones comunitarias',
  'Empresas con fines sociales'
]

const areas = ['Estrategia', 'Finanzas', 'Operaciones']

// Pauta del correo: lo que el club necesita saber para responder la primera vez.
const body = [
  'Hola, equipo Pontem:',
  '',
  'Organización:',
  'Sitio web o redes sociales:',
  'Persona de contacto y cargo:',
  'Teléfono:',
  '',
  '¿A qué se dedica la organización?',
  '',
  '¿En qué necesitan apoyo? (estrategia, finanzas, operaciones u otro)',
  '',
  '¿Desde cuándo podrían empezar?',
  ''
].join('\n')

const mailtoHref = `mailto:${email}?subject=${encodeURIComponent('Postulación a Consultoría Social')}&body=${encodeURIComponent(body)}`
</script>
