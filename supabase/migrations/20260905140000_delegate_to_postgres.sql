-- Mueve a Postgres lo que estaba resuelto en codigo de la aplicacion.
--
-- Tres cosas cambian de sitio:
--   1. El alta de invitados deja de necesitar la clave de servicio en una ruta
--      publica: pasa a ser una funcion SECURITY DEFINER que puede llamar `anon`.
--   2. El limite de ritmo deja de vivir en la memoria del proceso (inservible en
--      serverless, donde cada instancia tiene su propio contador) y pasa a una
--      tabla.
--   3. El directorio de personas y las estadisticas propias dejan de armarse en
--      JavaScript.

-- ============================================================
-- 1. Limite de ritmo con estado compartido
-- ============================================================

create table public.rate_limit_hits (
    bucket       text not null,
    actor        text not null,
    window_start timestamptz not null,
    hits         int not null default 1,
    primary key (bucket, actor, window_start)
);

comment on table public.rate_limit_hits is
    'Contadores por ventana. Reemplaza al Map en memoria del servidor, que en '
    'serverless no servia de nada porque cada instancia contaba por su cuenta.';

alter table public.rate_limit_hits enable row level security;
-- Sin policies: solo se toca desde funciones SECURITY DEFINER.

/**
 * Suma un intento y dice si todavia esta dentro del limite.
 *
 * La ventana es fija (no deslizante): se redondea el instante actual al tamano
 * de la ventana. Es menos preciso que una ventana deslizante y muchisimo mas
 * barato, que es lo que corresponde aqui.
 */
