-- Lista de inscritos con nombre para quien organiza (FR-21, EDI-2).
--
-- La ruta leia event_registrations con un join a profiles, pero las policies de
-- profiles solo dejan ver la fila propia (y todas a admins): a un editor el
-- join le llegaba vacio y la lista mostraba "Sin nombre" en cada miembro.
--
-- Abrir profiles a editores les dejaria ver tambien la bio, el rol, el estado y
-- el entitlement del coach de todas las cuentas. Esta funcion entrega solo lo
-- que la lista necesita, y solo a quien puede leer inscripciones.

create function public.event_registration_roster(p_event_id bigint)
returns table (
    id            bigint,
    status        public.registration_status,
    attended      boolean,
    registered_at timestamptz,
    is_guest      boolean,
    name          text,
    detail        text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    -- registrations.read: admins y editores (misma regla que registrations_select_staff).
    if not public.can_edit_content() then
        raise exception 'No tienes acceso a esta seccion' using errcode = 'insufficient_privilege';
    end if;

    return query
        select r.id::bigint,
               r.status,
               r.attended,
               r.registered_at::timestamptz,
               r.profile_id is null,
               case when r.profile_id is null then coalesce(r.guest_name, 'Invitado')
                    else coalesce(nullif(p.display_name, ''), 'Sin nombre') end,
               case when r.profile_id is null then r.guest_email::text
                    else p.coordination::text end
          from public.event_registrations r
          left join public.profiles p on p.id = r.profile_id
         where r.event_id = p_event_id
         order by r.registered_at;
end;
$$;

revoke all on function public.event_registration_roster(bigint) from public, anon;
grant execute on function public.event_registration_roster(bigint) to authenticated;
