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

-- La base local puede tener otras cuentas admin activas (seed, bootstrap), y el
-- trigger las cuenta a todas. Para probar "el ultimo admin", `actor` queda como
-- el unico durante la sentencia. Todo pasa en una sola sentencia: si algo falla,
-- se deshace entero y ninguna cuenta real queda desactivada.
create or replace function pg_temp.denied_as_sole_admin(actor uuid, stmt text) returns boolean
language plpgsql as $$
declare
    others uuid[];
    result boolean;
begin
    select coalesce(array_agg(id), '{}') into others
      from public.profiles
     where role = 'admin' and state = 'active' and id <> actor;
    update public.profiles set state = 'inactive' where id = any(others);
    result := pg_temp.denied(actor, stmt);
    update public.profiles set state = 'active' where id = any(others);
    return result;
end $$;

select pg_temp.check('FR-10 no se puede desactivar al ultimo admin',
    pg_temp.denied_as_sole_admin('11111111-1111-1111-1111-111111111111',
        $q$update public.profiles set state = 'inactive' where id = '11111111-1111-1111-1111-111111111111'$q$));

update public.profiles set role = 'admin' where id = '44444444-4444-4444-4444-444444444444';
update public.profiles set state = 'inactive' where id = '44444444-4444-4444-4444-444444444444';
select pg_temp.check('con otro admin activo si se permite desactivar',
    (select state from public.profiles where id = '44444444-4444-4444-4444-444444444444') = 'inactive');

-- El trigger cuenta todas las filas aunque quien escribe ya no vea las ajenas:
-- al desactivarse, un admin deja de ser admin dentro del mismo trigger.
update public.profiles set state = 'active' where id = '44444444-4444-4444-4444-444444444444';
select pg_temp.run_as('11111111-1111-1111-1111-111111111111',
    $q$update public.profiles set state = 'inactive' where id = '11111111-1111-1111-1111-111111111111'$q$);
