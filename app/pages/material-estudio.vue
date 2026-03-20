<template>
  <div>
    <PageHeader title="Material de Estudio" background-image="/LugarEstudio.jpg" />

    <UContainer class="py-16">
      <!-- Stages Section -->
      <section class="text-center mb-16">
        <SectionHeader class="mb-8" title="Postulación a Consultoras estratégicas" centered />

        <div class="flex flex-wrap justify-center gap-4">
          <StageCard v-for="(stage, index) in stages" :key="stage.title" :number="index + 1" :title="stage.title"
            :description="stage.description" :show-arrow="index < stages.length - 1" />
        </div>
      </section>

      <!-- Drive Link Section -->
      <section class="text-center mb-16">
        <SectionHeader title="Link a Drive de Estudio" centered />
        <p class="mb-8">
          Solicita acceso a nuestro Drive con todo el material de estudio.
        </p>
        <button class="inline-block hover:scale-105 transition-transform cursor-pointer" @click="openDrive">
          <img src="/drive-logo.png" alt="Google Drive" class="h-20 w-auto mx-auto">
        </button>
      </section>

      <!-- Case Books Section -->
      <section class="text-center">
        <SectionHeader title="Case Books Recomendados" centered />
        <p class="mb-8">
          Recursos externos para practicar casos de consultoría.
        </p>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard v-for="(book, index) in caseBooks" :key="index" icon="i-lucide-book-open" :title="book"
            description="Casos prácticos de entrevistas" />
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import studyMaterials from '~/assets/data/studyMaterials.json'

useHead({
  title: studyMaterials.title
})

const stages = studyMaterials.stages
const caseBooks = studyMaterials.caseBooks

const openDrive = () => {
  window.open(studyMaterials.driveLink, '_blank')
}
</script>