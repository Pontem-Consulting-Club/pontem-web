-- Datos de prueba para entornos que NO son produccion (canary y desarrollo local).
--
-- Este archivo lo consume `supabase db reset` (ver [db.seed] en config.toml) y se
-- puede aplicar a mano contra canary. NO es una migracion: `supabase db push` no
-- lo ejecuta, asi que nunca llega a produccion por el workflow.
--
-- Todo el contenido es inventado. No hay datos reales de personas del club.
-- Las imagenes apuntan a archivos que ya viven en public/, para que se vean sin
-- tener que subir nada al bucket `images`.

-- Guarda de seguridad: si la base ya tiene contenido, aborta. Evita que alguien
-- vacie produccion por accidente. Para re-sembrar canary a proposito:
--   set pontem.allow_reseed = 'on';
do $$
begin
  if (select count(*) from public."Team") > 0
     and current_setting('pontem.allow_reseed', true) is distinct from 'on' then
    raise exception
      'La base ya tiene datos: abortando el seed. Si de verdad quieres re-sembrar, corre primero: set pontem.allow_reseed = ''on'';';
  end if;
end $$;

truncate table public."Team", public."TeamCoordination", public."Projects",
               public."News", public."Events", public."HeroSlides",
               public."CaseStudies", public."CaseStudyResources"
  restart identity;

-- ---------------------------------------------------------------- coordinaciones
insert into public."TeamCoordination" (coordination, image_url) values
  ('DIRECTORS',    '/Equipo2024.jpeg'),
  ('COMMS_MKT',    '/FotoparaGrupos.png'),
  ('SOC_CONSULT',  '/BienvenidaConsultores.jpg'),
  ('PEOPLE_MGMT',  '/FotoparaGrupos.png'),
  ('LEARNING_DEV', '/LugarEstudio.jpg'),
  ('EXTERNAL_REL', '/BTGDay.jpeg'),
  ('IT',           '/LugarEstudio.jpg'),
  ('FINANCE',      '/Equipo2024.jpeg');

-- ---------------------------------------------------------------------- equipo
insert into public."Team" (name, coordination) values
  ('Matias Errazuriz Undurraga',   'DIRECTORS'),
  ('Antonia Vergara Larrain',      'DIRECTORS'),
  ('Cristobal Ossa Ibanez',        'DIRECTORS'),
  ('Josefa Middleton Cruz',        'COMMS_MKT'),
  ('Benjamin Tagle Rosas',         'COMMS_MKT'),
  ('Fernanda Prieto Alcalde',      'COMMS_MKT'),
  ('Tomas Izquierdo Bulnes',       'SOC_CONSULT'),
  ('Catalina Riesco Montt',        'SOC_CONSULT'),
  ('Ignacio Valdivieso Correa',    'SOC_CONSULT'),
  ('Rosario Amunategui Silva',     'SOC_CONSULT'),
  ('Diego Fontaine Achurra',       'PEOPLE_MGMT'),
  ('Magdalena Ruiz-Tagle Vial',    'PEOPLE_MGMT'),
  ('Vicente Balmaceda Nieto',      'PEOPLE_MGMT'),
  ('Trinidad Echeverria Lira',     'LEARNING_DEV'),
  ('Joaquin Barros Edwards',       'LEARNING_DEV'),
  ('Elena Guzman Peralta',         'LEARNING_DEV'),
  ('Agustin Larrain Ferrer',       'EXTERNAL_REL'),
  ('Sofia Concha Aldunate',        'EXTERNAL_REL'),
  ('Pedro Yrarrazaval Munoz',      'EXTERNAL_REL'),
  ('Camila Sotomayor Reyes',       'IT'),
  ('Felipe Donoso Castillo',       'IT'),
  ('Isidora Bezanilla Toro',       'IT'),
  ('Nicolas Zegers Palma',         'FINANCE'),
  ('Emilia Carvallo Hurtado',      'FINANCE');

