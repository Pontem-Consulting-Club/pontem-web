-- Reconstructed from the live schema of the production project (equfcqojbefvynuppxoq):
-- these two columns exist in prod/Projects already (used by the `develop` branch code)
-- but were never captured as a migration in this repo. Confirmed via PostgREST OpenAPI
-- introspection on 2026-07-17.

ALTER TABLE "public"."Projects"
    ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."Projects"
    ADD COLUMN IF NOT EXISTS "semester" "text";
