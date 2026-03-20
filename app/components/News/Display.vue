<template>
    <article class="bg-white rounded-lg px-12 py-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
            <UButton to="/noticias" variant="soft" size="md" icon="i-lucide-arrow-left">
                Volver a noticias
            </UButton>
            <UButton v-if="isAuthenticated" icon="i-lucide-pencil" size="md" color="primary" variant="soft"
                :to="`/noticias/${idParam}?edit=1`">
                Editar
            </UButton>
        </div>
        <NuxtImg v-if="articleImageUrl" :src="articleImageUrl" alt="Cover Image"
            class="rounded-xl h-72 w-full object-cover mb-6" sizes="800px" />

        <header class=" flex flex-col mb-8">
            <div v-if="headerType" class="mb-4">
                <TypeBadge :type="headerType" size="base" />
            </div>
            <h1 class="text-3xl md:text-3xl font-bold mb-4 text-primary">
                {{ newsItem.title }}
            </h1>
            <p v-if="headerSubtitle" class=" font-semibold text-lg mb-6">
                {{ headerSubtitle }}
            </p>
            <div class="flex items-center gap-4">
                <span v-if="headerAuthor">Por <strong>{{ headerAuthor }}</strong></span>
                <span v-if="headerAuthor">•</span>
                <span>{{ formattedDate }}</span>
            </div>
        </header>

        <!-- eslint-disable vue/no-v-html -->
        <div v-if="rawContent" class="prose prose-md max-w-none text-justify pb-3" v-html="rawContent" />
        <!-- eslint-enable vue/no-v-html -->
    </article>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const props = defineProps<{
    newsItem: NewsRecord
    isAuthenticated: boolean
    idParam: string
}>()

const { formatDate } = useDateFormatting()

const formattedDate = computed(() => props.newsItem.published_date ? formatDate(props.newsItem.published_date) : '')

// Normalize nullable API fields to `undefined` to satisfy child component prop types
const headerType = computed(() => props.newsItem.type ?? undefined)
const headerSubtitle = computed(() => props.newsItem.subtitle ?? undefined)
const headerAuthor = computed(() => props.newsItem.author ?? undefined)

const rawContent = computed(() => props.newsItem.content ?? '')

const { url: articleImageUrl } = useStorageImage(computed(() => props.newsItem.image_url ?? null))
</script>