-- -------------------------------------------------------------------- proyectos
insert into public."Projects" (title, subtitle, description, image_url, link, link_text, is_active, semester) values
  ('Fundacion Raices Urbanas',
   'Rediseno del modelo de captacion de donantes',
   'Levantamiento del embudo de donaciones y propuesta de un modelo de captacion recurrente. El equipo entrego un plan de segmentacion y un tablero de seguimiento mensual.',
   '/BienvenidaConsultores.jpg', 'https://example.org/raices-urbanas', 'Ver caso', true,  '2026 — S2'),
  ('Cooperativa Manos del Maule',
   'Estrategia de canal digital',
   'Diagnostico comercial de una cooperativa de artesanas y hoja de ruta para vender en linea sin intermediarios.',
   '/FotoparaGrupos.png', 'https://example.org/manos-del-maule', 'Ver caso', true,  '2026 — S2'),
  ('Red Comunitaria Pudahuel',
   'Optimizacion de la operacion de voluntariado',
   'Rediseno de los turnos de voluntariado y del proceso de onboarding, reduciendo a la mitad el tiempo entre postulacion y primera actividad.',
   '/Equipo2024.jpeg', null, null, true,  '2026 — S1'),
  ('Escuela Taller Los Andes',
   'Modelo de sostenibilidad financiera',
   'Construccion de un modelo de costos por programa y evaluacion de tres escenarios de financiamiento a tres anos.',
   '/LugarEstudio.jpg', 'https://example.org/escuela-taller', 'Ver informe', false, '2025 — S2'),
  ('Banco de Alimentos Biobio',
   'Mejora de la cadena logistica',
   'Analisis de rutas y capacidad de bodega para reducir la merma de alimentos frescos en la operacion regional.',
   '/BTGDay.jpeg', null, null, false, '2025 — S2'),
  ('Corporacion Adulto Mayor Nunoa',
   'Medicion de impacto social',
   'Definicion de indicadores de impacto y diseno de una encuesta de seguimiento para los talleres del programa.',
   '/BienvenidaConsultores.jpg', 'https://example.org/adulto-mayor', 'Ver caso', false, '2025 — S1');

-- ---------------------------------------------------------------------- noticias
insert into public."News" (image_url, type, title, subtitle, author, published_date, content, link) values
  ('/Equipo2024.jpeg', 'Anuncio',
   'Abrimos postulaciones para el proceso de admision 2026',
   'Buscamos estudiantes de todas las carreras con ganas de resolver problemas reales',
   'Coordinacion de Personas', '2026-08-11 14:00:00+00',
   'Las postulaciones estaran abiertas hasta el 30 de septiembre. El proceso considera una etapa de formulario, una entrevista grupal con casos y una entrevista personal. No se requiere experiencia previa en consultoria: lo que buscamos es curiosidad, rigor y ganas de trabajar en equipo.',
   null),
  ('/BTGDay.jpeg', 'Evento',
   'BTG Day: una jornada con el equipo de banca de inversion',
   'Charla, taller de valorizacion y espacio de networking en Casa Central',
   'Relaciones Externas', '2026-07-29 13:30:00+00',
   'Recibimos a profesionales de BTG Pactual para una jornada de formacion. La actividad partio con una charla sobre la industria, siguio con un taller practico de valorizacion y cerro con una instancia de conversacion abierta con los socios del club.',
   'https://example.org/btg-day'),
  ('/BienvenidaConsultores.jpg', 'Articulo',
   'Que aprendimos despues de veinte proyectos de consultoria social',
   'Cinco lecciones sobre trabajar con organizaciones sin fines de lucro',
   'Consultoria Social', '2026-06-18 16:45:00+00',
   'Despues de veinte proyectos hay patrones que se repiten. El primero: el problema que trae la organizacion casi nunca es el problema que hay que resolver. El segundo: los datos existen, pero rara vez estan en una planilla. En esta nota recogemos las lecciones que hoy ordenan nuestra metodologia.',
   null),
  ('/FotoparaGrupos.png', 'Anuncio',
   'Nueva alianza con la Escuela de Ingenieria',
   'Los proyectos del semestre podran convalidarse como practica profesional',
   'Direccion', '2026-05-06 11:00:00+00',
   'Firmamos un acuerdo que permite convalidar la participacion en proyectos del club como practica profesional para estudiantes de Ingenieria. El convenio parte con un cupo de quince estudiantes por semestre.',
   'https://example.org/alianza-ing'),
  ('/LugarEstudio.jpg', 'Articulo',
   'Como preparar una entrevista de casos sin morir en el intento',
   'La guia que le pasamos a nuestros consultores nuevos',
   'Learning & Development', '2026-04-02 09:15:00+00',
   'Una entrevista de casos no mide cuanto sabes de la industria, mide como piensas cuando no tienes toda la informacion. En esta guia dejamos la estructura que usamos internamente, los errores mas comunes que vemos y una lista de casos para practicar en pareja.',
   null),
  ('/Equipo2024.jpeg', 'Evento',
   'Cierre de semestre: presentacion final de proyectos',
   'Seis equipos presentaron sus resultados ante las organizaciones socias',
   'Comunicaciones y Marketing', '2026-12-05 22:00:00+00',
   'El cierre del semestre reunio a los seis equipos de consultoria social junto a las organizaciones con las que trabajaron. Cada equipo tuvo quince minutos para presentar el diagnostico, la recomendacion y el plan de implementacion acordado.',
   null);

