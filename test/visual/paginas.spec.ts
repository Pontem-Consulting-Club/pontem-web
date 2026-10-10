import { expect, test, type Page } from '@playwright/test'

/**
 * Capturas de cada página pública y de las vistas de edición, para revisar los
 * PRs de estilos. `pnpm test:visual:base` guarda la referencia; `pnpm test:visual`
 * compara contra ella y deja el informe en test/visual/informe.
 */

// Fecha fija: las fechas relativas ("hace 3 días") no cambian entre corridas.
const AHORA = new Date('2026-10-09T12:00:00-03:00')

async function abrir(page: Page, ruta: string) {
  await page.clock.setFixedTime(AHORA)
  // 'load' y no 'networkidle': el servidor de desarrollo mantiene conexiones
  // abiertas (HMR) y en máquinas cargadas networkidle puede no llegar nunca.
  await page.goto(ruta, { waitUntil: 'load' })
  await page.waitForFunction(() => {
    const nuxt = (window as unknown as { useNuxtApp?: () => { isHydrating: boolean } }).useNuxtApp
    return !!nuxt && nuxt().isHydrating === false
  })
}

/** Primer enlace de una página de listado que coincide con el patrón. */
async function primerEnlace(page: Page, listado: string, patron: RegExp) {
  await abrir(page, listado)
  const hrefs = await page.locator('a[href]').evaluateAll(as => as.map(a => a.getAttribute('href') ?? ''))
  const href = hrefs.find(h => patron.test(h))
  expect(href, `sin enlace ${patron} en ${listado}`).toBeTruthy()
  return href!
}

async function capturar(page: Page, nombre: string) {
  // El carrusel del inicio rota con un temporizador; se tapa para que la captura
  // no cambie entre una toma y otra.
  const mask = nombre === 'inicio' ? [page.locator('main section').first()] : []
  await expect(page).toHaveScreenshot(`${nombre}.png`, { fullPage: true, mask })
}

test.describe('públicas', () => {
  for (const [nombre, ruta] of [
    ['inicio', '/'],
    ['consultoria-social', '/consultoria-social'],
    ['eventos', '/eventos'],
    ['noticias', '/noticias'],
    ['material-estudio', '/material-estudio'],
    ['nosotros', '/nosotros'],
    ['login', '/login'],
    ['recuperar-clave', '/recuperar-clave']
  ] as const) {
    test(nombre, async ({ page }) => {
      await abrir(page, ruta)
      await capturar(page, nombre)
    })
  }

  test('noticia', async ({ page }) => {
    const href = await primerEnlace(page, '/noticias', /^\/noticias\/\d+/)
    await abrir(page, href)
    await capturar(page, 'noticia')
  })

  test('caso', async ({ page }) => {
    const href = await primerEnlace(page, '/material-estudio', /^\/material-estudio\/casos\/\d+/)
    await abrir(page, href)
    await capturar(page, 'caso')
  })
})

test.describe('con sesión', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page, '/login')
    await page.fill('input[name=email]', 'admin@pontem.test')
    await page.fill('input[name=password]', 'pontem123')
    await page.click('button[type=submit]')
    await page.waitForURL(url => !url.pathname.startsWith('/login'))
  })

  for (const [nombre, ruta] of [
    ['perfil', '/perfil'],
    ['admin-usuarios', '/admin/usuarios'],
    ['consultoria-social-editor', '/consultoria-social'],
    ['material-estudio-nuevo', '/material-estudio/casos/nuevo']
  ] as const) {
    test(nombre, async ({ page }) => {
      await abrir(page, ruta)
      await capturar(page, nombre)
    })
  }

  test('proyecto-en-edicion', async ({ page }) => {
    await abrir(page, '/consultoria-social')
    await page.getByRole('button', { name: 'Editar proyecto' }).first().click()
    await capturar(page, 'proyecto-en-edicion')
  })
})

test.describe('estructura', () => {
  test('un solo h1 y títulos sin saltos de nivel', async ({ page }) => {
    for (const ruta of ['/', '/consultoria-social', '/eventos', '/noticias', '/material-estudio', '/nosotros']) {
      await abrir(page, ruta)
      const niveles = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(hs => hs.map(h => Number(h.tagName[1])))
      expect.soft(niveles.filter(n => n === 1).length, `${ruta}: cantidad de h1`).toBe(1)
      const saltos = niveles.filter((n, i) => i > 0 && n > niveles[i - 1]! + 1)
      expect.soft(saltos, `${ruta}: saltos de nivel`).toEqual([])
    }
  })

})

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nada se anima', async ({ page }) => {
    for (const ruta of ['/', '/consultoria-social']) {
      await abrir(page, ruta)
      const animaciones = await page.evaluate(() =>
        document.getAnimations().filter(a => a.playState === 'running').map(a => (a as CSSAnimation).animationName ?? 'js'))
      expect.soft(animaciones, `${ruta}: animaciones activas`).toEqual([])
    }
  })
})
