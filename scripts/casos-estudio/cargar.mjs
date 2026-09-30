// Carga la biblioteca de casos de estudio (casos.json) en un proyecto de Supabase:
// sube cada PDF al bucket `documents` y crea o actualiza su fila en CaseStudies.
//
//   SUPABASE_URL=... SUPABASE_SECRET_KEY=... node scripts/casos-estudio/cargar.mjs <carpeta-pdfs>
//
// <carpeta-pdfs> tiene un <slug>.pdf por cada entrada de casos.json. Los PDFs no
// viven en git. Es idempotente: una fila se reconoce por su document_url, asi que
// correrlo dos veces actualiza en vez de duplicar.

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const SB = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SECRET_KEY
const dir = process.argv[2]
if (!SB || !KEY || !dir) {
  console.error('Uso: SUPABASE_URL=... SUPABASE_SECRET_KEY=... node scripts/casos-estudio/cargar.mjs <carpeta-pdfs>')
  process.exit(1)
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` }

async function call(method, path, body, extra = {}) {
  const res = await fetch(`${SB}${path}`, { method, headers: { ...headers, ...extra }, body })
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

const cases = JSON.parse(await readFile(new URL('./casos.json', import.meta.url), 'utf8'))

// El listado ordena por id descendente: se inserta al reves para que el primero
// de casos.json quede primero en la pagina.
for (const { slug, ...fields } of cases.toReversed()) {
  const pdf = await readFile(join(dir, `${slug}.pdf`))
  const path = `casos/biblioteca/${slug}.pdf`

  await call('POST', `/storage/v1/object/documents/${path}`, pdf,
    { 'Content-Type': 'application/pdf', 'x-upsert': 'true' })

  const row = JSON.stringify({ ...fields, document_url: path, document_size_bytes: pdf.length })
  const json = { 'Content-Type': 'application/json', Prefer: 'return=representation' }
  const [existing] = await call('GET', `/rest/v1/CaseStudies?select=id&document_url=eq.${encodeURIComponent(path)}`)

  if (existing) {
    await call('PATCH', `/rest/v1/CaseStudies?id=eq.${existing.id}`, row, json)
    console.log(`actualizado  #${existing.id} ${fields.title}`)
  } else {
    const [created] = await call('POST', '/rest/v1/CaseStudies', row, json)
    console.log(`creado       #${created.id} ${fields.title}`)
  }
}

console.log(`\n${cases.length} casos listos en ${SB}`)