-- ----------------------------------------------------------------------- eventos
insert into public."Events" (title, subtitle, description, date, image_url, location, link) values
  ('Charla de apertura: que hace un consultor', 'Ciclo de formacion 2026',
   'Sesion introductoria abierta a toda la universidad sobre el trabajo de consultoria y los caminos para entrar a la industria.',
   '2026-03-19 22:00:00+00', '/LugarEstudio.jpg', 'Sala K201, Campus San Joaquin', null),
  ('Taller de Excel financiero', 'Nivel intermedio',
   'Taller practico de modelamiento en planillas: construccion de un modelo de tres estados desde cero.',
   '2026-04-16 21:30:00+00', '/LugarEstudio.jpg', 'Laboratorio de Computacion, Campus San Joaquin', null),
  ('BTG Day', 'Jornada con BTG Pactual',
   'Charla, taller de valorizacion y espacio de networking con el equipo de banca de inversion.',
   '2026-07-29 13:30:00+00', '/BTGDay.jpeg', 'Casa Central UC', 'https://example.org/btg-day'),
  ('Feria de organizaciones estudiantiles', 'Segundo semestre',
   'Stand del club en la feria de bienvenida. Vamos a estar respondiendo dudas sobre el proceso de admision.',
   '2026-08-06 15:00:00+00', '/FotoparaGrupos.png', 'Explanada Campus San Joaquin', null),
  ('Casos en vivo con Bain & Company', 'Preparacion de entrevistas',
   'Dos consultores de Bain resuelven casos en vivo y despues acompanan rondas de practica en grupos pequenos.',
   '2026-09-17 22:00:00+00', '/BienvenidaConsultores.jpg', 'Sala de Postgrado, Campus San Joaquin', 'https://example.org/casos-bain'),
  ('Bienvenida a nuevos consultores', 'Generacion 2026',
   'Jornada de induccion para quienes entran al club: metodologia, equipos y asignacion de proyectos.',
   '2026-10-01 22:30:00+00', '/BienvenidaConsultores.jpg', 'Campus San Joaquin', null),
  ('Mesa redonda: impacto social medible', 'Con directores de fundaciones socias',
   'Conversacion con tres organizaciones sobre como miden el impacto de sus programas y que rol juega la evidencia.',
   '2026-10-22 22:00:00+00', '/Equipo2024.jpeg', 'Auditorio Escuela de Administracion', null),
  ('Taller de presentaciones ejecutivas', 'Storytelling con datos',
   'Como estructurar una recomendacion en diez laminas y defenderla frente a un directorio.',
   '2026-11-12 21:30:00+00', '/LugarEstudio.jpg', 'Sala K101, Campus San Joaquin', null),
  ('Presentacion final de proyectos', 'Cierre de semestre',
   'Los seis equipos presentan sus resultados ante las organizaciones socias y el resto del club.',
   '2026-12-05 22:00:00+00', '/Equipo2024.jpeg', 'Auditorio Escuela de Administracion', null),
  ('Cena de fin de ano', 'Solo socios',
   'Cierre del ano del club junto a la generacion saliente.',
   '2026-12-19 01:00:00+00', '/FotoparaGrupos.png', 'Por confirmar', null);

-- ------------------------------------------------------------------ hero slides
insert into public."HeroSlides" (title, subtitle, button_text, image_url, link, position) values
  ('Pontem Consulting Club',
   'Consultoria estudiantil con impacto real en organizaciones sociales',
   'Conoce el club', '/Equipo2024.jpeg', '/nosotros', 1),
  ('Postulaciones abiertas 2026',
   'Buscamos estudiantes de todas las carreras. No necesitas experiencia previa.',
   'Postula aqui', '/BienvenidaConsultores.jpg', '/postulaciones', 2),
  ('Consultoria social',
   'Seis proyectos por semestre junto a fundaciones y cooperativas de todo Chile',
   'Ver proyectos', '/FotoparaGrupos.png', '/consultoria-social', 3),
  ('Formacion continua',
   'Talleres, casos en vivo y mentorias con consultoras y bancos de inversion',
   'Ver actividades', '/LugarEstudio.jpg', '/actividades', 4);


