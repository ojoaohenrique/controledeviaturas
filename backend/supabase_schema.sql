-- Esquema do Supabase para o Controle de Viaturas GML
-- ATUALIZADO: Alinhado com o JavaScript do Frontend e RLS liberado para testes

-- Limpar tabelas antigas (caso existam com formato errado)
DROP TABLE IF EXISTS public.saidas_viaturas CASCADE;
DROP TABLE IF EXISTS public.abastecimentos CASCADE;

-- Tabela de saídas de viaturas
CREATE TABLE IF NOT EXISTS public.saidas_viaturas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viatura         TEXT NOT NULL,
    km_saida        NUMERIC NOT NULL,
    km_chegada      NUMERIC,
    km_rodado       NUMERIC,
    protocolo       INTEGER,
    inspetor        TEXT,
    motorista       TEXT NOT NULL,
    patrulheiro     TEXT,
    patrulhamento   TEXT,
    status          TEXT NOT NULL DEFAULT 'em_operacao',
    observacoes     TEXT,
    fotos           TEXT[],
    data_saida      TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_chegada    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de abastecimentos
CREATE TABLE IF NOT EXISTS public.abastecimentos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viatura             TEXT NOT NULL,
    data_abastecimento  DATE NOT NULL,
    km_abastecimento    NUMERIC NOT NULL,
    km_atual            NUMERIC NOT NULL,
    litros              NUMERIC NOT NULL,
    km_rodado           NUMERIC,
    media_km_l          NUMERIC,
    motorista           TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar Row Level Security
alter table public.saidas_viaturas enable row level security;
alter table public.abastecimentos enable row level security;

-- Políticas de acesso: LIBERADO PARA TESTES (Permite qualquer um salvar e ver)
CREATE POLICY "Permitir tudo - saidas"
    ON public.saidas_viaturas FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY "Permitir tudo - abastecimentos"
    ON public.abastecimentos FOR ALL
    USING (true) WITH CHECK (true);
