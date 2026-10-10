import type { MaybeRefOrGetter } from 'vue'
import { PAGE_BANNER_DEFAULTS, type BannerPage } from '~~/shared/pageBanners'

/**
 * Foto del banner de una sección: la que eligió un editor o, si no hay, la de por
 * defecto. Todas las páginas comparten una sola petición (clave `page-banners`).
 */
export function usePageBanner(page: MaybeRefOrGetter<BannerPage>) {
    const { data, refresh } = useFetch<{ page: string, image_path: string | null }[]>('/api/page-banners', {
        key: 'page-banners',
        default: () => []
    })

    const customPath = computed(() => data.value.find(row => row.page === toValue(page))?.image_path ?? null)
    const { url: customUrl } = useStorageImage(customPath)

    return {
        image: computed(() => customUrl.value ?? PAGE_BANNER_DEFAULTS[toValue(page)]),
        isCustom: computed(() => customPath.value !== null),
        refresh
    }
}
