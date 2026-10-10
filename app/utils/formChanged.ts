/**
 * Si un formulario de edición cambió respecto del registro original. null,
 * undefined y '' cuentan igual: un campo vacío que se tocó no es un cambio.
 */
export function formChanged(form: object, original: object) {
  const a = form as Record<string, unknown>
  const b = original as Record<string, unknown>
  const normalize = (value: unknown) => (value === undefined || value === null || value === '' ? null : value)
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].some(key => JSON.stringify(normalize(a[key])) !== JSON.stringify(normalize(b[key])))
}
