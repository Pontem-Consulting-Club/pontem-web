-- Perfiles de usuario, roles y cierre de RLS.
--
-- Contexto: hasta esta migracion cualquier cuenta autenticada era administrador
-- total. Todas las policies decian `TO authenticated USING (true)`, asi que una
-- cuenta de marketing podia borrar cualquier proyecto. Esta migracion introduce
-- roles y reescribe cada policy de escritura.
--
-- Referencias al documento de requisitos: FR-01 a FR-11, FR-14, FR-16, FR-31,
-- FR-35.

-- ============================================================
-- Enums
-- ============================================================

create type public.user_role as enum ('admin', 'editor', 'member');
create type public.profile_state as enum ('invited', 'active', 'inactive');

-- ============================================================
-- Tabla profiles  (FR-01)
-- ============================================================

create table public.profiles (
    id            uuid primary key references auth.users (id) on delete cascade,
    role          public.user_role not null default 'member',
    state         public.profile_state not null default 'invited',
    display_name  text not null default '',
    -- El handle se guarda siempre en minusculas (ver public.slugify_handle), asi
    -- que un unique normal ya da unicidad sin distinguir mayusculas y evitamos
    -- depender de la extension citext.
    handle        text unique,
    bio           text,
    avatar_path   text,
    coordination  public."ClubCoordination",
    generation    int,
    is_public     boolean not null default false,
    team_id       bigint references public."Team" (id) on delete set null,
    coach_enabled boolean not null default false,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),

    -- FR-15: un perfil publico necesita handle si o si.
    constraint profiles_public_needs_handle check (not is_public or handle is not null)
);

comment on table public.profiles is
    'Un registro por cuenta de auth.users. Creado por trigger, nunca por la app.';
comment on column public.profiles.coach_enabled is
    'Entitlement del case coach (FR-25). Deliberadamente no es un rol.';

create index profiles_role_idx on public.profiles (role);
create index profiles_public_idx on public.profiles (handle) where is_public;

-- ============================================================
-- updated_at
-- ============================================================

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger profiles_touch_updated_at
    before update on public.profiles
    for each row execute function public.touch_updated_at();

-- ============================================================
-- Handles derivados del nombre  (FR-15)
-- ============================================================

-- unaccent vive en el esquema extensions y no siempre esta instalada, asi que
-- hacemos el plegado de tildes a mano para las que aparecen en castellano.
create function public.unaccent_fallback(source text)
returns text
language sql
immutable
as $$
    select translate(
        coalesce(source, ''),
        'áàäâãÁÀÄÂÃéèëêÉÈËÊíìïîÍÌÏÎóòöôõÓÒÖÔÕúùüûÚÙÜÛñÑçÇ',
        'aaaaaAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUnNcC'
    );
$$;

-- Deriva un slug del nombre visible: minusculas, sin tildes, sin simbolos.
-- 'Jose Ramirez' -> 'jose-ramirez'. No lo elige la persona.
create function public.slugify_handle(source text)
returns text
language sql
immutable
as $$
    select nullif(
        trim(both '-' from
            regexp_replace(
                lower(public.unaccent_fallback(coalesce(source, ''))),
                '[^a-z0-9]+', '-', 'g'
            )
        ),
        ''
    );
$$;

-- Asigna el primer handle libre: jose-ramirez, jose-ramirez-2, jose-ramirez-3...
create function public.claim_handle(source text, for_profile uuid)
returns text
language plpgsql
as $$
declare
    base      text := public.slugify_handle(source);
    candidate text;
    suffix    int := 1;
begin
    if base is null then
        base := 'miembro';
    end if;

    candidate := base;
    loop
        exit when not exists (
            select 1 from public.profiles
             where handle = candidate and id is distinct from for_profile
        );
        suffix := suffix + 1;
        candidate := base || '-' || suffix;
    end loop;

    return candidate;
end;
$$;

-- ============================================================
-- Bootstrap del primer administrador  (FR-31)
-- ============================================================

-- Un solo lugar donde vive la lista. La cuenta institucional del club sobrevive
-- al recambio de coordinadores, por eso es la que arranca como admin.
create function public.bootstrap_admins()
returns text[]
language sql
immutable
as $$
    select array['clubconsultoria.uc@gmail.com'];
