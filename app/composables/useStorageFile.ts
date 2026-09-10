import { unref } from 'vue'
import type { MaybeRef } from 'vue'

/**
 * Resuelve la URL publica de un archivo guardado en un bucket publico de Supabase Storage.
 *
 * A diferencia de `useStorageImage`, que descarga el blob y crea un object URL, aca se devuelve
 * la URL publica directa: sirve para embeber PDFs o enlazarlos a una descarga sin traerse el
 * archivo completo al cliente.
 */
export function useStorageFile(path: MaybeRef<string | null | undefined>, bucket = 'documents') {
    const supabase = useSupabaseClient()

    return computed(() => {
        const currentPath = unref(path)?.toString().trim()
        if (!currentPath) return null

        // Igual que useStorageImage: un path absoluto o de /public se usa tal cual.
        if (currentPath.startsWith('http') || currentPath.startsWith('/')) {
            return currentPath
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(currentPath)
        return data.publicUrl
    })
}
