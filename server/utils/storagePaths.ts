/**
 * Storage keys are relative paths inside the `images` bucket (e.g. `hero/uuid.jpg`).
 * Values pointing at a static asset in `public/` or at an external URL are not stored
 * in the bucket and must never be removed from it.
 */
export const isStorageKey = (path: string) => {
    const trimmed = path.trim()
    return trimmed.length > 0 && !trimmed.startsWith('/') && !trimmed.startsWith('http')
}
