import { unref } from 'vue'
import type { MaybeRef } from 'vue'

/**
 * URL publica de una imagen guardada en Supabase Storage.
 *
 * El bucket `images` es publico, asi que basta con construir la URL y dejar que
 * la sirva el CDN de Supabase. Antes esto descargaba el archivo con
 * `storage.download()` y lo envolvia en un `URL.createObjectURL`, lo que
 * significaba: una peticion autenticada por imagen, nada de cache de navegador
 * ni de CDN, y la imagen sin aparecer hasta que terminaba la descarga. Para
 * fotos de perfil y de eventos eso es todo coste y ningun beneficio.
 *
 * Sigue siendo un composable (y no una funcion suelta) para no tener que tocar
 * los componentes que ya lo usan.
 */
export function useStorageImage(path: MaybeRef<string | null | undefined>, bucket = 'images') {
    const supabase = useSupabaseClient()

    const url = computed(() => {
        const currentPath = unref(path)?.toString().trim()
        if (!currentPath) return null

        // Rutas absolutas o de /public se usan tal cual: el seed apunta ahi.
        if (currentPath.startsWith('http') || currentPath.startsWith('/')) {
            return currentPath
        }

        return supabase.storage.from(bucket).getPublicUrl(currentPath).data.publicUrl
    })

    return {
        url,
        // Se mantienen por compatibilidad con quien ya los desestructuraba.
        loading: computed(() => false),
        error: computed(() => null),
        reload: () => { /* ya no hay nada que recargar: la URL es derivada */ }
    }
}
