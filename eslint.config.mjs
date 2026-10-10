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
    // :ui="{ base: '...' }" en componentes de Nuxt UI
    kind: SelectorKind.Attribute,
    name: '^:?ui$',
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
      'better-tailwindcss/no-unknown-classes': 'warn',
      'better-tailwindcss/no-conflicting-classes': 'warn',
      'better-tailwindcss/no-concatenated-classes': 'warn',
      'better-tailwindcss/no-duplicate-classes': 'warn',
      'better-tailwindcss/no-deprecated-classes': 'warn',
      'better-tailwindcss/no-unnecessary-whitespace': 'warn',
      'better-tailwindcss/enforce-canonical-classes': 'warn',
      'better-tailwindcss/no-restricted-classes': ['warn', { restrict }]
      // Sin enforce-consistent-class-order ni line-wrapping: mucho ruido en el diff
      // y nada de corrección.
    }
  }
)
