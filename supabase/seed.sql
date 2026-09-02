-- Datos de ejemplo para el stack local. `supabase db reset` los carga automaticamente
-- (config.toml -> [db.seed]). Este archivo NO viaja a produccion: `supabase db push`
-- solo sube las migraciones de supabase/migrations/.

INSERT INTO "public"."CaseStudies"
    ("title", "company", "company_logo_url", "category", "difficulty", "duration_minutes",
     "case_type", "summary", "problem_statement", "document_url", "document_name",
     "document_size_bytes", "published_date")
VALUES
    (
        'Estrategia de Entrada a LatAm',
        'TechCorp',
        '/logos_consultoras/McKinsey&Co.png',
        'ESTRATEGIA',
        'MEDIO',
        45,
        'Case Interview',
        'TechCorp, una empresa lider en software B2B en Norteamerica, enfrenta un estancamiento en su crecimiento regional. Han identificado oportunidades significativas en America Latina, pero sus intentos iniciales de penetracion de mercado han resultado en perdidas operativas debido a una falta de adaptacion cultural y estructural de sus productos.',
        'El equipo consultor debe desarrollar una estrategia de entrada al mercado que minimice el riesgo inicial, identifique los segmentos de clientes mas rentables en estas nuevas regiones y proponga una estructura organizativa que soporte operaciones descentralizadas sin comprometer la calidad del servicio core.',
        '/docs/Casebook_Pontem_2021.pdf',
        'techcorp_estrategia_latam.pdf',
        2515678,
        '2026-03-15'
    ),
    (
        'Optimizacion de Supply Chain',
        'RetailGiant',
        '/logos_consultoras/Deloitte.png',
        'OPERACIONES',
        'DIFICIL',
        30,
        'Case Interview',
        'RetailGiant opera 120 tiendas en Chile y Peru con una red logistica que crecio de forma organica y sin planificacion central. Los quiebres de stock en categorias de alta rotacion alcanzan el 12% mensual.',
        'Se pide disenar un rediseno de la red de distribucion que reduzca los quiebres de stock a menos del 4% sin aumentar el costo logistico total por sobre la inflacion del periodo.',
        NULL,
        NULL,
        NULL,
        '2026-04-02'
    ),
    (
        'Analisis de M&A Regional',
        'GlobalBank',
        '/logos_consultoras/PwC.png',
        'FINANZAS',
        'EXPERTO',
        60,
        'Frameworks',
        'GlobalBank evalua la adquisicion de una fintech regional de pagos con presencia en cuatro paises. La operacion se valoriza en USD 340 millones y la due diligence preliminar levanto dudas sobre la calidad de los ingresos recurrentes.',
        'El equipo debe construir un modelo de valorizacion, identificar las sinergias reales frente a las declaradas por el vendedor y recomendar si se avanza, se renegocia el precio o se abandona la operacion.',
        NULL,
        NULL,
        NULL,
        '2026-05-20'
    );


INSERT INTO "public"."CaseStudyResources" ("case_study_id", "kind", "title", "link", "position")
VALUES
    (1, 'APUNTE', 'Frameworks de Entrada a Nuevos Mercados (GTM)', 'https://drive.google.com/drive/folders/1VMvUCSLVQ4ZeAVuzffJVIIHwkJqUGPZ8', 1),
    (1, 'DATASET', 'Proyecciones Financieras LATAM 2026', 'https://drive.google.com/drive/folders/1VMvUCSLVQ4ZeAVuzffJVIIHwkJqUGPZ8', 2),
    (1, 'MASTERCLASS', 'Resolucion en vivo: Expansion Regional', 'https://www.youtube.com/@pontemconsultingclub', 3),
    (2, 'APUNTE', 'Fundamentos de Supply Chain para consultores', 'https://drive.google.com/drive/folders/1VMvUCSLVQ4ZeAVuzffJVIIHwkJqUGPZ8', 1),
    (3, 'DATASET', 'Comparables de valorizacion fintech LATAM', 'https://drive.google.com/drive/folders/1VMvUCSLVQ4ZeAVuzffJVIIHwkJqUGPZ8', 1);
