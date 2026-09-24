/**
 * Responde 404 a la carga inicial cuando la pagina termina mostrando "no encontrado".
 *
 * Las paginas de detalle pintan su propio estado vacio en vez de la pagina de
 * error de Nuxt, y sin esto respondian 200: un buscador podia indexar "Noticia
 * no encontrada" y un enlace roto no se distinguia de uno bueno. Si la carga fallo
 * en el servidor (5xx), se conserva ese codigo para no esconderlo tras un 404.
 *
 * Solo actua en el servidor, porque en la navegacion del cliente no hay respuesta
 * HTTP que marcar. Hay que llamarla despues de esperar los datos de la pagina.
 */
export const useNotFoundStatus = (options: {
    found: MaybeRefOrGetter<boolean>
    error?: MaybeRefOrGetter<{ statusCode?: number } | null | undefined>
}) => {
    if (!import.meta.server || toValue(options.found)) return

    const event = useRequestEvent()
    if (!event) return

    const statusCode = toValue(options.error)?.statusCode
    setResponseStatus(event, statusCode && statusCode >= 500 ? statusCode : 404)
}
