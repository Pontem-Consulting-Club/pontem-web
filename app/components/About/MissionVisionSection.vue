<template>
  <section>
    <SectionHeader title="Misión & Visión" centered class="mb-14" />

    <div class="grid md:grid-cols-2 gap-8">
      <div class="relative overflow-hidden rounded-3xl bg-default border border-muted p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="absolute top-0 inset-x-0 h-1 rounded-t-3xl bg-linear-to-r from-primary-500 to-primary-400" />
        <div class="absolute -bottom-12 -right-12 size-48 rounded-full bg-primary-50 pointer-events-none" />

        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-target" class="size-6 text-primary-500" />
            </div>
            <div>
              <h3 class="text-2xl font-bold tracking-tight text-highlighted">Misión</h3>
              <div class="h-0.5 w-8 rounded-full bg-primary-500 mt-1" />
            </div>
          </div>
          <p class="text-toned text-base/relaxed">
            Ofrecer a los estudiantes la oportunidad de aplicar sus conocimientos en proyectos reales de consultoría, colaborando con empresas y organizaciones sociales para generar un impacto positivo.
          </p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-3xl bg-default border border-muted p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="absolute top-0 inset-x-0 h-1 rounded-t-3xl bg-linear-to-r from-secondary-300 to-secondary-200" />
        <div class="absolute -bottom-12 -right-12 size-48 rounded-full bg-secondary-50 pointer-events-none" />

        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-6">
            <div class="size-12 rounded-2xl bg-secondary-50 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-eye" class="size-6 text-secondary-300" />
            </div>
            <div>
              <h3 class="text-2xl font-bold tracking-tight text-highlighted">Visión</h3>
              <div class="h-0.5 w-8 rounded-full bg-secondary-200 mt-1" />
            </div>
          </div>
          <p class="text-toned text-base/relaxed">
            Ser el club de consultoría líder en la formación de futuros consultores, ofreciendo oportunidades de aprendizaje y desarrollo en la resolución de problemas estratégicos para empresas y organizaciones.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
