-- El bucket "images" existía sólo en el proyecto de producción (creado desde el dashboard).
-- Se declara acá para que cualquier proyecto (canary, local) quede igual.
-- Las policies de storage.objects ya vienen en 20260402214814_remote_schema.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 52428800, array['image/*'])
on conflict (id) do nothing;
