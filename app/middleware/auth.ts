/**
 * Exige sesion. Guarda a donde iba la persona para devolverla ahi despues de
 * entrar, en vez de dejarla en la portada (VIS-2).
 */
export default defineNuxtRouteMiddleware((to) => {
    const userId = useCurrentUserId()

    if (!userId.value) {
        return navigateTo({
            path: '/login',
            query: to.fullPath === '/' ? undefined : { redirect: to.fullPath }
        })
    }
})