$$;

create function public.handle_new_user()
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
        else 'member'::public.user_role
    end;

    name_source := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        split_part(coalesce(new.email, ''), '@', 1)
    );

    insert into public.profiles (id, role, state, display_name, handle)
    values (
        new.id,
        starting_role,
        -- La cuenta institucional la crea una persona a mano en el dashboard,
        -- no llega por invitacion, asi que nace activa. Si naciera 'invited'
        -- auth_role() le devolveria null y el primer admin no podria hacer nada.
        case when starting_role = 'admin' then 'active'::public.profile_state
             else 'invited'::public.profile_state end,
        name_source,
        public.claim_handle(name_source, new.id)
    );

    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Segunda mitad del bootstrap: promueve la cuenta si ya existia antes de esta
-- migracion. Sin esto, crear la cuenta despues del deploy la dejaria en member;
-- sin el trigger de arriba, crearla antes la dejaria igual. Hacen falta las dos.
insert into public.profiles (id, role, state, display_name, handle)
select u.id,
       'admin'::public.user_role,
       'active'::public.profile_state,
       split_part(u.email, '@', 1),
       public.claim_handle(split_part(u.email, '@', 1), u.id)
  from auth.users u
 where lower(u.email) = any (public.bootstrap_admins())
on conflict (id) do update set role = 'admin';

-- Cualquier otra cuenta que ya exista queda como miembro activo: sin esto se
-- quedarian sin fila de perfil y no podrian ni ver su propio /perfil.
insert into public.profiles (id, role, state, display_name, handle)
select u.id,
       'member'::public.user_role,
       'active'::public.profile_state,
       split_part(u.email, '@', 1),
       public.claim_handle(split_part(u.email, '@', 1), u.id)
  from auth.users u
 where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ============================================================
-- Lectura del rol para las policies  (FR-07)
-- ============================================================

-- Ojo: no se puede llamar current_role() porque CURRENT_ROLE es palabra
-- reservada de Postgres.
--
-- SECURITY DEFINER a proposito: la policy de profiles necesita leer profiles y
-- sin esto entraria en recursion infinita.
--
-- Solo devuelve rol si la cuenta esta activa. Es lo que hace que desactivar a
-- alguien (FR-03, ADM-3) le quite los permisos de verdad: si mirara unicamente
-- la columna role, un editor desactivado con la sesion todavia viva seguiria
-- pudiendo escribir contenido.
create function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
    select role from public.profiles where id = auth.uid() and state = 'active';
$$;

create function public.is_admin()
returns boolean
language sql
stable
as $$
    select public.auth_role() = 'admin';
$$;

-- FR-35: el editor no esta acotado por coordinacion. Edita todo el contenido.
create function public.can_edit_content()
returns boolean
language sql
stable
as $$
    select public.auth_role() in ('admin', 'editor');
$$;

-- ============================================================
-- Columnas privilegiadas: nadie se auto-asciende  (FR-10)
-- ============================================================

create function public.profiles_guard_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    actor public.user_role;
begin
    -- service_role (rutas del servidor con la clave secreta) no tiene auth.uid().
    if auth.uid() is null then
        return new;
    end if;

    actor := public.auth_role();

    -- Un miembro puede editar su perfil, pero estas columnas las revertimos.
    if actor is distinct from 'admin' then
        new.role          := old.role;
        new.coach_enabled := old.coach_enabled;
        new.team_id       := old.team_id;
        new.handle        := old.handle;

        -- Unica transicion de estado que hace la propia persona: terminar el
        -- onboarding tras aceptar la invitacion (MEM-1). Reactivarse a si mismo
        -- despues de que un admin la desactive no cuenta.
        if not (new.id = auth.uid()
                and old.state = 'invited'
                and new.state = 'active') then
            new.state := old.state;
        end if;
    end if;

    -- FR-10: ni siquiera un admin se cambia el rol a si mismo.
    if new.id = auth.uid() then
        new.role := old.role;
    end if;

    return new;
end;
$$;

create trigger profiles_guard_privileged_columns
    before update on public.profiles
    for each row execute function public.profiles_guard_privileged_columns();

