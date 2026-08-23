-- =============================================================
-- Fase 12 — cadastro completo do contratante.
--
-- Publicar vaga passa a exigir e-mail verificado + nome completo,
-- CPF e endereço. hirer_profiles ainda não tinha nenhum desses campos
-- (só empresa/sobre/site/logo). A RLS de UPDATE já cobre linha inteira,
-- então as colunas novas não precisam de política própria.
-- =============================================================

alter table public.hirer_profiles
  add column if not exists nome_completo text,
  add column if not exists cpf           text,
  add column if not exists cep           text,
  add column if not exists logradouro    text,
  add column if not exists numero        text,
  add column if not exists complemento   text,
  add column if not exists bairro        text,
  add column if not exists cidade        text,
  add column if not exists uf            char(2);

-- O e-mail confirmado vem de auth.users.email_confirmed_at, lido no app
-- via sessão — não entra aqui porque esta função só vê o schema public.
create or replace function public.hirer_cadastro_completo(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.hirer_profiles h
      join public.profiles p on p.id = h.profile_id
     where h.profile_id = p_profile_id
       and h.nome_completo is not null and length(trim(h.nome_completo)) > 0
       and h.cpf is not null and length(trim(h.cpf)) = 11
       and h.cep is not null and length(trim(h.cep)) > 0
       and h.logradouro is not null and length(trim(h.logradouro)) > 0
       and h.numero is not null and length(trim(h.numero)) > 0
       and p.telefone is not null and length(trim(p.telefone)) > 0
  );
$$;

revoke all on function public.hirer_cadastro_completo(uuid) from public, anon;
grant execute on function public.hirer_cadastro_completo(uuid) to authenticated;

-- Trava de defesa: publicar exige e-mail confirmado + cadastro completo,
-- não só ser dono da vaga. RLS não enxerga auth.users diretamente, então
-- o e-mail confirmado é checado via uma função que lê auth.users com
-- security definer (mesmo padrão de is_job_owner/me_candidatei).
create or replace function public.email_confirmado()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users
     where id = (select auth.uid())
       and email_confirmed_at is not null
  );
$$;

revoke all on function public.email_confirmado() from public, anon;
grant execute on function public.email_confirmado() to authenticated;

drop policy if exists "contratante publica vaga" on public.jobs;
create policy "contratante publica vaga"
  on public.jobs for insert to authenticated
  with check (
    hirer_id = (select auth.uid())
    and public.my_account_type() = 'contratante'
    and public.email_confirmado()
    and public.hirer_cadastro_completo((select auth.uid()))
  );
