-- ============================================================
-- APP CÉLULAS TIMÓTEO - SCHEMA SUPABASE
-- ============================================================

-- Habilitar extensão uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE LÍDERES (Permissões e Vínculos)
-- Apenas usuários cadastrados previamente nesta tabela podem acessar como líder/admin
CREATE TABLE IF NOT EXISTS public.lideres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    celula_id UUID,
    criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    atualizado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. TABELA DE CÉLULAS
CREATE TABLE IF NOT EXISTS public.celulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    perfil TEXT NOT NULL, -- 'Jovens', 'Casais', 'Família', 'Homens', 'Mulheres', 'Teens', 'Misto'
    lider TEXT NOT NULL,
    telefone TEXT NOT NULL,
    foto_lider TEXT,
    descricao TEXT,
    faixa_etaria TEXT,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    itinerante BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Dados para células com endereço fixo (itinerante = false)
    dia TEXT,
    horario TEXT,
    cep TEXT,
    endereco TEXT,
    bairro TEXT,
    ponto_referencia TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    
    -- Dados para células itinerantes (atualizado semanalmente pelo líder)
    -- JSON contendo: { dia, horario, cep, endereco, bairro, pontoReferencia, coords: { lat, lng }, dataReferencia, observacao }
    encontro_atual JSONB,
    
    -- Vínculos e Metadados
    lider_id UUID REFERENCES public.lideres(id) ON DELETE SET NULL,
    lider_email TEXT,
    lider_user_id UUID,
    criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    atualizado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Foreign key de celula_id na tabela lideres
ALTER TABLE public.lideres 
    DROP CONSTRAINT IF EXISTS fk_lideres_celula;
ALTER TABLE public.lideres 
    ADD CONSTRAINT fk_lideres_celula FOREIGN KEY (celula_id) REFERENCES public.celulas(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_celulas_ativo ON public.celulas(ativo);
CREATE INDEX IF NOT EXISTS idx_celulas_bairro ON public.celulas(bairro);
CREATE INDEX IF NOT EXISTS idx_celulas_perfil ON public.celulas(perfil);
CREATE INDEX IF NOT EXISTS idx_lideres_email ON public.lideres(email);
CREATE INDEX IF NOT EXISTS idx_lideres_user_id ON public.lideres(user_id);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.lideres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celulas ENABLE ROW LEVEL SECURITY;

-- Políticas para CÉLULAS:
CREATE POLICY "Visualização pública de células ativas"
    ON public.celulas FOR SELECT
    USING (ativo = TRUE OR auth.role() = 'authenticated');

CREATE POLICY "Líderes e admins podem gerenciar células"
    ON public.celulas FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- Políticas para LÍDERES:
CREATE POLICY "Leitura de líderes autenticados"
    ON public.lideres FOR SELECT
    USING (TRUE);

CREATE POLICY "Admin gerencia líderes"
    ON public.lideres FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- Habilitar Publicação Realtime para a tabela celulas
ALTER PUBLICATION supabase_realtime ADD TABLE public.celulas;

-- 4. FUNÇÃO TRIGGER PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.atualizado_em = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_celulas_timestamp
BEFORE UPDATE ON public.celulas
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trigger_lideres_timestamp
BEFORE UPDATE ON public.lideres
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();
