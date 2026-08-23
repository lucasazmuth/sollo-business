-- =============================================================
-- Fecha a superfície de RPC.
--
-- Toda função em `public` fica exposta em /rest/v1/rpc por padrão, e
-- `SECURITY DEFINER` roda com poder de dono. A combinação significava
-- que o `anon` podia chamar coisas como `emit_notification_event`
-- (fabricar notificação para qualquer usuário) ou mexer no local de
-- qualquer vaga.
--
-- Regra adotada: REVOKE de PUBLIC em tudo, GRANT explícito só no que o
-- app realmente chama. `revoke ... from anon, authenticated` não basta —
-- o privilégio vem de PUBLIC, que os dois papéis herdam.
-- =============================================================

-- ---------- 1. Tapa o buraco do set_job_location ----------

-- A cláusula `or auth.uid() is null` existia para o seed rodar sem
-- sessão. Com a função exposta ao anon, virava "qualquer um move
-- qualquer vaga". Some daqui; o seed usa a versão admin abaixo.
create or replace function public.set_job_location(
  p_job_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_endereco text default null,
  p_cidade text default null,
  p_uf char(2) default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'não autenticado';
  end if;

  update public.jobs
     set point = extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
         endereco_texto = coalesce(p_endereco, endereco_texto),
         cidade = coalesce(p_cidade, cidade),
         uf = coalesce(p_uf, uf)
   where id = p_job_id
     and hirer_id = (select auth.uid());
end;
$$;

create or replace function public.admin_set_job_location(
  p_job_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_endereco text default null,
  p_cidade text default null,
  p_uf char(2) default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.jobs
     set point = extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
         endereco_texto = coalesce(p_endereco, endereco_texto),
         cidade = coalesce(p_cidade, cidade),
         uf = coalesce(p_uf, uf)
   where id = p_job_id;
end;
$$;

-- ---------- 2. Alcance sem vazar quem são as pessoas ----------

-- O app só precisa do NÚMERO de profissionais alcançados. Devolver a
-- lista de ids abria a base de profissionais de uma região para
-- qualquer contratante.
create or replace function public.job_reach_count(p_job_id uuid)
returns int
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.jobs j
     where j.id = p_job_id and j.hirer_id = (select auth.uid())
  ) then
    return 0;  -- só o dono da vaga enxerga o alcance
  end if;

  return (select count(*)::int from public.candidates_for_job(p_job_id));
end;
$$;

-- ---------- 3. Revoga tudo, libera o necessário ----------

do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as assinatura
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.prokind = 'f'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.assinatura);
  end loop;
end;
$$;

-- Só estas são chamadas pelo app com sessão de usuário.
grant execute on function public.jobs_feed_para_mim(int, uuid[], boolean, int, int) to authenticated;
grant execute on function public.jobs_count_no_raio(int)                            to authenticated;
grant execute on function public.set_professional_location(double precision, double precision, text, int) to authenticated;
grant execute on function public.set_job_location(uuid, double precision, double precision, text, text, char) to authenticated;
grant execute on function public.job_reach_count(uuid)                              to authenticated;

-- Usadas dentro de policies de RLS: precisam rodar como o usuário.
grant execute on function public.is_job_owner(uuid)              to authenticated;
grant execute on function public.is_conversation_member(uuid)    to authenticated;
grant execute on function public.my_account_type()               to authenticated;
grant execute on function public.me_candidatei(uuid)             to authenticated;
grant execute on function public.vaga_aceita_candidatura(uuid)   to authenticated;
grant execute on function public.fui_selecionado(uuid)           to authenticated;

-- Backend: Edge Function, seeds e manutenção.
grant execute on function public.candidates_for_job(uuid)                     to service_role;
grant execute on function public.admin_set_professional_location(uuid, double precision, double precision, text, int) to service_role;
grant execute on function public.admin_set_job_location(uuid, double precision, double precision, text, text, char)   to service_role;
grant execute on function public.reprocessar_notificacoes_pendentes(int)      to service_role;
grant execute on function public.jobs_feed(extensions.geography, int, uuid[], boolean, int, int) to service_role;

-- Funções de trigger não têm por que ser chamáveis por ninguém: o
-- Postgres as executa como dono da tabela, sem passar por GRANT.
