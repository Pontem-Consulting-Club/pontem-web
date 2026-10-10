import { defineConfig, devices } from '@playwright/test'

/**
 * Capturas de revisión (test/visual). No es un control de paridad píxel a píxel:
 * sirven para ver qué cambió en cada PR de estilos. Ver docs/estilos.md.
 *
 * Requiere la app corriendo contra Supabase LOCAL (nunca con el .env del repo,
 * que apunta a producción) y la base sembrada con `supabase db reset`.
 */
export default defineConfig({
  testDir: 'test/visual',
  snapshotPathTemplate: '{testDir}/__capturas__/{projectName}/{arg}{ext}',
  // La app corre en modo dev: la primera visita a cada ruta compila y tarda.
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'test/visual/informe' }]],
  outputDir: 'test/visual/resultados',
  expect: {
    timeout: 60_000,
    toHaveScreenshot: {
      animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.002,
      stylePath: 'test/visual/capturas.css'
    }
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001',
    locale: 'es-CL',
    timezoneId: 'America/Santiago'
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'celular', use: { ...devices['Pixel 7'] } }
  ]
})
