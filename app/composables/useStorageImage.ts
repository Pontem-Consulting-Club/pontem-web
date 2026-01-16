export function useStorageImage(path: string | null | undefined, bucket = 'images') {
    const url = ref<string | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const supabase = useSupabaseClient()
    let objectUrl: string | null = null

    const revoke = () => {
        if (objectUrl) {
            try {
                URL.revokeObjectURL(objectUrl)
            } catch {
                // ignore
            }
            objectUrl = null
        }
    }

    const load = async () => {
        if (!path) {
            url.value = null
            return
        }

        // if it's already an absolute or root-relative URL, use it as-is
        if (path.startsWith('http') || path.startsWith('/')) {
            url.value = path
            return
        }

        loading.value = true
        error.value = null
        try {
            const { data, error: err } = await supabase.storage.from(bucket).download(path)
            if (err) throw err
            revoke()
            objectUrl = URL.createObjectURL(data)
            url.value = objectUrl
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e)
            error.value = message
            url.value = null
        } finally {
            loading.value = false
        }
    }

    onMounted(load)
    onBeforeUnmount(revoke)
    watch(() => path, (newPath, oldPath) => {
        if (newPath !== oldPath) {
            revoke()
            load()
        }
    })

    return { url, loading, error, reload: load }
}
