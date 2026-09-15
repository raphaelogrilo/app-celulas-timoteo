-- ============================================================
-- APP CÉLULAS TIMÓTEO - SCRIPT DE RESET E SEED DAS 13 CÉLULAS OFICIAIS
-- ============================================================

-- 1. Limpar células antigas de teste (mantendo a integridade)
DELETE FROM public.celulas;

-- 2. Inserir as 13 Células Oficiais com coordenadas exatas por bairro
INSERT INTO public.celulas (
    nome, perfil, lider, telefone, dia, horario, bairro, cep, faixa_etaria, descricao, ativo, itinerante, lat, lng, encontro_atual
) VALUES
-- ------------------------------------------------------------
-- 1. HOMENS DE ATOS
-- ------------------------------------------------------------
(
    'Célula 1 · Homens de Atos',
    'Homens',
    'André e Lucas',
    '(31) 98667-1116',
    'Quinta-feira',
    '20:00',
    'Centro Sul',
    '35180-002',
    'Homens',
    'Comunhão, crescimento espiritual e fortalecimento da liderança masculina e familiar.',
    TRUE,
    FALSE,
    -19.5870,
    -42.6440,
    NULL
),
(
    'Célula 2 · Homens de Atos',
    'Homens',
    'Weldherson',
    '(31) 98869-5702',
    'Quinta-feira',
    '20:00',
    'Centro Norte',
    '35180-002',
    'Homens',
    'Encontro para homens que buscam honra, integridade e propósito em Deus.',
    TRUE,
    FALSE,
    -19.5780,
    -42.6430,
    NULL
),

-- ------------------------------------------------------------
-- 2. MULHERES DE ATITUDE
-- ------------------------------------------------------------
(
    'Celeiro 1 · Mulheres de Atitude',
    'Mulheres',
    'Dani',
    '(31) 98556-7182',
    'Terça-feira',
    '19:30',
    'Ana Rita',
    '35182-000',
    'Mulheres',
    'Partilha, oração, apoio mútuo e florescimento espiritual feminino.',
    TRUE,
    FALSE,
    -19.6100,
    -42.6520,
    NULL
),
(
    'Celeiro 2 · Mulheres de Atitude',
    'Mulheres',
    'Kenya',
    '(31) 98666-1390',
    'Segunda-feira',
    '19:30',
    'Rotativa',
    '35180-000',
    'Mulheres',
    'Célula rotativa acolhedora para mulheres de todas as idades.',
    TRUE,
    TRUE,
    -19.5850,
    -42.6410,
    '{"dia": "Segunda-feira", "horario": "19:30", "bairro": "Rotativa", "cep": "35180-000", "coords": {"lat": -19.5850, "lng": -42.6410}}'::jsonb
),
(
    'Celeiro 3 · Mulheres de Atitude',
    'Mulheres',
    'Alessandra',
    '(31) 98559-6079',
    'Terça-feira',
    '19:30',
    'Rotativa',
    '35180-000',
    'Mulheres',
    'Célula rotativa com momentos de intercessão, palavra e comunhão.',
    TRUE,
    TRUE,
    -19.5920,
    -42.6450,
    '{"dia": "Terça-feira", "horario": "19:30", "bairro": "Rotativa", "cep": "35180-000", "coords": {"lat": -19.5920, "lng": -42.6450}}'::jsonb
),
(
    'Celeiro 4 · Mulheres de Atitude',
    'Mulheres',
    'Mariza',
    '(31) 98921-0138',
    'Terça-feira',
    '19:30',
    'Centro',
    '35180-002',
    'Mulheres',
    'Grupo dedicado ao discipulado feminino e fortalecimento da fé.',
    TRUE,
    FALSE,
    -19.5828,
    -42.6436,
    NULL
),
(
    'Celeiro 5 · Mulheres de Atitude',
    'Mulheres',
    'Rayane',
    '(31) 98876-6717',
    'Terça-feira',
    '19:30',
    'Alvorada',
    '35180-350',
    'Mulheres',
    'Comunhão, estudo bíblico prático e acolhimento no bairro Alvorada.',
    TRUE,
    FALSE,
    -19.5980,
    -42.6390,
    NULL
),

-- ------------------------------------------------------------
-- 3. MINISTÉRIO HOPE (Casais)
-- ------------------------------------------------------------
(
    'Célula Mista 1 · Hope',
    'Casais',
    'Douglas',
    '(31) 98719-0455',
    'Terça-feira',
    '20:00',
    'Eldorado',
    '35180-320',
    'Casais',
    'Fortalecimento da vida a dois, princípios bíblicos para a família e ambiente fraterno.',
    TRUE,
    FALSE,
    -19.5950,
    -42.6320,
    NULL
),
(
    'Célula Mista 2 · Hope',
    'Casais',
    'Emerson e Laudiceia',
    '(31) 98305-1984',
    'Segunda-feira',
    '20:00',
    'Quitandinha (Cel. Fabriciano)',
    '35170-000',
    'Casais',
    'União conjugal, oração pelos lares e edificação mútua.',
    TRUE,
    FALSE,
    -19.5250,
    -42.6280,
    NULL
),

-- ------------------------------------------------------------
-- 4. MINISTÉRIO FLAMMA (Jovens)
-- ------------------------------------------------------------
(
    'Tocha (25+) · Flamma',
    'Jovens',
    'Herlaine',
    '(31) 98552-8562',
    'Quinta-feira',
    '20:00',
    'Centro',
    '35180-002',
    'Jovens 25+',
    'Jovens adultos em busca de maturidade espiritual, carreira e propósito no Reino.',
    TRUE,
    FALSE,
    -19.5835,
    -42.6425,
    NULL
),
(
    'Fuego · Flamma',
    'Jovens',
    'Leander',
    '(32) 99180-6896',
    'Sexta-feira',
    '20:00',
    'Bromélias',
    '35180-450',
    'Jovens (2 sextas e 2 sábados)',
    'Muita adoração, palavra viva, amizades verdadeiras e paixão pelo Evangelho.',
    TRUE,
    FALSE,
    -19.5730,
    -42.6480,
    NULL
),

-- ------------------------------------------------------------
-- 5. MINISTÉRIO FLICK (Adolescentes)
-- ------------------------------------------------------------
(
    'Brasa · Flick',
    'Teens',
    'Vera',
    '(31) 98662-3476',
    'Quinta-feira',
    '19:30',
    'Alvorada',
    '35180-350',
    'Adolescentes (Teens)',
    'Conexão, dinâmicas, ensino dinâmico e discipulado para adolescentes.',
    TRUE,
    FALSE,
    -19.5975,
    -42.6405,
    NULL
),
(
    'Fire · Flick',
    'Teens',
    'Edenia',
    '(31) 98599-9229',
    'Quinta-feira',
    '19:30',
    'Ana Rita',
    '35182-000',
    'Adolescentes (Teens)',
    'Adolescentes cheios de energia, fé inabalável e comunhão no bairro Ana Rita.',
    TRUE,
    FALSE,
    -19.6090,
    -42.6510,
    NULL
);
