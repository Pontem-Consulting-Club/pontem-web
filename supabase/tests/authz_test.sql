-- Pruebas de la migracion de perfiles y roles.
-- Se corre contra la base local. Cada bloque falla ruidosamente si algo no cumple.
--
-- Nota: el cambio de rol se hace SIEMPRE dentro de una funcion. Un `set local`
-- suelto en psql no hace nada, porque cada sentencia es su propia transaccion.

\set ON_ERROR_STOP on

create or replace function pg_temp.check(label text, condition boolean) returns void
language plpgsql as $$
begin
    if condition then
        raise notice 'PASS  %', label;
    else
        raise exception 'FAIL  %', label;
    end if;
end $$;

create or replace function pg_temp.impersonate(actor uuid) returns void
language plpgsql as $$
begin
    if actor is null then
        execute 'set local role anon';
    else
        execute 'set local role authenticated';
        execute format('set local request.jwt.claims = %L',
                       json_build_object('sub', actor, 'role', 'authenticated')::text);
    end if;
end $$;

-- Cuenta filas viendo la base con los ojos de `actor` (null = anonimo).
create or replace function pg_temp.count_as(actor uuid, query text) returns bigint
language plpgsql as $$
declare n bigint;
begin
    perform pg_temp.impersonate(actor);
    execute query into n;
    reset role;
    return n;
end $$;

-- Corre una sentencia como `actor`, sin tragarse los errores.
create or replace function pg_temp.run_as(actor uuid, stmt text) returns void
language plpgsql as $$
begin
    perform pg_temp.impersonate(actor);
    execute stmt;
    reset role;
end $$;

-- true si la sentencia fue rechazada (por RLS o por un trigger).
create or replace function pg_temp.denied(actor uuid, stmt text) returns boolean
language plpgsql as $$
begin
    perform pg_temp.impersonate(actor);
    begin
        execute stmt;
    exception when others then
        reset role;
        return true;
    end;
    reset role;
    return false;
end $$;

-- ============================================================
-- 1. El trigger crea perfil, y el allowlist decide el rol inicial
-- ============================================================

-- Idempotencia: si la corrida anterior dejo cuentas, se limpian antes. Los
-- perfiles se van solos por el ON DELETE CASCADE desde auth.users.
delete from auth.users where id in (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
);

insert into auth.users (id, email, raw_user_meta_data) values
    ('11111111-1111-1111-1111-111111111111', 'clubconsultoria.uc@gmail.com', '{}'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'marketing@pontemcc.cl', '{"display_name":"José Ramírez"}'::jsonb),
    ('33333333-3333-3333-3333-333333333333', 'miembro@pontemcc.cl',   '{"display_name":"José Ramírez"}'::jsonb),
    ('44444444-4444-4444-4444-444444444444', 'otro@pontemcc.cl',      '{}'::jsonb);

