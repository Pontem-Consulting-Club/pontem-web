-- Pruebas del registro abierto (rol usuario) y del progreso en casos de estudio.
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

create or replace function pg_temp.count_as(actor uuid, query text) returns bigint
language plpgsql as $$
declare n bigint;
begin
    perform pg_temp.impersonate(actor);
    execute query into n;
    reset role;
    return n;
end $$;

create or replace function pg_temp.run_as(actor uuid, stmt text) returns void
language plpgsql as $$
begin
    perform pg_temp.impersonate(actor);
    execute stmt;
    reset role;
end $$;

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

-- Idempotencia: limpia lo que haya dejado una corrida anterior. El progreso, el
-- historial y las inscripciones se van en cascada con las cuentas y los casos.
delete from public."Events" where id in (900101, 900102);
delete from public."CaseStudies" where id in (900101, 900102);
delete from public."News" where title = 'usuario hackea' and content is null;
delete from auth.users where id in (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003'
);

-- Dos personas que se registran solas y un miembro invitado.
insert into auth.users (id, email, raw_user_meta_data) values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'ana@ejemplo.cl',   '{"display_name":"Ana"}'::jsonb),
    ('aaaaaaaa-0000-0000-0000-000000000002', 'bruno@ejemplo.cl', '{"display_name":"Bruno"}'::jsonb),
    ('aaaaaaaa-0000-0000-0000-000000000003', 'carla@ejemplo.cl', '{"display_name":"Carla"}'::jsonb);

update public.profiles set role = 'member'
 where id = 'aaaaaaaa-0000-0000-0000-000000000003';

insert into public."CaseStudies" (id, title, category) values
    (900101, 'Caso de prueba A', 'rentabilidad'),
    (900102, 'Caso de prueba B', 'pricing');

insert into public."Events" (id, title, subtitle, date, registration_mode) values
    (900101, 'Evento abierto de prueba', 'prueba', now() + interval '30 days', 'open'),
    (900102, 'Evento interno de prueba', 'prueba', now() + interval '30 days', 'members_only');

-- ============================================================
-- 1. Registro abierto: rol usuario
-- ============================================================

select pg_temp.check('la cuenta registrada arranca como usuario activo',
    (select role = 'usuario' and state = 'active' from public.profiles
      where id = 'aaaaaaaa-0000-0000-0000-000000000001'));

select pg_temp.check('un usuario no escribe contenido',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000001',
        $q$insert into public."News" (title, published_date) values ('usuario hackea', now())$q$));

select pg_temp.run_as('aaaaaaaa-0000-0000-0000-000000000001',
    $q$update public.profiles set role = 'admin' where id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$);
select pg_temp.check('un usuario no se auto-asciende',
    (select role from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001') = 'usuario');

update public.profiles set is_public = true, bio = 'hola'
 where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select pg_temp.check('un usuario no aparece en los perfiles publicos aunque marque is_public',
    pg_temp.count_as(null,
        $q$select count(*) from public.public_profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$) = 0);

-- ============================================================
-- 2. Inscripciones de un usuario
-- ============================================================

select pg_temp.check('un usuario se inscribe en un evento abierto',
    not pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000001',
        $q$insert into public.event_registrations (event_id, profile_id)
           values (900101, 'aaaaaaaa-0000-0000-0000-000000000001')$q$));

select pg_temp.check('un usuario no se inscribe en un evento solo miembros',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000001',
        $q$insert into public.event_registrations (event_id, profile_id)
           values (900102, 'aaaaaaaa-0000-0000-0000-000000000001')$q$));

select pg_temp.check('un miembro si se inscribe en un evento solo miembros',
    not pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000003',
        $q$insert into public.event_registrations (event_id, profile_id)
           values (900102, 'aaaaaaaa-0000-0000-0000-000000000003')$q$));

-- ============================================================
-- 3. Progreso propio
-- ============================================================

select pg_temp.check('un usuario guarda su progreso',
    not pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000001',
        $q$insert into public.case_study_progress (profile_id, case_study_id, status, notes)
           values ('aaaaaaaa-0000-0000-0000-000000000001', 900101, 'en-progreso', 'mis notas')$q$));

select pg_temp.check('nadie guarda progreso a nombre de otra persona',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000002',
        $q$insert into public.case_study_progress (profile_id, case_study_id, status)
           values ('aaaaaaaa-0000-0000-0000-000000000001', 900102, 'completado')$q$));

select pg_temp.check('nadie lee el progreso de otra persona',
    pg_temp.count_as('aaaaaaaa-0000-0000-0000-000000000002',
        $q$select count(*) from public.case_study_progress
            where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$) = 0);

select pg_temp.check('un miembro tampoco lee notas ajenas',
    pg_temp.count_as('aaaaaaaa-0000-0000-0000-000000000003',
        $q$select count(*) from public.case_study_progress
            where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$) = 0);

select pg_temp.check('el anonimo no tiene progreso',
    pg_temp.denied(null,
        $q$select count(*) from public.case_study_progress$q$));

