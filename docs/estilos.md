# Estilos

Todo lo visual sale del tema de Nuxt UI y de los tokens de `app/assets/css/main.css`.
Los componentes eligen entre opciones con nombre (`variant="panel"`, `text-muted`,
`color="secondary"`); no inventan colores, sombras ni tamaños de letra.

Si algo no se puede expresar con lo que hay, se agrega al tema (ver más abajo), no
al componente.

## Dónde vive cada cosa

| Qué | Dónde |
| --- | --- |
| Paletas de marca, escala tipográfica, variables de Nuxt UI, movimiento | `app/assets/css/main.css` |
| Colores del tema (`primary`, `secondary`, `tertiary`, `neutral`) | `app/theme/colors.ts` |
| Aspecto de los componentes de Nuxt UI | `app/theme/*.ts`, reunidos en `app/app.config.ts` |
| Presets para `UTheme` (texto sobre fotos, edición en línea) | `app/theme/presets.ts` |
| Color `tertiary` y fuentes | `nuxt.config.ts` |
| Clases prohibidas y su reemplazo automático | `eslint.estilos.mjs` |

## Reglas

1. **Configurar, no sobrescribir.** El aspecto de un componente se define en
   `app/theme/*.ts` (`slots`, `variants`, `compoundVariants`, `defaultVariants`).
   Las props `ui` y `class` de cada instancia ganan sobre todo lo demás, así que se
   usan solo para casos únicos y llevan un comentario que diga por qué.
2. **Nombres semánticos en el marcado.** Grises: `text-highlighted`, `text-default`,
   `text-toned`, `text-muted`, `text-dimmed`, `bg-default`, `bg-muted`,
   `bg-elevated`, `bg-accented`, `bg-inverted`, `border-default`, `border-muted`.
   Marca: `primary`, `secondary`, `tertiary` y sus tonos (`bg-secondary-50`).
   Las paletas `pontem*` y los grises de Tailwind solo aparecen en `main.css`.
3. **Primero Nuxt UI.** Antes de escribir un componente o CSS, buscar si hay un
   componente o una opción del tema que lo resuelva (`UPageSection`, `UPageCard`,
   `UEmpty`, `UPageGrid`...).
4. **Reutilizar con componentes, no con `@apply`.** Si un bloque de `<style>`
   necesita utilidades, usa `@reference "~/assets/css/main.css"`.
5. **Sin animaciones ambientales.** El movimiento responde a una acción. Con
   `prefers-reduced-motion` todo se detiene (regla global en `main.css`).

`pnpm lint:check` hace cumplir las reglas 1 y 2: `eslint.estilos.mjs` lista las
clases prohibidas y `eslint --fix` las reemplaza solas.

## Vocabulario

| Rol | Clase |
| --- | --- |
| Texto destacado (títulos) | `text-highlighted` |
| Texto normal | `text-default` (se hereda del `body`) |
| Texto secundario | `text-toned`, `text-muted` |
| Iconos y adornos (nunca texto que se lea: queda en 2.6:1) | `text-dimmed` |
| Texto sobre fotos | `text-white` o el preset `onImage` |
| Título de portada | `text-display` |
| Título de página o sección | `text-title` |
| Título de bloque | `text-heading` |
| Título de tarjeta | `text-subheading` |

Los cuatro tamaños de título llevan su interlineado y su peso; no hace falta
agregar `font-bold`.

Contraste: todo texto pasa 4.5:1. Por eso `--ui-primary` está en el tono 600, los
colores de estado (`success`, `warning`, `error`, `info`) en 700–800, y los botones
y etiquetas con fondo teñido (`soft`, `subtle`...) usan `text-primary-700`: el 600
no llega sobre su propio tinte. Si agregas un color de texto sobre un fondo
de color, mídelo.

## Composición

- **El fundido Pontem** (`bg-brand-wash`, rojo y turquesa muy suaves) va detrás de
  todo el sitio, en el layout. Las secciones que alternan usan una banda gris
  translúcida (`bg-elevated/60`) para que el fundido se vea a través; en el inicio las
  bandas llevan las olas (`clip-wave-top`/`clip-wave-bottom`).
- **Todo alineado a la izquierda,** títulos incluidos: el tema ya lo hace en
  `UPageSection`, `UPageHero` y `SectionTitle`. Centrado solo donde no hay contenido
  con el que alinear (estados vacíos, la página de error).
