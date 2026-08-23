-- =============================================================
-- CORREÇÃO DE VAZAMENTO DE DADOS PESSOAIS (LGPD)
--
-- `profiles` e `hirer_profiles` são tabelas-vitrine: a política de
-- SELECT é `using (true)`, porque o marketplace precisa que qualquer
-- pessoa veja nome, foto, empresa e reputação de quem vai contratar ou
-- ser contratado.
--
-- A Fase 12 acrescentou CPF, nome completo e endereço em
-- `hirer_profiles` — dentro de uma tabela pública. Resultado: qualquer
-- usuário autenticado lia o CPF e o endereço residencial de qualquer
-- contratante com um GET. O mesmo já valia para `profiles.telefone`.
-- Confirmado em teste com dois usuários reais antes desta migration.
--
-- Postgres não tem RLS por coluna (privilégio de coluna não enxerga
-- linha, então "o dono lê, os outros não" é impossível na mesma tabela).
-- A correção é separar: o que é vitrine fica onde está, o que é pessoal
-- vai para uma tabela com RLS de dono. Assim `select *` na vitrine volta
-- a ser seguro por construção, e não por lembrança de quem mexer nela.
-- =============================================================

create table if not exists public.dados_pessoais (
  profile_id    uuid primary key references public.profiles (id) on delete cascade,
  telefone      text,
  -- Exigidos do contratante antes de publicar a primeira vaga.
  nome_completo text,
  cpf           text,
  cep           text,
  logradouro    text,
  numero        text,
  complemento   text,
  bairro        text,
  cidade        text,
  uf            char(2),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.dados_pessoais is
  'Dados pessoais visíveis SOMENTE ao próprio dono. Nada aqui pode ser copiado para profiles/hirer_profiles, que são vitrines públicas.';

create trigger dados_pessoais_touch
  before update on public.dados_pessoais
  for each row execute function public.touch_updated_at();

-- ---------- Migra o que já existe, antes de derrubar as colunas ----------

insert into public.dados_pessoais (
  profile_id, telefone, nome_completo, cpf, cep, logradouro, numero, complemento, bairro, cidade, uf
)
select
  p.id, p.telefone, h.nome_completo, h.cpf, h.cep, h.logradouro,
  h.numero, h.complemento, h.bairro, h.cidade, h.uf
from public.profiles p
left join public.hirer_profiles h on h.profile_id = p.id
where p.telefone is not null or h.cpf is not null or h.nome_completo is not null
on conflict (profile_id) do nothing;

alter table public.hirer_profiles
  drop column if exists nome_completo,
  drop column if exists cpf,
  drop column if exists cep,
  drop column if exists logradouro,
  drop column if exists numero,
  drop column if exists complemento,
  drop column if exists bairro,
  drop column if exists cidade,
  drop column if exists uf;

alter table public.profiles drop column if exists telefone;

-- ---------- RLS: só o dono, em qualquer operação ----------

alter table public.dados_pessoais enable row level security;

create policy "leio meus dados pessoais"
  on public.dados_pessoais for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "crio meus dados pessoais"
  on public.dados_pessoais for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy "atualizo meus dados pessoais"
  on public.dados_pessoais for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- ---------- A checagem de cadastro completo passa a ler daqui ----------

create or replace function public.hirer_cadastro_completo(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.dados_pessoais d
     where d.profile_id = p_profile_id
       and d.nome_completo is not null and length(trim(d.nome_completo)) > 0
       and d.cpf is not null and length(trim(d.cpf)) = 11
       and d.cep is not null and length(trim(d.cep)) > 0
       and d.logradouro is not null and length(trim(d.logradouro)) > 0
       and d.numero is not null and length(trim(d.numero)) > 0
       and d.telefone is not null and length(trim(d.telefone)) > 0
  );
$$;

revoke all on function public.hirer_cadastro_completo(uuid) from public, anon;
grant execute on function public.hirer_cadastro_completo(uuid) to authenticated;
