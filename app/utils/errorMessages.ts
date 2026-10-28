/**
 * Mensajes de error para mostrar en pantalla, siempre en español y diciendo qué
 * hacer. Antes se mostraba `error.message` tal cual: textos en inglés de Supabase
 * ("Invalid login credentials") o técnicos de $fetch ("[PUT] /api/...: 500").
 */

// Textos genéricos de HTTP que no le dicen nada a quien usa el sitio.
const GENERIC = new Set(['Unauthorized', 'Forbidden', 'Bad Request', 'Not Found', 'Internal Server Error'])

interface ApiError {
    statusCode?: number
    status?: number
    data?: { statusMessage?: string, message?: string }
}

/** Error de una llamada a la API del sitio ($fetch). `fallback` describe qué falló. */
export function apiErrorMessage(error: unknown, fallback: string): string {
    const e = (error ?? {}) as ApiError
    const status = e.statusCode ?? e.status
    const fromServer = [e.data?.statusMessage, e.data?.message].find(text => text && !GENERIC.has(text))

    if (!status) return 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.'
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (status === 413) return 'El archivo es demasiado grande.'
    // Los 4xx de la API vienen en español y dicen qué corregir. Los 5xx no sirven
    // a quien edita: se queda el mensaje de quien llama.
    if (status < 500) return fromServer || (status === 403 ? 'No tienes permiso para hacer esto.' : fallback)
    return fallback
}

interface AuthError {
    code?: string
    status?: number
    name?: string
}

/** Error de Supabase Auth (iniciar sesión, recuperar y cambiar la contraseña). */
export function authErrorMessage(error: unknown, fallback: string): string {
    const e = (error ?? {}) as AuthError
    switch (e.code) {
        case 'invalid_credentials':
            return 'El correo o la contraseña no coinciden.'
        case 'email_not_confirmed':
            return 'Todavía no confirmas tu correo. Abre el enlace que te enviamos.'
        case 'user_banned':
            return 'Esta cuenta está desactivada. Escríbele a quien administra el sitio.'
        case 'over_request_rate_limit':
        case 'over_email_send_rate_limit':
            return 'Hiciste demasiados intentos. Espera unos minutos y vuelve a probar.'
        case 'signup_disabled':
            return 'El registro de cuentas nuevas no está disponible por ahora.'
        case 'user_already_exists':
        case 'email_exists':
            return 'Ya hay una cuenta con ese correo. Inicia sesión o recupera tu contraseña.'
        case 'email_address_invalid':
            return 'Escribe un correo válido.'
        case 'weak_password':
            return 'Esa contraseña es muy fácil de adivinar. Prueba con una más larga.'
        case 'same_password':
            return 'La contraseña nueva tiene que ser distinta de la anterior.'
        case 'session_not_found':
        case 'session_expired':
        case 'reauthentication_needed':
            return 'El enlace ya no sirve. Pide uno nuevo.'
    }
    if (e.name === 'AuthRetryableFetchError' || e.status === 0) {
        return 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.'
    }
    return fallback
}
