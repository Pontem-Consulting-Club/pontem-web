/**
 * Marca como no indexable todo lo que no sea produccion.
 *
 * Aplica a canary (canary.pontemcc.cl) y a cualquier preview de rama, para que
 * no compitan en buscadores con www.pontemcc.cl ni queden cacheados con datos
 * de prueba. Vercel expone VERCEL_ENV con 'production' | 'preview' | 'development';
 * si la variable no existe (por ejemplo corriendo en local) tambien marcamos
 * noindex, que es el lado seguro.
 */
export default defineEventHandler((event) => {
  if (process.env.VERCEL_ENV !== 'production') {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
