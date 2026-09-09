/**
 * El identificador de la persona con la sesion abierta.
 *
 * `useSupabaseUser()` no devuelve un objeto User sino los claims del JWT, tanto
 * en servidor como en cliente, asi que el id viene en `sub` y leer `.id` da
 * undefined sin avisar. Se deja el `?? id` por si una version futura del modulo
 * vuelve a entregar el User completo.
 */
export const useCurrentUserId = () => {
    const user = useSupabaseUser()

    return computed(() => {
        const claims = user.value as { id?: string; sub?: string } | null
        return claims?.sub ?? claims?.id ?? null
    })
}
