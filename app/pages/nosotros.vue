<script setup lang="ts">
import about from '~/assets/data/about.json'

useHead({
  title: about.title
})

const history = about.history
const team = about.team
</script>

<template>
  <div>
    <PageHeader title="Nosotros" background-image="/Equipo2024.jpeg" />

    <UContainer class="py-16">
      <!-- History Section -->
      <section class="mb-20">
        <SectionHeader title="Nuestra Historia" centered class="mb-12" />

        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-pontemred-400" />
          <div class="space-y-12">
            <TimelineItem v-for="(item, index) in history" :key="item.year" :year="item.year" :title="item.title"
              :description="item.description" :index="index" />
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section>
        <SectionHeader title="Nuestro Equipo" centered class="mb-12" />

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TeamMemberCard v-for="member in team" :key="member.name" :name="member.name" :role="member.role" />
        </div>
      </section>
    </UContainer>
  </div>
</template>
