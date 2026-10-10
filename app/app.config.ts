import { badge, button } from './theme/actions'
import { colors, tv } from './theme/colors'
import { empty } from './theme/feedback'
import { input, select, selectMenu, textarea } from './theme/forms'
import { footer, footerColumns, header, marquee, pageHeader, pageHero, pageSection } from './theme/page'
import { card, pageCard } from './theme/surfaces'

/**
 * Tema de Nuxt UI. Cada parte vive en app/theme; aquí solo se reúnen.
 * Ver docs/estilos.md.
 */
export default defineAppConfig({
  ui: {
    colors,
    tv,
    card,
    pageCard,
    button,
    badge,
    empty,
    input,
    textarea,
    select,
    selectMenu,
    pageHero,
    pageHeader,
    pageSection,
    header,
    footer,
    footerColumns,
    marquee
  }
})
