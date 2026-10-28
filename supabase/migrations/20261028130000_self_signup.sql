-- Registro abierto: cualquiera crea su cuenta y entra como 'usuario'.
--
-- Hasta aqui solo se entraba por invitacion, y el trigger de alta creaba a
-- todos como `member`. Con el registro abierto eso le daria a cualquier persona
-- del publico lo que hoy tiene un miembro del club, asi que el rol de partida
-- pasa a ser 'usuario' y la invitacion asigna el rol de verdad (ver
-- server/api/admin/users/invite.post.ts).
--
-- Nada se borra: se reemplaza la funcion del trigger, se reemplaza la vista de
-- perfiles publicos con las mismas columnas y se agregan policies restrictivas
-- encima de las que ya existian.

-- ============================================================
-- Alta de cuentas
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    starting_role public.user_role;
    name_source   text;
begin
    starting_role := case
        when lower(new.email) = any (public.bootstrap_admins()) then 'admin'::public.user_role
        else 'usuario'::public.user_role
    end;

    name_source := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        split_part(coalesce(new.email, ''), '@', 1)
    );

    -- Nace activa: quien se registra ya confirmo su correo antes de poder entrar,
    -- y no tiene onboarding que terminar. La invitacion la deja en 'invited'
    -- despues, igual que antes. El rol nunca sale de raw_user_meta_data: ese
    -- campo lo escribe la propia persona al registrarse.
    insert into public.profiles (id, role, state, display_name, handle)
    values (
        new.id,
        starting_role,
        'active'::public.profile_state,
        name_source,
        public.claim_handle(name_source, new.id)
    );

    return new;
end;
$$;

-- ============================================================
-- Inscripciones: un 'usuario' solo entra a eventos abiertos
-- ============================================================

-- Las policies permisivas de 20260910150000_registrations_own_rows.sql solo
-- piden una cuenta activa. Estas son restrictivas: se suman con AND a aquellas,
-- asi que no hay que tocarlas. Para el resto de los roles no cambian nada.
create policy "registrations_usuario_open_only_insert" on public.event_registrations
    as restrictive
    for insert to authenticated
    with check (
        public.auth_role() is distinct from 'usuario'
        or exists (
            select 1 from public."Events" e
             where e.id = event_id
               and e.registration_mode = 'open'
        )
    );

create policy "registrations_usuario_open_only_update" on public.event_registrations
    as restrictive
    for update to authenticated
    using (true)
    with check (
        public.auth_role() is distinct from 'usuario'
        or status = 'cancelled'
        or exists (
            select 1 from public."Events" e
             where e.id = event_id
               and e.registration_mode = 'open'
        )
    );

-- ============================================================
-- Perfiles publicos: solo del club
-- ============================================================

-- /miembros/<handle> es el directorio del club. Un 'usuario' no aparece aunque
-- marque is_public; la ruta PUT /api/profile ademas se lo deja en false.
create or replace view public.public_profiles
with (security_invoker = false) as
    select id, handle, display_name, bio, avatar_path, coordination, generation
      from public.profiles
     where is_public and state = 'active' and role <> 'usuario';
