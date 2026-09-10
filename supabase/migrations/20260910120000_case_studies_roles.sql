-- Casos de estudio bajo la misma regla que el resto del contenido.
--
-- Referencias al documento de requisitos: FR-09.
--
-- 20260901120000_case_studies.sql se escribio antes de que existieran los roles
-- y copio el patron de entonces: cualquier sesion autenticada escribe. Cuando
-- 20260905120000_profiles_and_roles.sql reemplazo ese patron, lo hizo en las
-- seis tablas de contenido y en el bucket `images`, pero no en estas dos tablas
-- ni en el bucket `documents`, que no existian en esa rama. Sin esta migracion
-- cualquier miembro podria crear, editar o borrar casos y sus PDF.

-- ============================================================
-- Contenido: solo editores y admins escriben  (FR-09)
-- ============================================================

drop policy if exists "Enable full access for authenticated users" on public."CaseStudies";
drop policy if exists "Enable full access for authenticated users" on public."CaseStudyResources";

create policy "editors_write_case_studies" on public."CaseStudies"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

create policy "editors_write_case_study_resources" on public."CaseStudyResources"
    for all to authenticated
    using (public.can_edit_content()) with check (public.can_edit_content());

-- Las policies de lectura publica ("Enable read access for all users") se
-- quedan como estan: los casos siguen siendo publicos.

-- ============================================================
-- Storage: bucket `documents`  (FR-09)
-- ============================================================

drop policy if exists "Give authenticated users insert access to documents" on storage.objects;
drop policy if exists "Give authenticated users update access to documents" on storage.objects;
drop policy if exists "Give authenticated users delete access to documents" on storage.objects;

create policy "editors_write_documents" on storage.objects
    for all to authenticated
    using (bucket_id = 'documents' and public.can_edit_content())
    with check (bucket_id = 'documents' and public.can_edit_content());

-- "Give all users read access to the documents bucket" se queda: los PDF de los
-- casos se leen sin sesion, igual que las imagenes.
