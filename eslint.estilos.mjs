// @ts-check
/**
 * Clases que no se escriben a mano en app/: los colores salen del tema de Nuxt UI
 * (ver docs/estilos.md). Cada entrada alimenta la regla
 * `better-tailwindcss/no-restricted-classes`; las que traen `fix` se corrigen
 * solas con `eslint --fix`.
 */

// Prefijos de utilidades de color a los que aplica el mapeo.
const PROPS = '(text|bg|border|ring|outline|divide|from|via|to|fill|stroke|decoration|placeholder|caret|accent|shadow)'
// Variantes delante (hover:, md:, group-hover:...) y modificador de opacidad detrás.
const VARIANTS = '([a-zA-Z0-9_:\\[\\]&@*-]*:)?'
const OPACITY = '(\\/[0-9]{1,3})?'

/**
 * Las escalas de marca se regeneraron con pasos de luminosidad parejos y el color
 * de marca en su tono natural. Cada tono viejo apunta al tono nuevo de luminosidad
 * más parecida, así cada uso conserva su intención.
 */
const BRAND = {
  pontemred: { alias: 'primary', shades: { 50: 50, 100: 100, 200: 200, 300: 400, 400: 500, 500: 500, 600: 600, 700: 800, 800: 900, 900: 950, 950: 950 } },
  pontemteal: { alias: 'secondary', shades: { 50: 50, 100: 50, 200: 100, 300: 200, 400: 200, 500: 300, 600: 300, 700: 600, 800: 700, 900: 900, 950: 950 } },
  pontempurple: { alias: 'tertiary', shades: { 50: 50, 100: 100, 200: 200, 300: 300, 400: 500, 500: 900, 600: 600, 700: 800, 800: 950, 900: 950, 950: 950 } }
}

/** Grises de Tailwind -> utilidades semánticas de Nuxt UI (neutral = gray, mismo color). */
const NEUTRAL = [
  ['text-gray-950', 'text-highlighted'],
  ['text-gray-900', 'text-highlighted'],
  ['text-gray-800', 'text-highlighted'],
  ['text-gray-700', 'text-default'],
  ['text-gray-600', 'text-toned'],
  ['text-gray-500', 'text-muted'],
  ['text-gray-400', 'text-dimmed'],
  ['text-gray-300', 'text-dimmed'],
  ['placeholder-gray-400', 'placeholder:text-dimmed'],
  ['bg-gray-50', 'bg-muted'],
  ['bg-gray-100', 'bg-elevated'],
  ['bg-gray-200', 'bg-accented'],
  ['bg-gray-300', 'bg-accented'],
  ['bg-gray-800', 'bg-inverted'],
  ['bg-gray-900', 'bg-inverted'],
  ['border-gray-100', 'border-muted'],
  ['border-gray-200', 'border-default'],
  ['border-gray-300', 'border-accented'],
  ['border-gray-400', 'border-accented'],
  ['divide-gray-100', 'divide-muted'],
  ['divide-gray-200', 'divide-default'],
  ['ring-gray-200', 'ring-default'],
  // Superficies siempre opacas; los blancos translúcidos sobre fotos (/10–/30) se quedan.
  ['bg-white', 'bg-default'],
  ['bg-white/90', 'bg-default'],
  ['bg-white/75', 'bg-default'],
  // --ui-primary ya apunta al 600.
  ['text-primary-600', 'text-primary']
]

/** Objetos exportados por app/theme/*.ts cuyos valores son clases. */
export const themeVariables = [
  'card', 'pageCard', 'button', 'badge', 'input', 'textarea', 'select', 'selectMenu',
  'formField', 'fileUpload', 'pageHero', 'pageHeader', 'pageSection', 'pageGrid',
  'pageFeature', 'header', 'footer', 'footerColumns', 'marquee', 'empty', 'onImage', 'inlineEdit'
]

const escape = (/** @type {string} */ s) => s.replace(/[/\\^$.*+?()[\]{}|]/g, '\\$&')

/** @type {{ pattern: string, message: string, fix?: string }[]} */
export const restrict = [
  ...Object.entries(BRAND).flatMap(([palette, { alias, shades }]) =>
    Object.entries(shades).map(([from, to]) => ({
      pattern: `^${VARIANTS}${PROPS}-${palette}-${from}${OPACITY}$`,
      fix: `$1$2-${alias}-${to}$3`,
      message: `Usa '${alias}-${to}' (tema) en vez de '${palette}-${from}'.`
    }))
  ),
  ...NEUTRAL.map(([from, to]) => ({
    pattern: `^${VARIANTS}${escape(from)}$`,
    fix: `$1${to}`,
    message: `Usa '${to}' en vez de '${from}'.`
  })),
  // Lo que quede sin regla propia se revisa a mano.
  {
    pattern: `^${VARIANTS}${PROPS}-gray-[0-9]+${OPACITY}$`,
    message: 'Usa una utilidad semántica (text-muted, bg-elevated, border-default...) en vez de un gris de Tailwind.'
  },
  {
    pattern: `^${VARIANTS}${PROPS}-pontem(red|teal|purple)-[a-z0-9]+${OPACITY}$`,
    message: 'Usa primary, secondary o tertiary en vez de la paleta de marca directa.'
  }
]