create function public.rate_limit_allows(
    p_bucket text,
    p_actor  text,
    p_limit  int,
    p_window interval
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    ventana   timestamptz;
    segundos  numeric := extract(epoch from p_window);
    acumulado int;
begin
    ventana := to_timestamp(floor(extract(epoch from now()) / segundos) * segundos);

    insert into public.rate_limit_hits (bucket, actor, window_start, hits)
    values (p_bucket, p_actor, ventana, 1)
    on conflict (bucket, actor, window_start)
        do update set hits = public.rate_limit_hits.hits + 1
    returning hits into acumulado;

    -- Limpieza ocasional: barrer en cada llamada seria caro y no hace falta.
    if random() < 0.01 then
        delete from public.rate_limit_hits where window_start < now() - (p_window * 5);
    end if;

    return acumulado <= p_limit;
end;
$$;

-- ============================================================
-- 2. Alta de invitados sin clave de servicio  (FR-33, VIS-3)
-- ============================================================

/**
 * Inscribe a una persona sin cuenta en un evento abierto.
 *
 * Es SECURITY DEFINER y la puede llamar `anon`: asi la ruta del servidor deja de
 * usar la clave de servicio en un camino que alcanza cualquier visitante. Toda
 * la validacion vive aqui dentro, en el mismo sitio que los constraints, en vez
 * de repartida entre la ruta y las policies.
 *
 * Devuelve un codigo en vez de lanzar excepciones para los casos previstos, y no
 * es por gusto: una excepcion aborta toda la llamada, incluido el incremento del
 * contador de ritmo. Si esto lanzara, el limitador contaria solo las
 * inscripciones que salen bien y dejaria pasar los intentos fallidos sin contar,
 * que es justo lo contrario de lo que sirve. El insert va dentro de un bloque
 * con EXCEPTION, que crea una subtransaccion: al fallar se deshace el insert,
 * pero el contador ya escrito antes sobrevive.
 *
 * `p_source` es para el limite de ritmo: la ruta pasa la IP, que Postgres no
 * puede ver por su cuenta. Quien llamara a la funcion directamente podria
 * inventarse ese valor, y por eso hay ademas un limite por correo, que no se
 * puede esquivar sin cambiar de correo en cada intento.
 */
create function public.register_guest(
    p_event_id int,
    p_name     text,
    p_email    text,
    p_source   text default 'desconocida'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    evento    record;
    correo    text := lower(trim(p_email));
    nombre    text := trim(p_name);
    revividas int;
begin
    -- El limite por origen va PRIMERO, antes de validar el formato: si fuera al
    -- reves, un bot mandando basura saldria por el return temprano sin gastar
    -- presupuesto y podria repetir sin freno.
    if not public.rate_limit_allows('guest-ip', p_source, 30, interval '10 minutes') then
        return 'limite';
    end if;

    if nombre is null or nombre = '' then
        return 'falta_nombre';
    end if;

    if correo is null or correo !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
        return 'correo_invalido';
    end if;

    -- Un correo concreto no puede intentarlo sin parar, venga de donde venga.
    if not public.rate_limit_allows('guest-email', correo, 5, interval '1 hour') then
        return 'limite';
    end if;

    select id, date, registration_mode, registration_open
      into evento
      from public."Events"
     where id = p_event_id;

    if not found then
        return 'no_existe';
    end if;

    if evento.registration_mode <> 'open' then
        return 'sin_invitados';
    end if;

    if not evento.registration_open then
        return 'cerrado';
    end if;

    if evento.date is not null and evento.date <= now() then
        return 'ya_paso';
    end if;

    -- Reactiva una baja previa en vez de rechazarla por duplicada: el indice
    -- unico no distingue el estado (FR-19).
    update public.event_registrations
       set status = 'registered', guest_name = nombre
     where event_id = p_event_id
       and lower(guest_email) = correo
       and status = 'cancelled';

    get diagnostics revividas = row_count;
    if revividas > 0 then
        return 'ok';
    end if;

    begin
        insert into public.event_registrations (event_id, guest_name, guest_email)
        values (p_event_id, nombre, correo);
    exception
        when unique_violation then
            return 'ya_inscrito';
        when others then
            -- El trigger de cupo levanta check_violation con su propio mensaje.
            if sqlerrm like '%cupos disponibles%' then
                return 'sin_cupo';
            end if;
            raise;
    end;

    return 'ok';
end;
$$;

grant execute on function public.register_guest(int, text, text, text) to anon, authenticated;

-- ============================================================
-- 3. Directorio de personas  (ADM-4)
-- ============================================================

/**
 * Perfiles con su correo, que vive en auth.users y no en profiles.
 *
 * SECURITY DEFINER para poder leer auth.users, pero comprueba `is_admin()` antes
 * de devolver nada: la autorizacion se queda en SQL en vez de depender de que la
 * ruta se acuerde de mirar. Asi la clave de servicio sale tambien de aqui.
 */
create function public.admin_user_directory()
returns table (
    id              uuid,
    role            public.user_role,
    state           public.profile_state,
    display_name    text,
    handle          text,
    bio             text,
    avatar_path     text,
    coordination    public."ClubCoordination",
    generation      int,
    is_public       boolean,
    team_id         bigint,
    coach_enabled   boolean,
    created_at      timestamptz,
    updated_at      timestamptz,
    email           text,
    last_sign_in_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'No tienes acceso a esta seccion' using errcode = 'insufficient_privilege';
    end if;

    return query
        select p.id, p.role, p.state, p.display_name, p.handle, p.bio, p.avatar_path,
               p.coordination, p.generation, p.is_public, p.team_id, p.coach_enabled,
               p.created_at, p.updated_at,
               u.email::text, u.last_sign_in_at
          from public.profiles p
          join auth.users u on u.id = p.id
         order by p.created_at;
end;
$$;

grant execute on function public.admin_user_directory() to authenticated;

-- ============================================================
-- 4. Estadisticas propias  (MEM-5, FR-22)
-- ============================================================

-- security_invoker: la vista se mira con los permisos de quien pregunta, asi que
-- RLS ya limita cada quien a sus propias filas y el group by devuelve una sola.
-- Los numeros se calculan al leer, sin contadores que se desincronicen.
create view public.my_registration_stats
with (security_invoker = true) as
    select
        r.profile_id,
        count(*) filter (where r.status = 'registered')                    as registered,
        count(*) filter (where r.attended)                                 as attended,
        count(*) filter (where r.status = 'cancelled')                     as cancelled,
        count(*) filter (where r.status = 'registered'
                           and e.date is not null and e.date > now())      as upcoming
      from public.event_registrations r
      left join public."Events" e on e.id = r.event_id
     group by r.profile_id;

grant select on public.my_registration_stats to authenticated;

-- ============================================================
-- 5. Aviso de inscripcion por correo  (VIS-3)
-- ============================================================

-- Los correos los manda una Edge Function, avisada por este webhook. Postgres no
-- habla SMTP, y meter pg_net aqui ataria el commit de la inscripcion a que un
-- servidor de correo responda.
--
-- El webhook se crea desde el panel de Supabase (Database > Webhooks) o con
-- pg_net si esta disponible; queda documentado en supabase/functions/README.md
-- porque necesita la URL y la clave del proyecto, que no viven en el repo.
