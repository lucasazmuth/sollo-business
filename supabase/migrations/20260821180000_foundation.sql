-- =============================================================
-- Fundação: extensões, enums e utilitários compartilhados.
-- Extensões vão para o schema `extensions` (o linter do Supabase
-- reclama de extensão em `public`), então tipos e funções do
-- PostGIS são sempre qualificados ou alcançados via search_path.
-- =============================================================

create schema if not exists extensions;

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists postgis     with schema extensions;
create extension if not exists pg_net      with schema extensions;

-- ---------- Enums ----------

create type public.account_type as enum ('profissional', 'contratante');

create type public.job_status as enum (
  'rascunho',    -- ainda não publicada
  'aberta',      -- recebendo candidaturas
  'preenchida',  -- candidato selecionado
  'encerrada',   -- data passou
  'cancelada'    -- contratante desistiu
);

create type public.application_status as enum (
  'aplicada',
  'vista',
  'selecionada',
  'recusada',
  'retirada'     -- profissional desistiu
);

create type public.pay_type as enum ('valor', 'a_combinar');

-- ---------- Utilitários ----------

-- Mantém `updated_at` sem precisar lembrar disso em cada UPDATE.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.touch_updated_at is
  'Trigger BEFORE UPDATE: atualiza updated_at.';
