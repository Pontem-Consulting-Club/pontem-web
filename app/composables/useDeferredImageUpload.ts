export type DeferredImageUploadOptions = {
    bucket?: string
    folder?: string
}

export function useDeferredImageUpload(options: DeferredImageUploadOptions = {}) {
    const bucket = options.bucket ?? 'images'
    const folder = options.folder ?? ''

    const pendingFile = ref<File | null>(null)
    const previewUrl = ref<string | null>(null)
    const isUploading = ref(false)
    const error = ref('')
    const supabase = useSupabaseClient()

    const revokePreviewUrl = () => {
        if (!previewUrl.value) return
        try {
            URL.revokeObjectURL(previewUrl.value)
        } catch {
            // ignore
        }
        previewUrl.value = null
    }

    const setPendingFile = (file: File | null | undefined) => {
        pendingFile.value = file ?? null
        revokePreviewUrl()
        if (pendingFile.value) {
            previewUrl.value = URL.createObjectURL(pendingFile.value)
        }
    }

    const handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        const file = input.files?.[0] ?? null
        setPendingFile(file)
    }

    const uploadPendingFile = async () => {
        if (!pendingFile.value) return null

        isUploading.value = true
        error.value = ''

        try {
            const extension = pendingFile.value.name.split('.').pop() || 'jpg'
            const fileId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}`
            const filename = `${fileId}.${extension}`
            const path = folder ? `${folder}/${filename}` : filename

            const { error: uploadError } = await supabase
                .storage
                .from(bucket)
                .upload(path, pendingFile.value, { cacheControl: '3600', upsert: false })

            if (uploadError) {
                throw uploadError
            }

            pendingFile.value = null
            return path
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Error al subir la imagen'
            return null
        } finally {
            isUploading.value = false
        }
    }

    onBeforeUnmount(() => {
        revokePreviewUrl()
    })

    return {
        pendingFile,
        previewUrl,
        isUploading,
        error,
        handleFileChange,
        setPendingFile,
        uploadPendingFile,
        revokePreviewUrl
    }
}