-- Se cuentan solo las cuentas de esta prueba: el seed ya dejo las suyas.
select pg_temp.check('trigger crea un perfil por cuenta',
    (select count(*) from public.profiles where id in (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444')) = 4);

select pg_temp.check('FR-31 la cuenta institucional arranca como admin',
    (select role from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'admin');

select pg_temp.check('FR-31 la cuenta institucional arranca activa, no invitada',
    (select state from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'active');

select pg_temp.check('las cuentas invitadas arrancan en invited',
    (select state from public.profiles where id = '22222222-2222-2222-2222-222222222222') = 'invited');

select pg_temp.check('las demas cuentas arrancan como member',
    (select role from public.profiles where id = '22222222-2222-2222-2222-222222222222') = 'member');

-- ============================================================
-- 2. Handles derivados (FR-15)
-- ============================================================

select pg_temp.check('FR-15 handle sin tildes ni simbolos',
    (select handle from public.profiles where id = '22222222-2222-2222-2222-222222222222') = 'jose-ramirez');

select pg_temp.check('FR-15 colision de handle recibe sufijo',
    (select handle from public.profiles where id = '33333333-3333-3333-3333-333333333333') = 'jose-ramirez-2');

update public.profiles set role = 'editor', state = 'active'
 where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set state = 'active'
 where id in ('11111111-1111-1111-1111-111111111111',
              '33333333-3333-3333-3333-333333333333',
              '44444444-4444-4444-4444-444444444444');

-- ============================================================
-- 3. Columnas privilegiadas (FR-10)
-- ============================================================

select pg_temp.run_as('33333333-3333-3333-3333-333333333333',
    $q$update public.profiles set role = 'admin', bio = 'me asciendo solo'
        where id = '33333333-3333-3333-3333-333333333333'$q$);

select pg_temp.check('FR-10 un miembro no se auto-asciende',
    (select role from public.profiles where id = '33333333-3333-3333-3333-333333333333') = 'member');

select pg_temp.check('el miembro si edita sus campos normales',
    (select bio from public.profiles where id = '33333333-3333-3333-3333-333333333333') = 'me asciendo solo');

select pg_temp.run_as('11111111-1111-1111-1111-111111111111',
    $q$update public.profiles set role = 'member'
        where id = '11111111-1111-1111-1111-111111111111'$q$);

select pg_temp.check('FR-10 un admin no se degrada a si mismo',
    (select role from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'admin');

select pg_temp.run_as('11111111-1111-1111-1111-111111111111',
    $q$update public.profiles set role = 'editor'
        where id = '44444444-4444-4444-4444-444444444444'$q$);

select pg_temp.check('ADM-2 un admin si cambia el rol de otra persona',
    (select role from public.profiles where id = '44444444-4444-4444-4444-444444444444') = 'editor');

-- Un miembro no puede tocar el perfil ajeno en absoluto.
select pg_temp.run_as('33333333-3333-3333-3333-333333333333',
    $q$update public.profiles set bio = 'te edito el perfil'
        where id = '44444444-4444-4444-4444-444444444444'$q$);
select pg_temp.check('FR-14 un miembro no edita el perfil de otra persona',
    (select bio from public.profiles where id = '44444444-4444-4444-4444-444444444444') is distinct from 'te edito el perfil');

-- ============================================================
-- 4. Nunca sin administradores (FR-10)
-- ============================================================

select pg_temp.check('FR-10 no se puede desactivar al ultimo admin',
    pg_temp.denied('11111111-1111-1111-1111-111111111111',
        $q$update public.profiles set state = 'inactive' where id = '11111111-1111-1111-1111-111111111111'$q$));

update public.profiles set role = 'admin' where id = '44444444-4444-4444-4444-444444444444';
update public.profiles set state = 'inactive' where id = '44444444-4444-4444-4444-444444444444';
select pg_temp.check('con otro admin activo si se permite desactivar',
    (select state from public.profiles where id = '44444444-4444-4444-4444-444444444444') = 'inactive');
update public.profiles set state = 'active', role = 'member' where id = '44444444-4444-4444-4444-444444444444';

-- ============================================================
-- 5. RLS de contenido (FR-09, FR-35)
-- ============================================================

select pg_temp.check('FR-09 un miembro no escribe contenido',
    pg_temp.denied('33333333-3333-3333-3333-333333333333',
        $q$insert into public."News" (title, published_date) values ('hackeo', now())$q$));

select pg_temp.check('FR-09 un miembro no borra proyectos',
    (select pg_temp.count_as('33333333-3333-3333-3333-333333333333',
        $q$with gone as (delete from public."Projects" returning 1) select count(*) from gone$q$)) = 0);

select pg_temp.check('FR-35 un editor si escribe contenido',
    not pg_temp.denied('22222222-2222-2222-2222-222222222222',
        $q$insert into public."News" (title, published_date) values ('nota de marketing', now())$q$));

select pg_temp.check('FR-35 el mismo editor toca Projects de otra coordinacion',
    not pg_temp.denied('22222222-2222-2222-2222-222222222222',
        $q$insert into public."Projects" (title) values ('consultoria social')$q$));

select pg_temp.check('el sitio publico sigue siendo legible por anonimos',
    (select pg_temp.count_as(null, $q$select count(*) from public."Events"$q$)) > 0);

-- Desactivar quita permisos de verdad, no solo el login (FR-03, ADM-3).
update public.profiles set state = 'inactive'
 where id = '22222222-2222-2222-2222-222222222222';

select pg_temp.check('FR-03 un editor desactivado deja de escribir contenido',
    pg_temp.denied('22222222-2222-2222-2222-222222222222',
        $q$insert into public."News" (title, published_date) values ('sigo entrando', now())$q$));

update public.profiles set state = 'active'
 where id = '22222222-2222-2222-2222-222222222222';

select pg_temp.check('FR-03 reactivar le devuelve los permisos',
    not pg_temp.denied('22222222-2222-2222-2222-222222222222',
        $q$insert into public."News" (title, published_date) values ('vuelvo', now())$q$));

-- MEM-1: terminar el onboarding es la unica transicion de estado propia.
insert into auth.users (id, email, raw_user_meta_data) values
    ('55555555-5555-5555-5555-555555555555', 'recien@pontemcc.cl', '{}'::jsonb);

select pg_temp.run_as('55555555-5555-5555-5555-555555555555',
    $q$update public.profiles set state = 'active', display_name = 'Recien Llegada'
        where id = '55555555-5555-5555-5555-555555555555'$q$);

select pg_temp.check('MEM-1 la persona invitada se activa al completar el perfil',
    (select state from public.profiles where id = '55555555-5555-5555-5555-555555555555') = 'active');

update public.profiles set state = 'inactive'
 where id = '55555555-5555-5555-5555-555555555555';

select pg_temp.run_as('55555555-5555-5555-5555-555555555555',
    $q$update public.profiles set state = 'active'
        where id = '55555555-5555-5555-5555-555555555555'$q$);

select pg_temp.check('ADM-3 quien fue desactivado no se reactiva solo',
    (select state from public.profiles where id = '55555555-5555-5555-5555-555555555555') = 'inactive');

-- ============================================================
-- 6. Privacidad de perfiles (FR-14)
-- ============================================================

select pg_temp.check('FR-14 un miembro solo se ve a si mismo',
    (select pg_temp.count_as('33333333-3333-3333-3333-333333333333',
        $q$select count(*) from public.profiles$q$)) = 1);

select pg_temp.check('ADM-4 un admin ve el directorio completo',
    (select pg_temp.count_as('11111111-1111-1111-1111-111111111111',
        $q$select count(*) from public.profiles$q$))
    = (select count(*) from public.profiles));

select pg_temp.check('FR-14 el anonimo no lee profiles',
    (select pg_temp.count_as(null, $q$select count(*) from public.profiles$q$)) = 0);

update public.profiles set is_public = true
 where id = '33333333-3333-3333-3333-333333333333';

select pg_temp.check('MEM-3 el anonimo lee el perfil publico por la vista',
    (select pg_temp.count_as(null, $q$select count(*) from public.public_profiles$q$)) = 1);

select pg_temp.check('FR-14 la vista no expone rol ni estado',
    not exists (select 1 from information_schema.columns
                 where table_name = 'public_profiles'
                   and column_name in ('role', 'state', 'coach_enabled')));

update public.profiles set state = 'inactive'
 where id = '33333333-3333-3333-3333-333333333333';

select pg_temp.check('ADM-3 desactivar deja de publicar el perfil',
    (select pg_temp.count_as(null, $q$select count(*) from public.public_profiles$q$)) = 0);

-- ============================================================
-- 7. La tabla legacy ya no existe (FR-04)
-- ============================================================

select pg_temp.check('FR-04 public."Users" fue eliminada',
    not exists (select 1 from information_schema.tables
                 where table_schema = 'public' and table_name = 'Users'));
