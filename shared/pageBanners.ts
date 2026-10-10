/**
 * Banners de las secciones públicas. Cada uno tiene una foto por defecto (en
 * public/) que se usa mientras ningún editor elija otra (tabla `page_banners`).
 * Las claves tienen que coincidir con el check de la migración 20261011120000.
 */
export const PAGE_BANNER_DEFAULTS = {
    'consultoria-social': '/BienvenidaConsultores.jpg',
    'eventos': '/BTGDay.jpeg',
    'noticias': '/ActividadSumma.JPG',
    'material-estudio': '/LugarEstudio.jpg',
    'nosotros': '/Equipo2024.jpeg'
} as const

export type BannerPage = keyof typeof PAGE_BANNER_DEFAULTS

export const isBannerPage = (value: unknown): value is BannerPage =>
    typeof value === 'string' && Object.hasOwn(PAGE_BANNER_DEFAULTS, value)
