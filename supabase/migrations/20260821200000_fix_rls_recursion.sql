-- =============================================================
-- Corrige recursão infinita entre as policies de `jobs` e `applications`.
--
-- O ciclo:
--   SELECT em jobs        → policy consulta applications
--   INSERT em applications → policy consulta jobs
--   → "infinite recursion detected in policy for relation applications"
--
-- A saída é a mesma já usada em `is_job_owner`: mover a consulta
-- cruzada para uma função SECURITY DEFINER, que roda fora da RLS e
-- por isso não reentra na policy da outra tabela.
-- =============================================================

/** Me candidatei a esta vaga? (não reentra na RLS de applications) */
create or replace function public.me_candidatei(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.applications a
     where a.job_id = p_job_id
       and a.professional_id = (select auth.uid())
  );
$$;

/** Vaga está aberta e ainda no futuro? (não reentra na RLS de jobs) */
create or replace function public.vaga_aceita_candidatura(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.jobs j
     where j.id = p_job_id
       and j.status = 'aberta'
       and j.starts_at > now()
  );
$$;

-- ---------- jobs: SELECT sem tocar em applications ----------

drop policy if exists "vejo vagas abertas, minhas e as que me candidatei" on public.jobs;

create policy "vejo vagas abertas, minhas e as que me candidatei"
  on public.jobs for select to authenticated
  using (
    status = 'aberta'
    or hirer_id = (select auth.uid())
    or public.me_candidatei(id)
  );

-- ---------- applications: INSERT sem tocar em jobs ----------

drop policy if exists "profissional se candidata a vaga aberta" on public.applications;

create policy "profissional se candidata a vaga aberta"
  on public.applications for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and public.my_account_type() = 'profissional'
    and public.vaga_aceita_candidatura(job_id)
  );

-- ---------- ratings: mesmo padrão, mesma armadilha ----------

drop policy if exists "avalio quem trabalhou comigo" on public.ratings;

create or replace function public.fui_selecionado(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.applications a
     where a.job_id = p_job_id
       and a.professional_id = (select auth.uid())
       and a.status = 'selecionada'
  );
$$;

create policy "avalio quem trabalhou comigo"
  on public.ratings for insert to authenticated
  with check (
    rater_id = (select auth.uid())
    and (public.is_job_owner(job_id) or public.fui_selecionado(job_id))
  );
