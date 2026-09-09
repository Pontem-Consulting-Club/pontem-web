# Pruebas de base de datos

Estas pruebas comprueban las reglas que viven en Postgres: policies de RLS,
triggers y constraints. Son las reglas que **no** se pueden comprobar solo desde
las rutas, porque dos peticiones simultaneas se saltarian un chequeo hecho en el
servidor.

| Archivo                  | Que cubre                                                        |
| ------------------------ | ---------------------------------------------------------------- |
| `authz_test.sql`         | Roles, perfiles, RLS de contenido, bootstrap del primer admin     |
| `registrations_test.sql` | Cupo, unicidad de inscripciones, coherencia miembro/invitado      |

Se corren contra la base **local**, nunca contra produccion:

```bash
pnpm supabase db reset
docker exec -i supabase_db_pontem-web \
  psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < supabase/tests/authz_test.sql
docker exec -i supabase_db_pontem-web \
  psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < supabase/tests/registrations_test.sql
```

Cada comprobacion imprime `PASS`. La primera que falle corta la corrida con
`FAIL` y el nombre de la regla que se rompio. Las dos son idempotentes: limpian
lo suyo al empezar, asi que se pueden repetir sin reiniciar la base.

## Dos trampas al escribir pruebas nuevas

1. Un `set local role` suelto en psql **no hace nada**, porque cada sentencia es
   su propia transaccion. Por eso el cambio de rol pasa siempre por
   `pg_temp.count_as`, `pg_temp.run_as` o `pg_temp.denied`.
2. El seed ya deja cuentas y eventos. Nunca cuentes filas de toda una tabla:
   filtra por los identificadores de la prueba.

# Pruebas por HTTP

En `test/` hay dos pruebas que atacan la app corriendo, para comprobar que las
rutas devuelven los codigos correctos (401 sin sesion, 403 con sesion
insuficiente):

```bash
pnpm dev   # en otra terminal
SUPABASE_URL=http://127.0.0.1:54321 \
SUPABASE_PUBLISHABLE_KEY=<la publishable local> \
APP_URL=http://localhost:3000 \
  node test/authz.http.mjs && node test/registrations.http.mjs
```

Ojo: la sesion viaja en **cookie**, no en cabecera `Authorization`. Es lo que lee
`@nuxtjs/supabase`, y por eso las pruebas construyen la cookie a mano con el
mismo formato de `@supabase/ssr` (prefijo `base64-` y troceado a 3180 bytes).
