-- Foto del banner de cada seccion publica, elegida por editores desde el sitio.
-- Sin foto (image_path null), la pagina usa su foto por defecto, la que esta en el
-- codigo (shared/pageBanners.ts). Las filas se crean aqui y despues solo se editan.

create table public.page_banners (
    page text primary key
        check (page in ('consultoria-social', 'eventos', 'noticias', 'material-estudio', 'nosotros')),
    -- Key del bucket `images` (banners/<uuid>.<ext>).
    image_path text,
    updated_at timestamptz not null default now()
);

comment on table public.page_banners is
    'Foto del banner de cada seccion publica; null = la foto por defecto del codigo.';

insert into public.page_banners (page) values
    ('consultoria-social'), ('eventos'), ('noticias'), ('material-estudio'), ('nosotros');

alter table public.page_banners enable row level security;

create policy "page_banners_read_all" on public.page_banners
    for select using (true);

create policy "editors_update_page_banners" on public.page_banners
    for update to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());
