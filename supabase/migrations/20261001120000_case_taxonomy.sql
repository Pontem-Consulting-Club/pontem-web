-- Taxonomia de casos MBB: 11 categorias excluyentes definidas por la pregunta del
-- cliente, y dificultad en tres niveles (L1-L3). Los slugs viven aqui y los
-- nombres visibles en app/constants/caseStudies.ts, para renombrar sin migrar.
--
-- Los casebooks no son un caso sino una coleccion: quedan sin categoria ni
-- dificultad, y la pagina los muestra en su propia pestana.

-- ------------------------------------------------------------------ categoria
create type "public"."CaseCategory_v2" as enum (
    'rentabilidad',
    'crecimiento-ingresos',
    'entrada-mercado',
    'ma-inversion',
    'pricing',
    'operaciones-supply-chain',
    'estrategia-competitiva',
    'organizacion-transformacion',
    'sector-publico-impacto',
    'estimacion',
    'no-convencional'
);

alter table "public"."CaseStudies" alter column "category" drop not null;

-- Equivalencia gruesa para filas que no esten en la lista de abajo (casos
-- creados desde el formulario): no hay forma de inferir la pregunta del cliente.
alter table "public"."CaseStudies"
    alter column "category" type "public"."CaseCategory_v2"
    using (case "category"::text
        when 'ESTRATEGIA'     then 'crecimiento-ingresos'
        when 'MARKETING'      then 'crecimiento-ingresos'
        when 'OPERACIONES'    then 'operaciones-supply-chain'
        when 'FINANZAS'       then 'ma-inversion'
        when 'IMPACTO_SOCIAL' then 'sector-publico-impacto'
    end)::"public"."CaseCategory_v2";

drop type "public"."CaseCategory";
alter type "public"."CaseCategory_v2" rename to "CaseCategory";

comment on type "public"."CaseCategory" is 'Categoria del caso segun la pregunta del cliente (taxonomia MBB); null en los casebooks';

-- ------------------------------------------------------------------ dificultad
create type "public"."CaseDifficulty_v2" as enum (
    'l1-introductorio',
    'l2-intermedio',
    'l3-avanzado'
);

alter table "public"."CaseStudies"
    alter column "difficulty" type "public"."CaseDifficulty_v2"
    using (case "difficulty"::text
        when 'FACIL'   then 'l1-introductorio'
        when 'MEDIO'   then 'l2-intermedio'
        when 'DIFICIL' then 'l3-avanzado'
        when 'EXPERTO' then 'l3-avanzado'
    end)::"public"."CaseDifficulty_v2";

drop type "public"."CaseDifficulty";
alter type "public"."CaseDifficulty_v2" rename to "CaseDifficulty";

comment on type "public"."CaseDifficulty" is 'Nivel del caso: se define por el criterio mas alto que cumple, no por promedio';

-- ---------------------------------------------- clasificacion de la biblioteca
-- Regla de desempate de la taxonomia, en orden: estimacion, ma-inversion,
-- entrada-mercado, rentabilidad, estrategia-competitiva, pricing, operaciones,
-- organizacion, sector publico y, si nada calza, crecimiento-ingresos.
update "public"."CaseStudies" c
set "category" = v."category"::"public"."CaseCategory",
    "difficulty" = v."difficulty"::"public"."CaseDifficulty"
from (values
    -- Casebook Pontem
    ('/casos/pontem-galletafina.pdf',            'crecimiento-ingresos',     'l2-intermedio'),
    ('/casos/pontem-ropalemu.pdf',               'crecimiento-ingresos',     'l2-intermedio'),
    ('/casos/pontem-iglass.pdf',                 'crecimiento-ingresos',     'l2-intermedio'),
    ('/casos/pontem-applianceco.pdf',            'ma-inversion',             'l2-intermedio'),
    ('/casos/pontem-estacion-de-servicio.pdf',   'crecimiento-ingresos',     'l2-intermedio'),
    ('/casos/pontem-alimentos-supermercado.pdf', 'rentabilidad',             'l2-intermedio'),
    ('/casos/pontem-gymco.pdf',                  'rentabilidad',             'l2-intermedio'),
    ('/casos/pontem-aseo-hotel.pdf',             'operaciones-supply-chain', 'l2-intermedio'),
    ('/casos/pontem-logistica.pdf',              'ma-inversion',             'l2-intermedio'),
    ('/casos/pontem-latinpharma.pdf',            'ma-inversion',             'l3-avanzado'),
    ('/casos/pontem-gas-envasado.pdf',           'estrategia-competitiva',   'l3-avanzado'),
    ('/casos/pontem-autos-de-lujo.pdf',          'entrada-mercado',          'l2-intermedio'),
    -- Casos sueltos
    ('/casos/bain-old-winery.pdf',               'crecimiento-ingresos',     'l2-intermedio'),
    ('/casos/bain-asian-lubricants.pdf',         'entrada-mercado',          'l1-introductorio'),
    ('/casos/universal-airlines.pdf',            'entrada-mercado',          'l3-avanzado'),
    ('/casos/cornell-franks-cheese.pdf',         'rentabilidad',             'l1-introductorio'),
    ('/casos/cornell-hammerjack.pdf',            'rentabilidad',             'l2-intermedio'),
    ('/casos/cornell-scan-air.pdf',              'rentabilidad',             'l2-intermedio'),
    ('/casos/kellogg-rock-energy.pdf',           'ma-inversion',             'l2-intermedio'),
    ('/casos/kellogg-wine-and-co.pdf',           'crecimiento-ingresos',     'l3-avanzado'),
    ('/casos/kellogg-zoo-co.pdf',                'ma-inversion',             'l3-avanzado'),
    ('/casos/wharton-maldovian-coffins.pdf',     'estrategia-competitiva',   'l2-intermedio'),
    ('/casos/wharton-hardhead-helmets.pdf',      'ma-inversion',             'l2-intermedio'),
    ('/casos/wharton-abc-conglomerate.pdf',      'rentabilidad',             'l2-intermedio')
) as v ("document_url", "category", "difficulty")
where c."document_url" = v."document_url";

update "public"."CaseStudies"
set "category" = null, "difficulty" = null
where "case_type" = 'Casebook';