select pg_temp.check('el cambio de estado queda fechado',
    (select status_changed_at is not null and completed_at is null from public.case_study_progress
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101));

select pg_temp.run_as('aaaaaaaa-0000-0000-0000-000000000001',
    $q$update public.case_study_progress set status = 'completado', self_rating = 4,
            completed_at = '2000-01-01'
        where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101$q$);

select pg_temp.check('completado lo fecha la base, no el cliente',
    (select completed_at > now() - interval '1 minute' from public.case_study_progress
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101));

select pg_temp.run_as('aaaaaaaa-0000-0000-0000-000000000001',
    $q$update public.case_study_progress set status = 'revisado'
        where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101$q$);

select pg_temp.check('revisado conserva cuando lo completo',
    (select completed_at is not null from public.case_study_progress
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101));

select pg_temp.check('el check limita la autoevaluacion a 1-5',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000001',
        $q$update public.case_study_progress set self_rating = 9
            where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101$q$));

-- ============================================================
-- 4. Historial
-- ============================================================

select pg_temp.check('el historial anota cada cambio de estado',
    (select count(*) from public.case_study_activity
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101
        and kind = 'estado') = 3);

select pg_temp.check('el historial anota la autoevaluacion',
    (select count(*) from public.case_study_activity
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001' and case_study_id = 900101
        and kind = 'autoevaluacion' and self_rating = 4) = 1);

select pg_temp.check('nadie se escribe el historial a mano',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000001',
        $q$insert into public.case_study_activity (profile_id, case_study_id, kind)
           values ('aaaaaaaa-0000-0000-0000-000000000001', 900101, 'visita')$q$));

select pg_temp.check('cada quien ve solo su historial',
    pg_temp.count_as('aaaaaaaa-0000-0000-0000-000000000002',
        $q$select count(*) from public.case_study_activity
            where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$) = 0);

-- ============================================================
-- 5. Visitas
-- ============================================================

select pg_temp.run_as('aaaaaaaa-0000-0000-0000-000000000002',
    $q$select public.record_case_view(900102)$q$);
select pg_temp.run_as('aaaaaaaa-0000-0000-0000-000000000002',
    $q$select public.record_case_view(900102)$q$);

select pg_temp.check('recargar el caso no cuenta como otra visita',
    (select view_count = 1 and first_viewed_at is not null and last_viewed_at is not null
       from public.case_study_progress
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000002' and case_study_id = 900102));

select pg_temp.check('una visita sin estado no inventa un estado',
    (select status is null from public.case_study_progress
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000002' and case_study_id = 900102));

update public.case_study_progress set last_viewed_at = now() - interval '2 hours'
 where profile_id = 'aaaaaaaa-0000-0000-0000-000000000002' and case_study_id = 900102;
select pg_temp.run_as('aaaaaaaa-0000-0000-0000-000000000002',
    $q$select public.record_case_view(900102)$q$);

select pg_temp.check('despues de 30 minutos si cuenta como visita nueva',
    (select view_count = 2 from public.case_study_progress
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000002' and case_study_id = 900102));

select pg_temp.check('cada visita contada queda en el historial',
    (select count(*) from public.case_study_activity
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000002' and kind = 'visita') = 2);

select pg_temp.check('el anonimo no anota visitas',
    pg_temp.denied(null, $q$select public.record_case_view(900102)$q$));

select pg_temp.check('no se anotan visitas a casos que no existen',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000002', $q$select public.record_case_view(-1)$q$));

-- ============================================================
-- 6. Cuenta desactivada
-- ============================================================

update public.profiles set state = 'inactive'
 where id = 'aaaaaaaa-0000-0000-0000-000000000002';

select pg_temp.check('una cuenta desactivada no guarda progreso',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000002',
        $q$insert into public.case_study_progress (profile_id, case_study_id, status)
           values ('aaaaaaaa-0000-0000-0000-000000000002', 900101, 'pendiente')$q$));

select pg_temp.check('una cuenta desactivada no anota visitas',
    pg_temp.denied('aaaaaaaa-0000-0000-0000-000000000002', $q$select public.record_case_view(900101)$q$));

select pg_temp.check('una cuenta desactivada sigue viendo su progreso',
    pg_temp.count_as('aaaaaaaa-0000-0000-0000-000000000002',
        $q$select count(*) from public.case_study_progress
            where profile_id = 'aaaaaaaa-0000-0000-0000-000000000002'$q$) = 1);

-- ============================================================
-- 7. Borrar el caso se lleva su progreso
-- ============================================================

delete from public."CaseStudies" where id = 900101;

select pg_temp.check('borrar un caso borra el progreso y el historial asociados',
    (select count(*) from public.case_study_progress where case_study_id = 900101) = 0
    and (select count(*) from public.case_study_activity where case_study_id = 900101) = 0);

-- Limpieza final.
delete from public."Events" where id in (900101, 900102);
delete from public."CaseStudies" where id in (900101, 900102);
delete from auth.users where id in (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003'
);