select pg_temp.check('ADM-5 con otro admin activo, un admin puede desactivarse a si mismo',
    (select state from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'inactive');
update public.profiles set state = 'active' where id = '11111111-1111-1111-1111-111111111111';
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

-- Solo la cuenta de esta prueba: el seed o la app en local pueden dejar otros perfiles publicos.
select pg_temp.check('MEM-3 el anonimo lee el perfil publico por la vista',
    (select pg_temp.count_as(null, $q$select count(*) from public.public_profiles
                                      where id = '33333333-3333-3333-3333-333333333333'$q$)) = 1);

select pg_temp.check('FR-14 la vista no expone rol ni estado',
    not exists (select 1 from information_schema.columns
                 where table_name = 'public_profiles'
                   and column_name in ('role', 'state', 'coach_enabled')));

update public.profiles set state = 'inactive'
 where id = '33333333-3333-3333-3333-333333333333';

select pg_temp.check('ADM-3 desactivar deja de publicar el perfil',
    (select pg_temp.count_as(null, $q$select count(*) from public.public_profiles
                                      where id = '33333333-3333-3333-3333-333333333333'$q$)) = 0);

-- ============================================================
-- 7. La tabla legacy ya no existe (FR-04)
-- ============================================================

select pg_temp.check('FR-04 public."Users" fue eliminada',
    not exists (select 1 from information_schema.tables
                 where table_schema = 'public' and table_name = 'Users'));

-- ============================================================
-- 8. Lista de inscritos para quien organiza (FR-21, EDI-2)
-- ============================================================

-- Las policies de profiles no dejan a un editor leer otras cuentas; la lista
-- sale de event_registration_roster(), que entrega solo nombre y coordinacion.
delete from public."Events" where id = 900101;
insert into public."Events" (id, title, subtitle, date, registration_mode)
values (900101, 'Evento lista de inscritos', 'prueba', now() + interval '30 days', 'open');
insert into public.event_registrations (event_id, profile_id)
values (900101, '44444444-4444-4444-4444-444444444444');
insert into public.event_registrations (event_id, guest_name, guest_email)
values (900101, 'Invitada de prueba', 'invitada@example.org');

select pg_temp.check('EDI-2 un editor ve la lista completa del evento',
    pg_temp.count_as('22222222-2222-2222-2222-222222222222',
        $q$select count(*) from public.event_registration_roster(900101)$q$) = 2);

-- El nombre esperado se lee como postgres: el editor no puede leerlo de profiles.
select pg_temp.check('EDI-2 un editor ve el nombre de cada miembro, no "Sin nombre"',
    pg_temp.count_as('22222222-2222-2222-2222-222222222222',
        format($q$select count(*) from public.event_registration_roster(900101)
                   where not is_guest and name = %L and name <> 'Sin nombre'$q$,
               (select display_name from public.profiles
                 where id = '44444444-4444-4444-4444-444444444444'))) = 1);

select pg_temp.check('la lista marca a los invitados con su correo',
    pg_temp.count_as('22222222-2222-2222-2222-222222222222',
        $q$select count(*) from public.event_registration_roster(900101)
           where is_guest and name = 'Invitada de prueba' and detail = 'invitada@example.org'$q$) = 1);

select pg_temp.check('FR-21 un miembro no puede leer la lista de un evento',
    pg_temp.denied('44444444-4444-4444-4444-444444444444',
        $q$select * from public.event_registration_roster(900101)$q$));

select pg_temp.check('un anonimo no puede leer la lista de un evento',
    pg_temp.denied(null, $q$select * from public.event_registration_roster(900101)$q$));

delete from public."Events" where id = 900101;

-- ============================================================
-- 9. Casos de estudio: solo editores y admins escriben (FR-09)
-- ============================================================

-- true si `actor` pudo ejecutar la sentencia. Lo escrito se deshace en el acto
-- (subtransaccion), asi la prueba no deja filas ni objetos en storage.
create or replace function pg_temp.allowed_then_undone(actor uuid, stmt text) returns boolean
language plpgsql as $$
begin
    perform pg_temp.impersonate(actor);
    begin
        execute stmt;
        raise exception 'deshacer' using errcode = 'ZZ001';
    exception
        when sqlstate 'ZZ001' then
            reset role;
            return true;
        when others then
            reset role;
            return false;
    end;
end $$;

select pg_temp.check('FR-09 un editor crea casos de estudio',
    pg_temp.allowed_then_undone('22222222-2222-2222-2222-222222222222',
        $q$insert into public."CaseStudies" (title, category) values ('prueba authz', 'FINANZAS')$q$));

select pg_temp.check('FR-09 un miembro no crea casos de estudio',
    not pg_temp.allowed_then_undone('44444444-4444-4444-4444-444444444444',
        $q$insert into public."CaseStudies" (title, category) values ('prueba authz', 'FINANZAS')$q$));

select pg_temp.check('FR-09 un anonimo no crea casos de estudio',
    not pg_temp.allowed_then_undone(null,
        $q$insert into public."CaseStudies" (title, category) values ('prueba authz', 'FINANZAS')$q$));

select pg_temp.check('FR-09 un miembro no edita casos de estudio',
    pg_temp.count_as('44444444-4444-4444-4444-444444444444',
        $q$with changed as (update public."CaseStudies" set title = title returning 1) select count(*) from changed$q$) = 0);

select pg_temp.check('FR-09 un editor agrega recursos a un caso',
    pg_temp.allowed_then_undone('22222222-2222-2222-2222-222222222222',
        $q$insert into public."CaseStudyResources" (case_study_id, kind, title, link)
           select id, 'APUNTE', 'prueba authz', 'https://example.org' from public."CaseStudies" order by id limit 1$q$));

select pg_temp.check('FR-09 un miembro no borra recursos de casos',
    pg_temp.count_as('44444444-4444-4444-4444-444444444444',
        $q$with gone as (delete from public."CaseStudyResources" returning 1) select count(*) from gone$q$) = 0);

select pg_temp.check('FR-09 un editor sube al bucket documents',
    pg_temp.allowed_then_undone('22222222-2222-2222-2222-222222222222',
        $q$insert into storage.objects (bucket_id, name) values ('documents', 'prueba-authz/editor.pdf')$q$));

select pg_temp.check('FR-09 un miembro no sube al bucket documents',
    not pg_temp.allowed_then_undone('44444444-4444-4444-4444-444444444444',
        $q$insert into storage.objects (bucket_id, name) values ('documents', 'prueba-authz/miembro.pdf')$q$));
