// Prueba las inscripciones a eventos por HTTP contra la app corriendo.
// Requiere `supabase db reset` reciente y el servidor de desarrollo arriba.

const SB = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? ''
const APP = process.env.APP_URL ?? 'http://localhost:3000'
const COOKIE_NAME = 'sb-127-auth-token'
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

function sessionCookie(session) {
  const encoded = 'base64-' + Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  if (encoded.length <= MAX_CHUNK_SIZE) return `${COOKIE_NAME}=${encoded}`
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
  let payload = null
  try { payload = await res.json() } catch { /* respuesta sin cuerpo */ }
  return { status: res.status, payload }
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

const { payload: events } = await call('/api/events')
const now = Date.now()
const future = events.filter(e => new Date(e.date).getTime() > now)
const open = future.find(e => e.registration_mode === 'open')
const membersOnly = future.find(e => e.registration_mode === 'members_only')
const closed = future.find(e => e.registration_mode === 'none')

if (!open || !membersOnly || !closed) {
  throw new Error('El seed no dejó un evento de cada modo; corre `supabase db reset`.')
}

// Idempotencia: la prueba tiene que poder correrse dos veces seguidas sin
// reiniciar la base. Se limpia la inscripción del miembro y se usa un correo de
// invitado distinto en cada corrida, porque el índice único es permanente.
await call(`/api/events/${membersOnly.id}/registrations`, { cookie: cookies.miembro, method: 'DELETE' })
await call(`/api/events/${open.id}/registrations`, { cookie: cookies.miembro, method: 'DELETE' })
const guestEmail = `ana+${Date.now()}@example.org`

// --- FR-32: el modo manda ---
check('evento sin inscripcion rechaza al miembro',
  (await call(`/api/events/${closed.id}/registrations`, { cookie: cookies.miembro, method: 'POST' })).status, 409)

check('miembro se inscribe en evento solo-miembros',
  (await call(`/api/events/${membersOnly.id}/registrations`, { cookie: cookies.miembro, method: 'POST' })).status, 200)

check('FR-18 no se inscribe dos veces al mismo evento',
  (await call(`/api/events/${membersOnly.id}/registrations`, { cookie: cookies.miembro, method: 'POST' })).status, 409)

check('VIS-3 el invitado NO entra a un evento solo-miembros',
  (await call(`/api/events/${membersOnly.id}/registrations`, {
    method: 'POST', body: { guest_name: 'Ana Fuentes', guest_email: guestEmail }
  })).status, 401)

// --- VIS-3: invitados en eventos abiertos ---
check('VIS-3 el invitado se inscribe en un evento abierto',
  (await call(`/api/events/${open.id}/registrations`, {
    method: 'POST', body: { guest_name: 'Ana Fuentes', guest_email: guestEmail }
  })).status, 200)

check('FR-33 el mismo correo de invitado no se repite',
  (await call(`/api/events/${open.id}/registrations`, {
    method: 'POST', body: { guest_name: 'Ana Fuentes', guest_email: guestEmail.toUpperCase() }
  })).status, 409)

check('FR-33 el invitado sin correo valido es rechazado',
  (await call(`/api/events/${open.id}/registrations`, {
    method: 'POST', body: { guest_name: 'Sin Correo', guest_email: 'no-es-un-correo' }
  })).status, 400)

check('FR-33 el invitado sin nombre es rechazado',
  (await call(`/api/events/${open.id}/registrations`, {
    method: 'POST', body: { guest_name: '', guest_email: `otra+${Date.now()}@example.org` }
  })).status, 400)

// --- FR-21: quien ve la lista ---
check('EDI-2 el editor ve la lista de inscritos',
  (await call(`/api/events/${open.id}/registrations`, { cookie: cookies.editor })).status, 200)

check('FR-21 el miembro NO ve la lista de inscritos',
  (await call(`/api/events/${open.id}/registrations`, { cookie: cookies.miembro })).status, 403)

check('FR-21 el anonimo NO ve la lista de inscritos',
  (await call(`/api/events/${open.id}/registrations`)).status, 401)

// La lista mezcla miembros e invitados, marcando cuales son invitados.
const lista = await call(`/api/events/${open.id}/registrations`, { cookie: cookies.editor })
check('la lista marca al invitado como invitado',
  lista.payload.some(r => r.is_guest && r.detail === guestEmail), true)

// --- MEM-5: estadisticas propias ---
const antes = await call('/api/profile/registrations', { cookie: cookies.miembro })
check('MEM-5 el miembro ve su inscripcion', antes.payload.stats.registered, 1)

// --- MEM-5 / FR-19: cancelar ---
check('MEM-5 el miembro cancela su inscripcion',
  (await call(`/api/events/${membersOnly.id}/registrations`, { cookie: cookies.miembro, method: 'DELETE' })).status, 200)

const despues = await call('/api/profile/registrations', { cookie: cookies.miembro })
check('FR-19 cancelar baja el conteo activo', despues.payload.stats.registered, 0)
// >= 1 y no == 1: las corridas anteriores dejan canceladas, que es justo lo que
// FR-19 promete (cancelar no borra el historial).
check('FR-19 cancelar conserva el historial', despues.payload.stats.cancelled >= 1, true)

// Volver a inscribirse tras cancelar: el indice unico no distingue el estado, y
// sin reactivar la fila cancelada nadie podria corregir una baja por error.
check('quien cancelo puede volver a inscribirse',
  (await call(`/api/events/${membersOnly.id}/registrations`, { cookie: cookies.miembro, method: 'POST' })).status, 200)

const revivido = await call('/api/profile/registrations', { cookie: cookies.miembro })
check('reinscribirse deja una sola fila vigente', revivido.payload.stats.registered, 1)

await call(`/api/events/${membersOnly.id}/registrations`, { cookie: cookies.miembro, method: 'DELETE' })

check('cancelar algo en lo que no estabas inscrito da 404',
  (await call(`/api/events/${open.id}/registrations`, { cookie: cookies.miembro, method: 'DELETE' })).status, 404)

// --- FR-21: marcar asistencia ---
const inscritos = await call(`/api/events/${open.id}/registrations`, { cookie: cookies.editor })
const alguien = inscritos.payload.find(r => r.status !== 'cancelled')

check('FR-21 el editor marca asistencia',
  (await call(`/api/events/${open.id}/registrations/${alguien.id}`, {
    cookie: cookies.editor, method: 'PUT', body: { attended: true }
  })).status, 200)

check('FR-21 el miembro NO marca asistencia',
  (await call(`/api/events/${open.id}/registrations/${alguien.id}`, {
    cookie: cookies.miembro, method: 'PUT', body: { attended: true }
  })).status, 403)

check('FR-21 el anonimo NO marca asistencia',
  (await call(`/api/events/${open.id}/registrations/${alguien.id}`, {
    method: 'PUT', body: { attended: true }
  })).status, 401)

// Se deja como estaba para que la prueba pueda repetirse.
await call(`/api/events/${open.id}/registrations/${alguien.id}`, {
  cookie: cookies.editor, method: 'PUT', body: { attended: false }
})

const failed = results.filter(r => !r).length
console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`)
process.exit(failed === 0 ? 0 : 1)
