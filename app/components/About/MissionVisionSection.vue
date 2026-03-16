<template>
  <section>
    <SectionHeader title="Misión & Visión" centered class="mb-14" />

    <div class="grid md:grid-cols-2 gap-8">
      <div class="relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-linear-to-r from-pontemred-500 to-pontemred-300" />
        <div class="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-pontemred-50 pointer-events-none" />

        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-pontemred-100 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-target" class="w-6 h-6 text-pontemred-500" />
            </div>
            <div>
              <h3 class="text-2xl font-bold tracking-tight text-gray-900">Misión</h3>
              <div class="h-0.5 w-8 rounded-full bg-pontemred-400 mt-1" />
            </div>
          </div>
          <p class="text-gray-600 leading-relaxed text-base">
            Formar líderes con mentalidad estratégica y vocación de impacto, conectando a estudiantes universitarios
            con el mundo de la consultoría a través de experiencias prácticas y proyectos con propósito social.
          </p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-linear-to-r from-pontemteal-500 to-pontemteal-300" />
        <div class="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-pontemteal-50 pointer-events-none" />

        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-pontemteal-100 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-eye" class="w-6 h-6 text-pontemteal-600" />
            </div>
            <div>
              <h3 class="text-2xl font-bold tracking-tight text-gray-900">Visión</h3>
              <div class="h-0.5 w-8 rounded-full bg-pontemteal-400 mt-1" />
            </div>
          </div>
          <p class="text-gray-600 leading-relaxed text-base">
            Ser el club de consultoría estudiantil de referencia en Chile, reconocido por la excelencia de sus
            miembros, la profundidad de su impacto social y su capacidad de transformar ideas en soluciones reales.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
