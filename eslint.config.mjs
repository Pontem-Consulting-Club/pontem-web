// @ts-check
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/defaults'
import { MatcherType, SelectorKind } from 'eslint-plugin-better-tailwindcss/types'
import withNuxt from './.nuxt/eslint.config.mjs'
import { restrict, themeVariables } from './eslint.estilos.mjs'

// Además de los atributos `class`, se revisan los mapas de clases en TypeScript
// (`fooClasses`, `fooColors`...) y los objetos de tema de app/theme.
const selectors = [
  ...getDefaultSelectors(),
  {
    // :ui="{ base: '...' }" en componentes de Nuxt UI. En Vue el atributo enlazado se
    // nombra completo (v-bind:ui) y los valores del objeto se piden con ObjectValue.
    kind: SelectorKind.Attribute,
    name: '^v-bind:ui$',
    match: [{ type: MatcherType.ObjectValue }]
  },
  {
    kind: SelectorKind.Variable,
    name: '^\\w*(Classes|Colors|Class)$',
    match: [{ type: MatcherType.String }, { type: MatcherType.ObjectValue }]
  },
  {
    // Objetos de tema (app/theme): sus valores son clases, salvo defaultVariants.
    kind: SelectorKind.Variable,
    name: `^(${themeVariables.join('|')})$`,
    match: [{ type: MatcherType.ObjectValue, path: '^(?!defaultVariants)' }]
  }
]

export default withNuxt(
  {
    rules: {
      'vue/first-attribute-linebreak': 'off'
    }
  },
  // Clases de Tailwind: ver docs/estilos.md.
  {
    files: ['app/**/*.vue', 'app/**/*.ts'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': { entryPoint: 'eslint.tailwind.css', selectors }
    },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-concatenated-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/no-unnecessary-whitespace': 'error',
      'better-tailwindcss/enforce-canonical-classes': 'error',
      'better-tailwindcss/no-restricted-classes': ['error', { restrict }]
      // Sin enforce-consistent-class-order ni line-wrapping: mucho ruido en el diff
      // y nada de corrección.
    }
  }
)
