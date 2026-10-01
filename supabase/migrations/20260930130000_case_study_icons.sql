-- Icono de la tarjeta de un caso cuando no tiene logo. Es un nombre de Iconify
-- (i-lucide-*). Si queda en null, la tarjeta usa el icono de la categoria.
alter table "public"."CaseStudies" add column if not exists "icon" text;

comment on column "public"."CaseStudies"."icon" is 'Icono Iconify de la tarjeta cuando no hay logo; null usa el de la categoria';

-- Un icono segun la industria de cada caso de la biblioteca. Los casebooks llevan
-- todos el mismo.
update "public"."CaseStudies" c
set "icon" = v."icon"
from (values
    ('/casos/pontem-galletafina.pdf',            'i-lucide-cookie'),
    ('/casos/pontem-ropalemu.pdf',               'i-lucide-shirt'),
    ('/casos/pontem-iglass.pdf',                 'i-lucide-glasses'),
    ('/casos/pontem-applianceco.pdf',            'i-lucide-refrigerator'),
    ('/casos/pontem-estacion-de-servicio.pdf',   'i-lucide-fuel'),
    ('/casos/pontem-alimentos-supermercado.pdf', 'i-lucide-sandwich'),
    ('/casos/pontem-gymco.pdf',                  'i-lucide-dumbbell'),
    ('/casos/pontem-aseo-hotel.pdf',             'i-lucide-hotel'),
    ('/casos/pontem-logistica.pdf',              'i-lucide-truck'),
    ('/casos/pontem-latinpharma.pdf',            'i-lucide-pill'),
    ('/casos/pontem-gas-envasado.pdf',           'i-lucide-flame'),
    ('/casos/pontem-autos-de-lujo.pdf',          'i-lucide-car'),
    ('/casos/bain-old-winery.pdf',               'i-lucide-wine'),
    ('/casos/bain-asian-lubricants.pdf',         'i-lucide-droplets'),
    ('/casos/universal-airlines.pdf',            'i-lucide-plane'),
    ('/casos/cornell-franks-cheese.pdf',         'i-lucide-milk'),
    ('/casos/cornell-hammerjack.pdf',            'i-lucide-hammer'),
    ('/casos/cornell-scan-air.pdf',              'i-lucide-plane-takeoff'),
    ('/casos/kellogg-rock-energy.pdf',           'i-lucide-drill'),
    ('/casos/kellogg-wine-and-co.pdf',           'i-lucide-grape'),
    ('/casos/kellogg-zoo-co.pdf',                'i-lucide-paw-print'),
    ('/casos/wharton-maldovian-coffins.pdf',     'i-lucide-factory'),
    ('/casos/wharton-hardhead-helmets.pdf',      'i-lucide-bike'),
    ('/casos/wharton-abc-conglomerate.pdf',      'i-lucide-network')
) as v ("document_url", "icon")
where c."document_url" = v."document_url";

update "public"."CaseStudies"
set "icon" = 'i-lucide-graduation-cap'
where "document_url" like '/casos/casebook-%';
