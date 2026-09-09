-- Pruebas de las inscripciones a eventos: cupo, unicidad y coherencia de filas.
-- Lo que se comprueba aqui vive en la base (constraints y triggers) y no en las
-- rutas, porque son justo las reglas que dos peticiones simultaneas romperian si
-- se comprobaran en el servidor.

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

create or replace function pg_temp.rejects(stmt text) returns boolean
language plpgsql as $$
begin
    execute stmt;
    return false;
exception when others then
    return true;
end $$;

-- Idempotencia: limpia lo que haya dejado una corrida anterior.
delete from public."Events" where id in (900001, 900002);

-- Evento de prueba con cupo para dos.
insert into public."Events" (id, title, subtitle, date, registration_mode, capacity)
values (900001, 'Evento con cupo', 'prueba', now() + interval '30 days', 'open', 2);

insert into public."Events" (id, title, subtitle, date, registration_mode)
values (900002, 'Evento sin cupo', 'prueba', now() + interval '30 days', 'open');

-- ============================================================
-- Coherencia de la fila (FR-33)
-- ============================================================

select pg_temp.check('una fila no puede ser de miembro y de invitado a la vez',
    pg_temp.rejects($q$
        insert into public.event_registrations (event_id, profile_id, guest_name, guest_email)
        select 900002, id, 'Doble', 'doble@example.org' from public.profiles limit 1
    $q$));

select pg_temp.check('una fila no puede ser de nadie',
    pg_temp.rejects($q$
        insert into public.event_registrations (event_id) values (900002)
    $q$));

select pg_temp.check('un invitado sin nombre es rechazado',
    pg_temp.rejects($q$
        insert into public.event_registrations (event_id, guest_email)
        values (900002, 'sin-nombre@example.org')
    $q$));

-- ============================================================
-- Unicidad (FR-18, FR-33)
-- ============================================================

insert into public.event_registrations (event_id, guest_name, guest_email)
values (900002, 'Ana Fuentes', 'ana@example.org');

select pg_temp.check('FR-33 el mismo correo de invitado no se repite en un evento',
    pg_temp.rejects($q$
        insert into public.event_registrations (event_id, guest_name, guest_email)
        values (900002, 'Ana Otra Vez', 'ana@example.org')
    $q$));

select pg_temp.check('FR-33 la unicidad de invitado no distingue mayusculas',
    pg_temp.rejects($q$
        insert into public.event_registrations (event_id, guest_name, guest_email)
        values (900002, 'Ana Mayuscula', 'ANA@example.org')
    $q$));

select pg_temp.check('el mismo correo si puede ir a otro evento',
    not pg_temp.rejects($q$
        insert into public.event_registrations (event_id, guest_name, guest_email)
        values (900001, 'Ana Fuentes', 'ana@example.org')
    $q$));

-- ============================================================
-- Cupo (FR-20)
-- ============================================================

-- El evento 900001 tiene cupo 2 y ya lleva 1.
insert into public.event_registrations (event_id, guest_name, guest_email)
values (900001, 'Beto Salas', 'beto@example.org');

select pg_temp.check('FR-20 el evento se llena al alcanzar el cupo',
    pg_temp.rejects($q$
        insert into public.event_registrations (event_id, guest_name, guest_email)
        values (900001, 'Carla Diaz', 'carla@example.org')
    $q$));

-- Cancelar libera un cupo: la cuenta mira solo las inscripciones vigentes.
update public.event_registrations
   set status = 'cancelled'
 where event_id = 900001 and guest_email = 'beto@example.org';

select pg_temp.check('FR-19 cancelar libera el cupo',
    not pg_temp.rejects($q$
        insert into public.event_registrations (event_id, guest_name, guest_email)
        values (900001, 'Carla Diaz', 'carla@example.org')
    $q$));

select pg_temp.check('sin cupo declarado no hay limite',
    not pg_temp.rejects($q$
        insert into public.event_registrations (event_id, guest_name, guest_email)
        values (900002, 'Dario Rojas', 'dario@example.org')
    $q$));


-- ============================================================
-- Limite de ritmo (FR-33)
-- ============================================================

delete from public.rate_limit_hits where actor like '%prueba-ritmo%';

-- Lo que importa: los intentos FALLIDOS tambien cuentan. Cuando register_guest
-- lanzaba una excepcion para estos casos, la excepcion deshacia tambien el
-- incremento del contador y el limitador solo contaba los exitos, justo al reves
-- de lo que sirve.
select public.register_guest(900001, '', 'prueba-ritmo@example.org', 'ip-de-prueba');
select public.register_guest(900001, '', 'prueba-ritmo@example.org', 'ip-de-prueba');
select public.register_guest(900001, 'Sin Correo', 'no-es-correo', 'ip-de-prueba');

select pg_temp.check('FR-33 los intentos fallidos si suman al limite',
    (select coalesce(sum(hits), 0) from public.rate_limit_hits
      where actor = 'ip-de-prueba') >= 3);

-- El codigo de salida describe el motivo en vez de reventar.
select pg_temp.check('register_guest devuelve codigo y no excepcion',
    public.register_guest(900001, '', 'x@example.org', 'ip-de-prueba') = 'falta_nombre');

select pg_temp.check('un evento inexistente devuelve su codigo',
    public.register_guest(999999, 'Ana', 'ana-inexistente@example.org', 'ip-de-prueba') = 'no_existe');

delete from public.rate_limit_hits where actor like '%prueba%' or actor = 'ip-de-prueba';

-- ============================================================
-- Borrado en cascada
-- ============================================================

delete from public."Events" where id in (900001, 900002);

select pg_temp.check('borrar un evento se lleva sus inscripciones',
    (select count(*) from public.event_registrations where event_id in (900001, 900002)) = 0);