- **Los banners (`PageBanner`) llevan solo el título.** La introducción y los llamados
  a la acción van debajo, en la página. Las páginas de trabajo (perfil, Personas)
  usan `UPageHeader`, sin foto.
- **Menú principal:** sin pastillas de fondo; el activo es texto en color con una
  barra fina debajo. La cabecera es de vidrio (`bg-default/85` con desenfoque).
- **Sin adornos que no informan:** etiquetas en mayúsculas sobre los títulos, números
  en secciones que no son una secuencia, "·" o "—" como separadores, flechas
  pegadas al texto de un enlace, una palabra del título en otro color, íconos como
  marcadores de sección, manchas o halos decorativos.

## Tarjetas

`UCard` tiene cuatro variantes propias, además de las de Nuxt UI:

| Variante | Para |
| --- | --- |
| `panel` (por defecto) | Paneles de contenido, formularios, cuentas, administración |
| `item` | Tarjetas de un listado (noticias, eventos, proyectos, casos); la imagen va en `#header` y llega al borde |
| `feature` | Bloques destacados (misión, pilares) |
| `inset` | Recuadros dentro de un formulario |

Las tarjetas que son un enlace usan `UPageCard` con `to`. El borde de una lista o de
una tabla (`rounded-lg border border-default`) no es una tarjeta y se queda como clase.

## Zonas con otro aspecto

Para cambiar varios componentes a la vez dentro de una zona se usa `UTheme` con un
preset de `app/theme/presets.ts`, no una prop `ui` en cada uno:

- `onImage`: sobre una foto oscura (portada, banner). Botones y campos en blanco
  translúcido.
- `inlineEdit`: formularios que imitan la tarjeta que editan. Los campos van con
  `variant="ghost"` y el color del texto que reemplazan.

Dos detalles de Nuxt UI que conviene saber:

- La prop `ui` de un componente **reemplaza** lo que el preset pone en ese mismo slot;
  no lo suma. Si un campo dentro de una zona necesita su propia `ui`, se compone con
  la constante del preset: `:ui="{ base: [onImageField, 'text-title md:text-title'] }"`.
- Los campos de texto llevan `md:text-sm` (en celular quedan en 16px para que iOS no
  haga zoom). Un tamaño propio en un campo necesita también su versión `md:`.

## Subir imágenes

`ImagePicker` (en `app/components`) es el único selector de imágenes: `mode="area"`
muestra la imagen y se hace clic encima, `mode="button"` es un botón. El archivo queda
en `v-model`; `current` es la imagen ya guardada. Para mostrar la vista previa en otro
lugar (como el fondo de la portada) está `useImagePreview`.

## Cómo agregar algo al tema

- **Una variante nueva:** agrégala en `variants.variant` del componente en
  `app/theme/*.ts`. El tipo de la prop `variant` la incluye solo (`nuxt typecheck`
  la valida).
- **Un tamaño de letra nuevo:** defínelo en el `@theme` de `main.css` con su
  `--line-height` y `--font-weight`, y regístralo en `tv.twMergeConfig` en
  `app/theme/colors.ts`; si no, `tailwind-merge` lo confunde con un color y lo
  descarta al combinar clases.
- **Un componente nuevo de `app/theme`:** agrega su nombre a `themeVariables` en
  `eslint.estilos.mjs` para que el lint revise sus clases.
- **Un mapa de clases en TypeScript** (colores por categoría, por ejemplo): nombra la
  variable terminando en `Classes` o `Colors` (`categoryColors`) para que el lint la
  revise, y escribe cada clase completa; Tailwind no encuentra las que se arman con
  plantillas (`` `bg-${color}-50` ``).

## Capturas de revisión

`test/visual` toma capturas de cada página para revisar los PRs de estilos. No es un
control de paridad: muestra qué cambió. También revisa que cada página tenga un solo
`h1` sin saltos de nivel, que nada se anime con movimiento reducido y que axe no
encuentre problemas de accesibilidad serios ni críticos.

1. Supabase local sembrado (`supabase db reset`) y la app corriendo contra él.
   **Nunca con el `.env` del repo, que apunta a producción.**
2. Antes del cambio: `pnpm test:visual:base` guarda las capturas de referencia.
3. Después: `pnpm test:visual`. Las diferencias quedan en `test/visual/informe`.

`PLAYWRIGHT_BASE_URL` cambia la URL (por defecto `http://localhost:3001`). La primera
vez, instala el navegador con `pnpm exec playwright install chromium`.