-- ----------------------------------------------------------- casos de estudio
-- Empresas inventadas. Se deja `company_logo_url` en null en casi todos a
-- proposito: los logos de public/logos_consultoras/ son de consultoras reales y
-- colgarselos a una empresa ficticia induce a error. El caso 1 usa el logo del
-- club para que se vea el camino con imagen; el resto cae al icono por defecto.
insert into public."CaseStudies"
  (title, company, company_logo_url, category, difficulty, duration_minutes,
   case_type, summary, problem_statement, document_url, document_name,
   document_size_bytes, published_date) values
  ('Estrategia de entrada a LatAm', 'TechCorp', '/LogoColorSolo.png',
   'ESTRATEGIA', 'MEDIO', 45, 'Case Interview',
   'TechCorp, una empresa de software B2B con presencia en Norteamerica, lleva seis trimestres sin crecer. Detectaron oportunidades en America Latina, pero sus primeros intentos de entrada terminaron en perdidas operativas por no adaptar el producto ni la estructura comercial al mercado local.',
   'El equipo consultor debe proponer una estrategia de entrada que acote el riesgo inicial, priorice los segmentos de clientes mas rentables de la region y defina una estructura organizativa que soporte operaciones descentralizadas sin degradar el servicio.',
   '/docs/Casebook_Pontem_2021.pdf', 'techcorp_estrategia_latam.pdf', 2015932, '2026-03-15'),

  ('Optimizacion de la cadena de suministro', 'RetailGiant', null,
   'OPERACIONES', 'DIFICIL', 30, 'Case Interview',
   'RetailGiant opera 120 tiendas en Chile y Peru con una red logistica que crecio sin planificacion central. Los quiebres de stock en las categorias de mayor rotacion llegan al 12% mensual.',
   'Se pide redisenar la red de distribucion para bajar los quiebres de stock por debajo del 4%, sin que el costo logistico total suba mas que la inflacion del periodo.',
   null, null, null, '2026-04-02'),

  ('Analisis de una fusion regional', 'GlobalBank', null,
   'FINANZAS', 'EXPERTO', 60, 'Frameworks',
   'GlobalBank evalua adquirir una fintech de pagos con operacion en cuatro paises. La operacion se valoriza en USD 340 millones y la due diligence preliminar levanto dudas sobre la calidad de los ingresos recurrentes.',
   'El equipo debe construir un modelo de valorizacion, separar las sinergias reales de las declaradas por el vendedor y recomendar si se avanza, se renegocia el precio o se abandona la operacion.',
   null, null, null, '2026-05-20'),

  ('Rediseno del programa de becas', 'Fundacion Raices', null,
   'IMPACTO_SOCIAL', 'FACIL', 40, 'Case Interview',
   'Una fundacion que entrega becas de continuidad de estudios detecta que un tercio de sus beneficiarios abandona el programa antes del segundo ano, sin que el equipo sepa por que.',
   'Hay que disenar como levantar la informacion que falta y proponer cambios al programa que suban la retencion con el mismo presupuesto.',
   null, null, null, '2026-06-11');

insert into public."CaseStudyResources" (case_study_id, kind, title, link, position) values
  (1, 'APUNTE',      'Frameworks de entrada a nuevos mercados (GTM)', 'https://example.org/apuntes/gtm', 1),
  (1, 'DATASET',     'Proyecciones financieras LATAM 2026',           'https://example.org/datasets/latam-2026', 2),
  (1, 'MASTERCLASS', 'Resolucion en vivo: expansion regional',        'https://example.org/masterclass/expansion', 3),
  (2, 'APUNTE',      'Fundamentos de cadena de suministro',           'https://example.org/apuntes/supply-chain', 1),
  (3, 'DATASET',     'Comparables de valorizacion fintech LATAM',     'https://example.org/datasets/fintech-latam', 1),
  (4, 'APUNTE',      'Medicion de impacto en programas sociales',     'https://example.org/apuntes/impacto', 1);
