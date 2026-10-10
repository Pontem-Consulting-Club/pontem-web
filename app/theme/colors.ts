/**
 * Colores del tema. Las paletas viven en app/assets/css/main.css; aquí se les da
 * su papel. `tertiary` está registrado en nuxt.config.ts (ui.theme.colors).
 */
export const colors = {
  primary: 'pontemred',
  secondary: 'pontemteal',
  tertiary: 'pontempurple',
  neutral: 'gray'
}

/**
 * Nuxt UI combina clases con tailwind-merge (createTV(appConfig.ui.tv)). Sin este
 * registro, `text-title` parece un color y se descarta al combinarlo con
 * `text-highlighted`. Cada tamaño nuevo de main.css va aquí también.
 */
export const tv = {
  twMergeConfig: {
    extend: {
      classGroups: {
        'font-size': [{ text: ['display', 'title', 'heading', 'subheading'] }]
      }
    }
  }
}
