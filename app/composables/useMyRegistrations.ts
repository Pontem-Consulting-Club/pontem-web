/**
 * Las inscripciones propias, compartidas por todas las tarjetas de evento.
 *
 * `useAsyncData` con una clave fija hace que las N tarjetas de /eventos usen una
 * sola peticion en vez de una por tarjeta.
 */
export interface MyRegistration {
    id: number
    status: 'registered' | 'cancelled' | 'waitlisted'
    attended: boolean
    event: { id: number; title: string; date: string | null; location: string | null } | null
}

export interface MyRegistrationStats {
    registered: number
    attended: number
    cancelled: number
    upcoming: number
}

export const useMyRegistrations = () => {
    const userId = useCurrentUserId()
    // En el servidor, `$fetch` a una ruta propia no lleva las cookies de la
    // peticion original: la API no veia sesion y /perfil y /eventos se
    // renderizaban como si la persona no tuviera inscripciones. `useRequestFetch`
    // las reenvia; en el cliente se comporta igual que `$fetch`.
    const requestFetch = useRequestFetch()

    const { data, refresh, status } = useAsyncData(
        'my-registrations',
        async () => {
            if (!userId.value) return null
            return await requestFetch<{ registrations: MyRegistration[]; stats: MyRegistrationStats }>(
                '/api/profile/registrations'
            )
        },
        { watch: [userId], default: () => null }
    )

    const registrations = computed(() => data.value?.registrations ?? [])
    const stats = computed(() => data.value?.stats ?? null)

    const activeEventIds = computed(() => new Set(
        registrations.value
            .filter(row => row.status === 'registered' && row.event)
            .map(row => row.event!.id)
    ))

    const isRegisteredFor = (eventId: number) => activeEventIds.value.has(eventId)

    return { registrations, stats, isRegisteredFor, refresh, status }
}
