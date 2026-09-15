-- ============================================================
-- APP CÉLULAS TIMÓTEO - SCHEMA PARA MEMBROS E CHAMADAS
-- ============================================================

-- 1. TABELA DE MEMBROS DA CÉLULA
CREATE TABLE IF NOT EXISTS public.membros_celula (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    data_aniversario TEXT,
    endereco TEXT,
    whatsapp TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    atualizado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_membros_celula_id ON public.membros_celula(celula_id);
CREATE INDEX IF NOT EXISTS idx_membros_ativo ON public.membros_celula(ativo);

-- 2. TABELA DE CHAMADAS E FREQUÊNCIA DA CÉLULA
CREATE TABLE IF NOT EXISTS public.chamadas_celula (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
    data_encontro DATE NOT NULL,
    tema TEXT,
    observacoes TEXT,
    presencas JSONB NOT NULL DEFAULT '[]'::jsonb,
    visitantes JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_presentes INTEGER DEFAULT 0 NOT NULL,
    total_faltas INTEGER DEFAULT 0 NOT NULL,
    total_visitantes INTEGER DEFAULT 0 NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    atualizado_em TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chamadas_celula_id ON public.chamadas_celula(celula_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_data ON public.chamadas_celula(data_encontro);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.membros_celula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamadas_celula ENABLE ROW LEVEL SECURITY;

-- Políticas para Membros
CREATE POLICY "Líderes autenticados gerenciam membros"
    ON public.membros_celula FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

CREATE POLICY "Leitura de membros autenticados"
    ON public.membros_celula FOR SELECT
    TO authenticated
    USING (TRUE);

-- Políticas para Chamadas
CREATE POLICY "Líderes autenticados gerenciam chamadas"
    ON public.chamadas_celula FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

CREATE POLICY "Leitura de chamadas autenticadas"
    ON public.chamadas_celula FOR SELECT
    TO authenticated
    USING (TRUE);

-- 4. TRIGGERS PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE TRIGGER trigger_membros_timestamp
BEFORE UPDATE ON public.membros_celula
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trigger_chamadas_timestamp
BEFORE UPDATE ON public.chamadas_celula
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- Habilitar Publicação Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.membros_celula;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chamadas_celula;