-- FR-10: el sistema nunca se queda sin administradores activos.
create function public.profiles_require_an_admin()
returns trigger
language plpgsql
as $$
begin
    if not exists (
        select 1 from public.profiles
         where role = 'admin' and state = 'active'
    ) then
        raise exception 'No puedes dejar el sistema sin administradores activos';
    end if;
    return null;
end;
$$;

-- Solo se dispara al degradar o desactivar al ultimo admin, para no estorbar
-- mientras todavia no hay ninguno (bootstrap).
create trigger profiles_require_an_admin_on_update
    after update on public.profiles
    for each row
    when (old.role = 'admin' and old.state = 'active'
          and (new.role <> 'admin' or new.state <> 'active'))
    execute function public.profiles_require_an_admin();

create trigger profiles_require_an_admin_on_delete
    after delete on public.profiles
    for each row
    when (old.role = 'admin' and old.state = 'active')
    execute function public.profiles_require_an_admin();

-- ============================================================
-- RLS de profiles  (FR-14)
-- ============================================================

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
    for select to authenticated
    using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
    for select to authenticated
    using (public.is_admin());

create policy "profiles_update_own" on public.profiles
    for update to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
    for all to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- El anonimo NO recibe policy sobre profiles. Lee los perfiles publicos por la
-- vista de abajo, que expone solo las columnas publicas: si le dieramos policy
-- directa sobre la tabla vería tambien role, state y coach_enabled.
create view public.public_profiles
with (security_invoker = false) as
    select id, handle, display_name, bio, avatar_path, coordination, generation
      from public.profiles
     where is_public and state = 'active';

grant select on public.public_profiles to anon, authenticated;

-- ============================================================
-- Contenido: solo editores y admins escriben  (FR-09)
-- ============================================================

drop policy if exists "Enable full access for authenticated users" on public."Events";
drop policy if exists "Enable full access for authenticated users" on public."Projects";
drop policy if exists "Enable full access for authenticated users" on public."Team";
drop policy if exists "Enable full access for authenticated users" on public."TeamCoordination";
drop policy if exists "Enable full access for authenticated users only" on public."News";
drop policy if exists "Enable full access for authenticated users" on public."HeroSlides";

create policy "editors_write_events" on public."Events"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

create policy "editors_write_projects" on public."Projects"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

create policy "editors_write_team" on public."Team"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

create policy "editors_write_team_coordination" on public."TeamCoordination"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

create policy "editors_write_news" on public."News"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

create policy "editors_write_hero_slides" on public."HeroSlides"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

-- Las policies de lectura publica ("Enable read access for all users") se
-- quedan como estan: el sitio sigue siendo publico.

-- ============================================================
-- Storage  (FR-16)
-- ============================================================

drop policy if exists "Give authenticated users full access 1ffg0oo_1" on storage.objects;
drop policy if exists "Give authenticated users full access 1ffg0oo_2" on storage.objects;
drop policy if exists "Give authenticated users full access 1ffg0oo_3" on storage.objects;

create policy "editors_write_images" on storage.objects
    for all to authenticated
    using (bucket_id = 'images' and public.can_edit_content())
    with check (bucket_id = 'images' and public.can_edit_content());

-- Un miembro sube su foto y nada mas: solo bajo avatars/<su uuid>/.
create policy "members_write_own_avatar" on storage.objects
    for all to authenticated
    using (
        bucket_id = 'images'
        and (storage.foldername(name))[1] = 'avatars'
        and (storage.foldername(name))[2] = auth.uid()::text
    )
    with check (
        bucket_id = 'images'
        and (storage.foldername(name))[1] = 'avatars'
        and (storage.foldername(name))[2] = auth.uid()::text
    );

-- ============================================================
-- Tabla legacy  (FR-04)
-- ============================================================

-- Guardaba id/username/password y no la referenciaba ningun handler. Tenia RLS
-- activo sin policies, asi que estaba inerte, pero seguia teniendo una columna
-- llamada password y grants para anon.
drop table if exists public."Users";

-- ============================================================
-- Grants
-- ============================================================

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant execute on function public.auth_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_edit_content() to authenticated;
grant execute on function public.slugify_handle(text) to authenticated, service_role;
grant execute on function public.claim_handle(text, uuid) to service_role;
