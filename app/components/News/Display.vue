<template>
    <UCard as="article" :ui="{ body: 'sm:px-12' }">
        <div class="flex items-center justify-between mb-6">
            <UButton to="/noticias" size="md" icon="i-lucide-arrow-left">
                Volver a noticias
            </UButton>
            <UButton v-if="canEdit" icon="i-lucide-pencil" size="md" color="primary"
                :to="`/noticias/${idParam}?edit=1`">
                Editar
            </UButton>
        </div>
        <NuxtImg v-if="articleImageUrl" :src="articleImageUrl" alt="Cover Image"
            class="rounded-xl h-72 w-full object-cover mb-6" sizes="800px" />

        <header class="flex flex-col mb-8">
            <div v-if="headerType" class="mb-4">
                <UBadge :color="getTypeBadgeColor(headerType)" :label="headerType" size="lg" />
            </div>
            <h1 class="mb-4 text-title text-highlighted">
                {{ newsItem.title }}
            </h1>
            <p v-if="headerSubtitle" class="font-semibold text-lg mb-6">
                {{ headerSubtitle }}
            </p>
            <div class="flex items-center gap-4">
                <span v-if="headerAuthor">Por <strong>{{ headerAuthor }}</strong></span>
                <span v-if="headerAuthor">•</span>
                <span>{{ formattedDate }}</span>
            </div>
        </header>

        <!-- eslint-disable vue/no-v-html -->
        <div v-if="rawContent" class="prose max-w-none pb-3 text-justify" v-html="rawContent" />
        <!-- eslint-enable vue/no-v-html -->
    </UCard>
</template>

<script setup lang="ts">
import type { NewsRecord } from '~/types/content'

const { getTypeBadgeColor } = useNewsTypeColor()

const props = defineProps<{
    newsItem: NewsRecord
    canEdit: boolean
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
