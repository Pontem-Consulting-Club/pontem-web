// Prueba la autorizacion por HTTP contra la app corriendo, con sesion de cookie
// de verdad (que es como la lee @nuxtjs/supabase, no por cabecera Authorization).

const SB = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? ''
const APP = process.env.APP_URL ?? 'http://localhost:3000'
const COOKIE_NAME = 'sb-127-auth-token' // sb-<primer segmento del host>-auth-token
const MAX_CHUNK_SIZE = 3180

async function signIn(email) {
  const res = await fetch(`${SB}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'pontem123' })
  })
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${await res.text()}`)
  return res.json()
}

// Reproduce como @supabase/ssr guarda la sesion: prefijo base64- y troceado.
function sessionCookie(session) {
  const encoded = 'base64-' + Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')

  if (encoded.length <= MAX_CHUNK_SIZE) {
    return `${COOKIE_NAME}=${encoded}`
  }

  const chunks = []
  for (let i = 0; i * MAX_CHUNK_SIZE < encoded.length; i++) {
    chunks.push(`${COOKIE_NAME}.${i}=${encoded.slice(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE)}`)
  }
  return chunks.join('; ')
}

async function call(path, { cookie, method = 'GET', body } = {}) {
  const res = await fetch(`${APP}${path}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  return res.status
}

const results = []
function check(label, actual, expected) {
  const ok = actual === expected
  results.push(ok)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  (esperado ${expected}, recibido ${actual})`)
}

const cookies = {}
for (const who of ['admin', 'editor', 'miembro']) {
  cookies[who] = sessionCookie(await signIn(`${who}@pontem.test`))
}

const news = { title: 'prueba automatizada', published_date: '2026-09-05' }

// --- Administracion de personas: solo admin (matriz de permisos) ---
check('admin entra al directorio',      await call('/api/admin/users', { cookie: cookies.admin }), 200)
check('editor NO entra al directorio',  await call('/api/admin/users', { cookie: cookies.editor }), 403)
check('miembro NO entra al directorio', await call('/api/admin/users', { cookie: cookies.miembro }), 403)
check('anonimo NO entra al directorio', await call('/api/admin/users'), 401)

// --- Contenido: editor y admin (FR-09, FR-35) ---
check('admin escribe contenido',        await call('/api/admin/news', { cookie: cookies.admin, method: 'POST', body: news }), 200)
check('editor escribe contenido',       await call('/api/admin/news', { cookie: cookies.editor, method: 'POST', body: news }), 200)
check('miembro NO escribe contenido',   await call('/api/admin/news', { cookie: cookies.miembro, method: 'POST', body: news }), 403)
check('anonimo NO escribe contenido',   await call('/api/admin/news', { method: 'POST', body: news }), 401)

// --- Perfil propio ---
check('miembro lee su perfil',          await call('/api/profile', { cookie: cookies.miembro }), 200)
check('anonimo NO lee perfil',          await call('/api/profile'), 401)

// --- EDI-3: la negacion es 403, no 404 ni pantalla en blanco ---
check('EDI-3 al editor se le niega con 403 y no 404',
  await call('/api/admin/users/00000000-0000-0000-0000-000000000000', {
    cookie: cookies.editor, method: 'PUT', body: { role: 'admin' }
  }), 403)

// --- El sitio publico sigue abierto ---
check('anonimo lee eventos',            await call('/api/events'), 200)

// --- Perfil publico: 404 mientras no se publique (FR-14) ---
check('perfil no publicado da 404',     await call('/api/members/admin-de-prueba'), 404)

const failed = results.filter(r => !r).length
console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`)
process.exit(failed === 0 ? 0 : 1)
