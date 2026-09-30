-- Biblioteca de casos de estudio de Material de Estudio: los 12 casos del
-- Casebook Pontem (un PDF por caso), 12 casos sueltos y 22 casebooks de
-- universidades. Quedan fuera los libros comerciales y los casebooks que
-- prohiben su distribucion.
--
-- Los PDFs viven en public/casos/ y los sirve la app, por eso document_url es una
-- ruta que empieza con "/" y no un path del bucket documents.
--
-- `orden` es la posicion en la pagina. El listado ordena por id descendente, asi
-- que se inserta de la ultima a la primera. Idempotente por document_url.

insert into "public"."CaseStudies"
    ("title", "company", "category", "difficulty", "duration_minutes", "case_type",
     "summary", "problem_statement", "document_url", "document_name", "document_size_bytes")
select v."title", v."company", v."category", v."difficulty", v."duration_minutes", v."case_type",
     v."summary", v."problem_statement", v."document_url", v."document_name", v."document_size_bytes"
from (values
  (1, 'GalletaFina: crecer en ventas y margen', 'GalletaFina', 'MARKETING'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Bain & Company del Casebook Pontem. GalletaFina es el tercer fabricante de galletas de Brasil por volumen de venta. Un estudio previo de precios y volúmenes por cliente no encontró oportunidades, y la empresa contrata a Bain para diagnosticar el mercado y redefinir su estrategia de venta.',
   '¿Qué puede hacer GalletaFina para aumentar sus ventas? ¿Cuál es el modelo de ventas que maximiza sus márgenes?',
   '/casos/pontem-galletafina.pdf', 'Casebook Pontem - GalletaFina.pdf', 278700),

  (2, 'Ropalemu: estrategia de portafolio de marcas', 'Ropalemu', 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Bain & Company del Casebook Pontem. Ropalemu es uno de los principales fabricantes chilenos de ropa casual de estilo surf, con seis marcas. En los últimos dos años sus ingresos se estancaron y empezó a perder participación de mercado.',
   '¿Cuál es la mejor estrategia de portafolio para Ropalemu? ¿En qué marcas invertir para crecer, cuáles mantener minimizando inversiones y en cuáles desinvertir para liberar recursos?',
   '/casos/pontem-ropalemu.pdf', 'Casebook Pontem - Ropalemu.pdf', 273166),

  (3, 'iGlass: alianza con carriers', 'NextGen Optics', 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Bain & Company del Casebook Pontem. NextGen Optics quiere vender su dispositivo iGlass con contratos anuales a través de los carriers. AT&T y Verizon, en conjunto, solo lo venderán si la empresa les da exclusividad.',
   '¿Debe NextGen Optics aliarse con AT&T y Verizon en exclusiva o buscar alianzas con los demás carriers del mercado? Incluye análisis de penetración, pricing y footprint de tiendas.',
   '/casos/pontem-iglass.pdf', 'Casebook Pontem - iGlass.pdf', 229744),

  (4, 'ApplianceCo: evaluación de una adquisición', 'ApplianceCo', 'FINANZAS'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Bain & Company del Casebook Pontem. Un fondo de private equity evalúa adquirir ApplianceCo, líder en distribución B2B de línea blanca premium con 150 sucursales, cuyos resultados recientes han sido mixtos por la desaceleración económica.',
   'El fondo quiere aumentar el EBITDA anual en $300M en tres años con CAPEX mínimo. ¿Es alcanzable esa meta? ¿Debería el fondo invertir en ApplianceCo?',
   '/casos/pontem-applianceco.pdf', 'Casebook Pontem - ApplianceCo.pdf', 261177),

  (5, 'Estación de servicio: aumentar ventas de la tienda', null, 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de BCG del Casebook Pontem. Una cadena de bencineras obtiene la mayor parte de su rentabilidad de las tiendas dentro de sus estaciones, pero estas venden menos y con un mix de productos más pobre que la competencia.',
   '¿Cómo puede el cliente aumentar las ventas de sus tiendas? En particular, ¿debería empezar a vender alcohol?',
   '/casos/pontem-estacion-de-servicio.pdf', 'Casebook Pontem - Estación de Servicio.pdf', 206189),

  (6, 'Supermercado: rentabilidad del área deli', null, 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de BCG del Casebook Pontem. Una cadena nacional de supermercados pierde terreno frente a competidores de bajo precio como Wal-Mart y Costco. Su departamento deli, un negocio de $700M formado por carnes deli y comidas preparadas, lleva años sin crecer en ganancias.',
   '¿Por qué no crecen las ganancias del departamento deli y qué debería hacer el cliente para revertir la situación?',
   '/casos/pontem-alimentos-supermercado.pdf', 'Casebook Pontem - Alimentos Supermercado.pdf', 170460),

  (7, 'GymCo: meta de crecimiento incumplida', 'GymCo', 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de BCG del Casebook Pontem (en inglés). GymCo es una cadena internacional de gimnasios en África subsahariana, Europa y el Sudeste Asiático. En 2013 no alcanzó su meta de crecimiento de ZAR600M, aunque sus competidores crecieron con fuerza.',
   'El CEO quiere entender qué está pasando: por qué aumenta el número de socios pero no los ingresos, y qué papel juega el convenio de descuentos con HealthCo.',
   '/casos/pontem-gymco.pdf', 'Casebook Pontem - GymCo.pdf', 212671),

  (8, 'Hotel: costo de la mano de obra de aseo', null, 'OPERACIONES'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Virtus Partners del Casebook Pontem. Un empresario retirado abrirá su propio hotel en el sur de Chile en las próximas semanas y está afinando la proyección económica. El servicio de aseo es clave tanto para los costos como para la calidad de la atención.',
   '¿Cuánto se debe pagar en mano de obra de aseo para entregar un buen nivel de servicio? Estima la dotación y su costo, y revisa las fuentes de error de la estimación.',
   '/casos/pontem-aseo-hotel.pdf', 'Casebook Pontem - Aseo Hotel.pdf', 141324),

  (9, 'Operador logístico: ¿seguir o salir del negocio?', null, 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Virtus Partners del Casebook Pontem. Un grupo de medios que incursiona en e-commerce creó un marketplace y un operador logístico propio, con despacho a domicilio y una red de 50 puntos de retiro (PUDOs). Tras cinco años de operación, el operador logístico sigue sin ser rentable.',
   'El negocio logístico no es el core del grupo. ¿Debe continuar con él o salir? Evalúa la industria, la empresa y la utilidad de cada servicio.',
   '/casos/pontem-logistica.pdf', 'Casebook Pontem - Logística.pdf', 143364),

  (10, 'LatinPharma: adquirir BioMed', 'LatinPharma', 'FINANZAS'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Matrix Consulting del Casebook Pontem. LatinPharma, farmacéutica con sede en Santiago e ingresos de US$10 mil millones al año, se especializa en medicina molecular, mientras la tendencia apunta a la medicina biológica. Tiene la oportunidad de adquirir BioMed, una empresa más pequeña experta en biológicos. Es un caso abierto, sin una única solución.',
   '¿Debe LatinPharma adquirir BioMed? ¿Cómo construirías una recomendación al respecto?',
   '/casos/pontem-latinpharma.pdf', 'Casebook Pontem - LatinPharma.pdf', 169083),

  (11, 'Gas envasado: pérdida de participación de mercado', null, 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso conceptual de Matrix Consulting del Casebook Pontem. Una empresa chilena de gas envasado con presencia nacional ha perdido participación de mercado en los últimos años, en un mercado estable y concentrado donde la distribución al cliente final la hacen terceros.',
   '¿Por qué la empresa está perdiendo participación? ¿Qué le recomendarías para revertir la tendencia?',
   '/casos/pontem-gas-envasado.pdf', 'Casebook Pontem - Gas Envasado.pdf', 57960),

  (12, 'Autos de lujo: entrada a Paraguay', null, 'ESTRATEGIA'::"public"."CaseCategory", null, 30, 'Case Interview',
   'Caso de Matrix Consulting del Casebook Pontem. Un fabricante alemán de autos de lujo evalúa empezar a vender en Paraguay, cuyo PIB crece un 5% anual y donde hoy Mercedes es el único actor del segmento.',
   'Si entra al mercado, ¿puede la compañía alcanzar el break even en tres años?',
   '/casos/pontem-autos-de-lujo.pdf', 'Casebook Pontem - Autos de Lujo.pdf', 68728),

  (13, 'Old Winery', 'Old Winery', 'ESTRATEGIA'::"public"."CaseCategory", 'MEDIO'::"public"."CaseDifficulty", null, 'Case Interview',
   'Caso de Bain (PrepLounge, en inglés), dirigido por el candidato. Heredaste una viña familiar centenaria de once hectáreas con una marca poco conocida y baja demanda, y quieres darle un nuevo impulso sin operarla tú mismo.',
   'Estima la producción de la viña, cuantifica sus costos frente al mercado y propone medidas para mejorar su rentabilidad.',
   '/casos/bain-old-winery.pdf', 'Bain - Old Winery.pdf', 5203204),

  (14, 'Productor asiático de lubricantes', 'LubricantsCo', 'ESTRATEGIA'::"public"."CaseCategory", 'FACIL'::"public"."CaseDifficulty", null, 'Case Interview',
   'Caso de Bain (PrepLounge, en inglés). LubricantsCo es un exitoso productor asiático de lubricantes premium con poco potencial de crecimiento en su mercado local, y quiere internacionalizarse en el negocio de autos de pasajeros.',
   'Prioriza un mercado de prueba en Europa y países vecinos con criterios de evaluación estructurados, y esboza la estrategia de entrada para ese mercado.',
   '/casos/bain-asian-lubricants.pdf', 'Bain - Asian Lubricants Producer.pdf', 1092954),

  (15, 'Universal Airlines', 'Universal Airlines', 'ESTRATEGIA'::"public"."CaseCategory", 'DIFICIL'::"public"."CaseDifficulty", null, 'Case Interview',
   'Caso estilo McKinsey (PrepLounge, en inglés), dirigido por el entrevistador. Una aerolínea con fuertes reservas de caja evalúa invertir en el negocio de mantenimiento, reparación y overhaul (MRO) de jets ejecutivos a nivel global.',
   'Dimensiona el mercado global de MRO para jets ejecutivos y discute si conviene entrar.',
   '/casos/universal-airlines.pdf', 'Universal Airlines.pdf', 1570975),

  (16, 'Frank''s Cheese', 'Frank''s Cheese', 'MARKETING'::"public"."CaseCategory", null, null, 'Case Interview',
   'Caso del casebook de Cornell (Johnson School, en inglés). Un fabricante de quesos de alta calidad de la costa este, que comparte el mercado con su rival histórico, ve caer sus utilidades.',
   'Frank culpa al aumento del gasto en publicidad y promociones. ¿Tiene razón? Determínalo y propone soluciones.',
   '/casos/cornell-franks-cheese.pdf', 'Cornell - Frank''s Cheese.pdf', 128216),

  (17, 'Hammerjack', 'Hammerjack', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Case Interview',
   'Caso de rentabilidad del casebook de Cornell (Johnson School, en inglés). Una cadena regional de ferreterías de barrio tuvo 15 años de excelente desempeño, pero sus utilidades caen desde hace dos años.',
   'Explica la caída de rentabilidad de Hammerjack y recomienda cómo volver a encaminarla.',
   '/casos/cornell-hammerjack.pdf', 'Cornell - Hammerjack.pdf', 128843),

  (18, 'Scan Air', 'Scan Air', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Case Interview',
   'Caso de McKinsey del casebook de Cornell (Johnson School, en inglés). Una aerolínea escandinava enfocada en pasajeros de negocios, con caja sólida y casi sin deuda, ve erosionarse sus utilidades y nunca ha entrado en alianzas globales.',
   '¿Qué debería considerar Scan Air antes de entrar en una alianza? ¿Qué factor de ocupación necesita para lograr un margen del 10% antes de impuestos?',
   '/casos/cornell-scan-air.pdf', 'Cornell - Scan Air.pdf', 127882),

  (19, 'Rock Energy', 'Rock Energy', 'FINANZAS'::"public"."CaseCategory", null, null, 'Case Interview',
   'Caso del casebook de Kellogg 2011 (en inglés). Una petrolera evalúa comprar los derechos de extracción de uno de tres yacimientos en Latinoamérica y externalizar la perforación.',
   '¿Cómo evaluarías los tres yacimientos y cuál debería comprar Rock Energy?',
   '/casos/kellogg-rock-energy.pdf', 'Kellogg - Rock Energy.pdf', 707880),

  (20, 'Wine & Co.', 'Wine & Co.', 'ESTRATEGIA'::"public"."CaseCategory", 'MEDIO'::"public"."CaseDifficulty", null, 'Case Interview',
   'Caso estilo McKinsey del casebook de Kellogg 2011 (en inglés). Un fabricante de vinos de nicho de la bahía de San Francisco acaba de comprar 12 acres de terreno.',
   '¿Cuál es el mejor uso para el terreno? Estructura el problema, valoriza las alternativas y recomienda una estrategia de marketing.',
   '/casos/kellogg-wine-and-co.pdf', 'Kellogg - Wine & Co.pdf', 671974),

  (21, 'Zoo Co.', 'Zoo Co.', 'FINANZAS'::"public"."CaseCategory", 'MEDIO'::"public"."CaseDifficulty", null, 'Case Interview',
   'Caso de M&A del casebook de Kellogg 2011 (en inglés). Un zoológico evalúa adquirir una cebra famosa de una reserva africana: una gran inversión que pone a prueba valorización, punto de equilibrio y análisis de riesgo.',
   '¿Es una buena idea adquirir la cebra? ¿Qué aumento de ingresos se necesita para un VAN positivo y conviene contratar un seguro?',
   '/casos/kellogg-zoo-co.pdf', 'Kellogg - Zoo Co.pdf', 767724),

  (22, 'Maldovian Coffins', null, 'OPERACIONES'::"public"."CaseCategory", null, null, 'Case Interview',
   'Caso de primera ronda de McKinsey del casebook de Wharton 2006 (en inglés). Un fabricante de ataúdes artesanales de Europa del Este evalúa adoptar una tecnología que le permitiría fabricarlos a máquina.',
   '¿Debe el cliente cambiar a la producción mecanizada? Resuelve los módulos cuantitativos y llega rápido a una conclusión.',
   '/casos/wharton-maldovian-coffins.pdf', 'Wharton - Maldovian Coffins.pdf', 19675),

  (23, 'HardHead Helmets', 'HardHead', 'FINANZAS'::"public"."CaseCategory", null, null, 'Case Interview',
   'Caso de segunda ronda de Bain del casebook de Wharton 2006 (en inglés). Un fondo de private equity evalúa sacar de bolsa al líder en cascos de bicicleta, con 60% de participación, mientras el canal se desplaza hacia los grandes descuentos y entran competidores como Nike.',
   '¿Debería el fondo comprar HardHead?',
   '/casos/wharton-hardhead-helmets.pdf', 'Wharton - HardHead Helmets.pdf', 15292),

  (24, 'ABC Conglomerate', 'ABC Conglomerate', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Case Interview',
   'Caso de primera ronda de Bain del casebook de Wharton 2006 (en inglés). El CEO de un gran conglomerado enfrenta baja rentabilidad en sus tres divisiones.',
   '¿Qué debería hacer el CEO con cada división para maximizar el valor para los accionistas?',
   '/casos/wharton-abc-conglomerate.pdf', 'Wharton - ABC Conglomerate.pdf', 7276),

  (25, 'Casebook Columbia 2017', 'Columbia Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2017 de la Management Consulting Association de Columbia Business School (en inglés). 190 páginas con casos de práctica.',
   null,
   '/casos/casebook-columbia-2017.pdf', 'Casebook Columbia 2017.pdf', 2097659),

  (26, 'Casebook Columbia 2006', 'Columbia Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2006 de la Management Consulting Association de Columbia Business School (en inglés). 89 páginas con casos de práctica.',
   null,
   '/casos/casebook-columbia-2006.pdf', 'Casebook Columbia 2006.pdf', 483271),

  (27, 'Casebook Darden 2012-2013', 'Darden School of Business', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook de consultoría de Darden, edición 2012-2013 (en inglés). 195 páginas: estructura de la entrevista de caso, frameworks, perfiles de consultoras y casos de práctica.',
   null,
   '/casos/casebook-darden-2012-2013.pdf', 'Casebook Darden 2012-2013.pdf', 1571613),

  (28, 'Casebook Darden 2018-2019', 'Darden School of Business', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook de Darden, edición 2018-2019 (en inglés). 178 páginas con una guía de la industria de consultoría, perfiles de consultoras y 12 casos.',
   null,
   '/casos/casebook-darden-2018-2019.pdf', 'Casebook Darden 2018-2019.pdf', 3193081),

  (29, 'Casebook Duke 2010-2011', 'Duke Fuqua School of Business', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook oficial 2010-2011 del Duke MBA Consulting Club (en inglés). 146 páginas con casos de práctica.',
   null,
   '/casos/casebook-duke-2010-2011.pdf', 'Casebook Duke 2010-2011.pdf', 1239787),

  (30, 'Casebook Duke 2014-2015', 'Duke Fuqua School of Business', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2014-2015 del Duke MBA Consulting Club para alumnos de primer año (en inglés). 256 páginas con más de 20 casos nuevos.',
   null,
   '/casos/casebook-duke-2014-2015.pdf', 'Casebook Duke 2014-2015.pdf', 3407856),

  (31, 'Casebook ESADE 2011', 'ESADE Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Primera edición del casebook del ESADE MBA Consulting Club (en inglés). 108 páginas con casos de práctica.',
   null,
   '/casos/casebook-esade-2011.pdf', 'Casebook ESADE 2011.pdf', 1678434),

  (32, 'Casebook London Business School 2006', 'London Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2006 del Consulting Club de London Business School (en inglés). 173 páginas: introducción al proceso de entrevistas y casos de práctica.',
   null,
   '/casos/casebook-lbs-2006.pdf', 'Casebook LBS 2006.pdf', 822812),

  (33, 'Casebook London Business School 2008', 'London Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2008 del Consulting Club de London Business School, con casos adicionales de The Boston Consulting Group (en inglés). 159 páginas.',
   null,
   '/casos/casebook-lbs-2008.pdf', 'Casebook LBS 2008.pdf', 1023211),

  (34, 'Casebook London Business School 2009', 'London Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2009 del Consulting Club de London Business School (en inglés). 143 páginas con casos de práctica.',
   null,
   '/casos/casebook-lbs-2009.pdf', 'Casebook LBS 2009.pdf', 2088887),

  (35, 'Casebook London Business School 2010-2011', 'London Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Guía práctica para entrevistas de caso 2010-2011 del Consulting Club (en inglés). 32 páginas: proceso de entrevista, tipos de caso, entrevistas de fit y 12 casos con respuestas desarrolladas.',
   null,
   '/casos/casebook-lbs-2010-2011.pdf', 'Casebook LBS 2010-2011.pdf', 1363938),

  (36, 'Casebook London Business School 2013', 'London Business School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2013 de London Business School (en inglés). 91 páginas con casos de práctica aportados por consultoras como Bain & Company.',
   null,
   '/casos/casebook-lbs-2013.pdf', 'Casebook LBS 2013.pdf', 3303482),

  (37, 'Casebook MIT Sloan 2001', 'MIT Sloan School of Management', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Case Book and Interview Guide 2001-2002 del Management Consulting Club de MIT Sloan (en inglés). 168 páginas.',
   null,
   '/casos/casebook-mit-sloan-2001.pdf', 'Casebook MIT Sloan 2001.pdf', 3163914),

  (38, 'Casebook Michigan Ross 2010', 'Michigan Ross School of Business', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2010 del Consulting Club (en inglés). 108 páginas: pasos de la entrevista de caso, tipos de caso, frameworks y casos de práctica como Pizzanomics, Gas Station y Strawberry Jam.',
   null,
   '/casos/casebook-michigan-ross-2010.pdf', 'Casebook Ross 2010.pdf', 1022885),

  (39, 'Casebook Tuck 1999-2000', 'Tuck School of Business', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Guide to Case Interviews 1999-2000 del Tuck Consulting Club, Dartmouth College (en inglés). 99 páginas.',
   null,
   '/casos/casebook-tuck-1999-2000.pdf', 'Casebook Tuck 1999-2000.pdf', 336896),

  (40, 'Casebook Wharton 2004-2005', 'Wharton School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Practice Case Interview Guide 2004-2005 del Wharton Consulting Club (en inglés). 48 páginas con casos de BCG, Booz Allen, Bain y McKinsey.',
   null,
   '/casos/casebook-wharton-2004-2005.pdf', 'Casebook Wharton 2004-2005.pdf', 425213),

  (41, 'Casebook Wharton 2005-2006', 'Wharton School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook Wharton, edición 2005-2006 (en inglés). 32 páginas con casos de primera y segunda ronda de McKinsey, Bain y otras consultoras.',
   null,
   '/casos/casebook-wharton-2005-2006.pdf', 'Casebook Wharton 2005-2006.pdf', 259562),

  (42, 'Casebook Wharton 2007-2008', 'Wharton School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Wharton Consulting Casebook, edición 2007-2008 (en inglés). 20 páginas con casos de práctica.',
   null,
   '/casos/casebook-wharton-2007-2008.pdf', 'Casebook Wharton 2007-2008.pdf', 535126),

  (43, 'Casebook Wharton 2008', 'Wharton School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook de diciembre de 2008 del Wharton Consulting Club (en inglés). 84 páginas con casos de BCG, L.E.K., Deloitte, Bain, Booz y otras.',
   null,
   '/casos/casebook-wharton-2008.pdf', 'Casebook Wharton 2008.pdf', 759572),

  (44, 'Casebook Wharton 2009', 'Wharton School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook de septiembre de 2009 del Wharton Consulting Club (en inglés). 78 páginas con casos de McKinsey, Bain, BCG y otras.',
   null,
   '/casos/casebook-wharton-2009.pdf', 'Casebook Wharton 2009.pdf', 638353),

  (45, 'Casebook Wharton 2010', 'Wharton School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook de diciembre de 2010 del Wharton Consulting Club (en inglés). 131 páginas: guía de la industria, perfiles de 10 consultoras, preparación de entrevistas, frameworks y casos de práctica.',
   null,
   '/casos/casebook-wharton-2010.pdf', 'Casebook Wharton 2010.pdf', 2542586),

  (46, 'Casebook Wharton 2017', 'Wharton School', 'ESTRATEGIA'::"public"."CaseCategory", null, null, 'Casebook',
   'Casebook 2017 del Wharton Consulting Club (en inglés). 201 páginas con un resumen del proceso de reclutamiento, preparación de entrevistas y casos de práctica.',
   null,
   '/casos/casebook-wharton-2017.pdf', 'Casebook Wharton 2017.pdf', 2972342)
) as v ("orden", "title", "company", "category", "difficulty", "duration_minutes", "case_type",
     "summary", "problem_statement", "document_url", "document_name", "document_size_bytes")
where not exists (
    select 1 from "public"."CaseStudies" c where c."document_url" = v."document_url"
)
order by v."orden" desc;
