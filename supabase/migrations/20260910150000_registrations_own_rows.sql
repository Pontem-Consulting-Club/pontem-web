-- Lo que un miembro puede hacer con sus propias inscripciones (FR-19, FR-21, FR-03).
--
-- Antes, `registrations_update_own` dejaba a un miembro cambiar cualquier columna
-- de su fila desde el cliente: marcarse la asistencia, mover la inscripcion a un
-- evento cerrado o pasado saltandose las reglas del insert, o reactivarla. Y ni
-- el insert ni el update miraban si la cuenta seguia activa.

-- Inscribirse: igual que antes, y ademas con la cuenta activa. `auth_role()` es
-- null para cuentas invitadas o desactivadas, igual que `can()` en la app.
drop policy "registrations_insert_own" on public.event_registrations;

create policy "registrations_insert_own" on public.event_registrations
    for insert to authenticated
    with check (
        profile_id = auth.uid()
        and public.auth_role() is not null
        and exists (
            select 1 from public."Events" e
             where e.id = event_id
               and e.registration_mode in ('members_only', 'open')
               and e.registration_open
               and (e.date is null or e.date > now())
        )
    );

-- Cancelar lo propio siempre se puede, incluso con la cuenta desactivada.
-- Volver a inscribirse (una fila cancelada que pasa a registered) exige lo mismo
-- que inscribirse por primera vez.
drop policy "registrations_update_own" on public.event_registrations;

create policy "registrations_update_own" on public.event_registrations
    for update to authenticated
    using (profile_id = auth.uid())
    with check (
        profile_id = auth.uid()
        and (
            status = 'cancelled'
            or (
                public.auth_role() is not null
                and exists (
                    select 1 from public."Events" e
                     where e.id = event_id
                       and e.registration_mode in ('members_only', 'open')
                       and e.registration_open
                       and (e.date is null or e.date > now())
                )
            )
        )
    );

-- Una policy no puede comparar la fila vieja con la nueva, asi que las columnas
-- las cuida un trigger: fuera del staff, en una fila propia solo cambia `status`.
create function public.event_registrations_guard_own_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    -- service_role (rutas del servidor con la clave secreta) no tiene auth.uid(),
    -- y el staff pasa lista con `attended` (FR-21).
    if auth.uid() is null or public.can_edit_content() then
        return new;
    end if;

    if new.id is distinct from old.id
       or new.event_id is distinct from old.event_id
       or new.profile_id is distinct from old.profile_id
       or new.guest_name is distinct from old.guest_name
       or new.guest_email is distinct from old.guest_email
       or new.attended is distinct from old.attended
       or new.registered_at is distinct from old.registered_at then
        raise exception 'Solo puedes cambiar el estado de tu inscripcion'
            using errcode = 'insufficient_privilege';
    end if;

    return new;
end;
$$;

create trigger event_registrations_guard_own_columns
    before update on public.event_registrations
    for each row execute function public.event_registrations_guard_own_columns();
