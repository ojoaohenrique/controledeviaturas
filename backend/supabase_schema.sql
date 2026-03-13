-- Esquema do Supabase para o Controle de Viaturas GML
-- Execute este script no SQL Editor do projeto Supabase.

-- Tabela de usuários de aplicação, vinculada ao auth.users
create table if not exists public.usuarios (
    id uuid primary key references auth.users (id) on delete cascade,
    nome text not null,
    email text not null unique,
    cargo text,
    criado_em timestamptz not null default now()
);

-- Tabela de viaturas
create table if not exists public.viaturas (
    id uuid primary key default gen_random_uuid(),
    prefixo text not null,
    modelo text,
    ativo boolean not null default true
);

-- Tabela de saídas de viaturas
create table if not exists public.saidas_viaturas (
    id uuid primary key default gen_random_uuid(),
    viatura_id uuid not null references public.viaturas (id),
    motorista text not null,
    patrulheiro text not null,
    inspetor text not null,
    km_saida numeric not null,
    data_saida timestamptz not null default now(),
    km_chegada numeric,
    km_rodado numeric,
    protocolo text,
    observacoes text,
    usuario_id uuid not null references public.usuarios (id),
    criado_em timestamptz not null default now()
);

-- Tabela de abastecimentos
create table if not exists public.abastecimentos (
    id uuid primary key default gen_random_uuid(),
    viatura_id uuid not null references public.viaturas (id),
    km_abastecimento numeric not null,
    km_atual numeric not null,
    litros numeric not null,
    km_rodado numeric not null,
    media numeric not null,
    data_abastecimento timestamptz not null default now(),
    usuario_id uuid not null references public.usuarios (id),
    criado_em timestamptz not null default now()
);

-- Ativar Row Level Security
alter table public.usuarios enable row level security;
alter table public.viaturas enable row level security;
alter table public.saidas_viaturas enable row level security;
alter table public.abastecimentos enable row level security;

-- Políticas básicas de acesso

-- Usuários só veem e alteram o próprio registro em usuarios
create policy if not exists "usuarios_select_own"
on public.usuarios
for select
using (auth.uid() = id);

create policy if not exists "usuarios_insert_own"
on public.usuarios
for insert
with check (auth.uid() = id);

-- Todas as viaturas ativas podem ser vistas por qualquer usuário autenticado
create policy if not exists "viaturas_select_all"
on public.viaturas
for select
using (auth.role() = 'authenticated');

-- Saídas e abastecimentos: leitura e escrita permitidas para usuários autenticados.
-- (A lógica de negócio pode filtrar por data/turno no backend.)

create policy if not exists "saidas_select_all"
on public.saidas_viaturas
for select
using (auth.role() = 'authenticated');

create policy if not exists "saidas_insert_authenticated"
on public.saidas_viaturas
for insert
with check (auth.role() = 'authenticated');

create policy if not exists "abastecimentos_select_all"
on public.abastecimentos
for select
using (auth.role() = 'authenticated');

create policy if not exists "abastecimentos_insert_authenticated"
on public.abastecimentos
for insert
with check (auth.role() = 'authenticated');

