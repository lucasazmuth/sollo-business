-- =============================================================
-- Row Level Security.
--
-- Princípios:
--   · perfil é vitrine → leitura pública para autenticados
--   · vaga aberta é pública; fechada, só para quem participou
--   · candidatura e mensagem só para as duas partes envolvidas
--   · tabelas de infraestrutura de notificação: só service_role
--
-- Policies usam (select auth.uid()) em vez de auth.uid() para o
-- Postgres avaliar uma vez por statement, não por linha.
-- =============================================================

-- ---------- Helpers (SECURITY DEFINER evita recursão de RLS) ----------

create or replace function public.is_job_owner(p_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.jobs j
     where j.id = p_job_id and j.hirer_id = (select auth.uid())
  );
$$;

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
     where c.id = p_conversation_id
       and (select auth.uid()) in (c.hirer_id, c.professional_id)
  );
$$;

create or replace function public.my_account_type()
returns public.account_type
language sql
stable
security definer
set search_path = ''
as $$
  select tipo from public.profiles where id = (select auth.uid());
$$;

-- ---------- Ativação ----------

alter table public.categories              enable row level security;
alter table public.profiles                enable row level security;
alter table public.professional_profiles   enable row level security;
alter table public.hirer_profiles          enable row level security;
alter table public.portfolio_items         enable row level security;
alter table public.jobs                    enable row level security;
alter table public.applications            enable row level security;
alter table public.conversations           enable row level security;
alter table public.messages                enable row level security;
alter table public.ratings                 enable row level security;
alter table public.device_tokens           enable row level security;
alter table public.notification_prefs      enable row level security;
alter table public.notifications           enable row level security;
alter table public.notification_events     enable row level security;
alter table public.notification_deliveries enable row level security;

-- ---------- Catálogo ----------

create policy "categorias são públicas"
  on public.categories for select to authenticated using (true);

-- ---------- Perfis ----------

create policy "perfis são vitrine"
  on public.profiles for select to authenticated using (true);

create policy "edito meu perfil"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "posso excluir minha conta"
  on public.profiles for delete to authenticated
  using (id = (select auth.uid()));

create policy "perfil profissional é vitrine"
  on public.professional_profiles for select to authenticated using (true);

create policy "edito meu perfil profissional"
  on public.professional_profiles for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

create policy "perfil de contratante é vitrine"
  on public.hirer_profiles for select to authenticated using (true);

create policy "edito meu perfil de contratante"
  on public.hirer_profiles for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

create policy "portfólio é vitrine"
  on public.portfolio_items for select to authenticated using (true);

create policy "gerencio meu portfólio"
  on public.portfolio_items for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- ---------- Vagas ----------

-- Vaga aberta é pública. Fechada ou cancelada continua visível para
-- quem publicou e para quem se candidatou — senão o histórico some.
create policy "vejo vagas abertas, minhas e as que me candidatei"
  on public.jobs for select to authenticated
  using (
    status = 'aberta'
    or hirer_id = (select auth.uid())
    or exists (
      select 1 from public.applications a
       where a.job_id = jobs.id and a.professional_id = (select auth.uid())
    )
  );

create policy "contratante publica vaga"
  on public.jobs for insert to authenticated
  with check (
    hirer_id = (select auth.uid())
    and public.my_account_type() = 'contratante'
  );

create policy "gerencio minhas vagas"
  on public.jobs for update to authenticated
  using (hirer_id = (select auth.uid())) with check (hirer_id = (select auth.uid()));

create policy "apago minhas vagas"
  on public.jobs for delete to authenticated
  using (hirer_id = (select auth.uid()));

-- ---------- Candidaturas ----------

create policy "vejo minhas candidaturas e as das minhas vagas"
  on public.applications for select to authenticated
  using (
    professional_id = (select auth.uid())
    or public.is_job_owner(job_id)
  );

create policy "profissional se candidata a vaga aberta"
  on public.applications for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and public.my_account_type() = 'profissional'
    and exists (
      select 1 from public.jobs j
       where j.id = job_id and j.status = 'aberta' and j.starts_at > now()
    )
  );

-- Profissional retira a candidatura; contratante seleciona ou recusa.
create policy "atualizo candidatura da qual participo"
  on public.applications for update to authenticated
  using (professional_id = (select auth.uid()) or public.is_job_owner(job_id))
  with check (professional_id = (select auth.uid()) or public.is_job_owner(job_id));

-- ---------- Chat ----------

create policy "vejo minhas conversas"
  on public.conversations for select to authenticated
  using ((select auth.uid()) in (hirer_id, professional_id));

create policy "vejo mensagens das minhas conversas"
  on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));

create policy "envio mensagem nas minhas conversas"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_member(conversation_id)
  );

create policy "marco mensagem como lida"
  on public.messages for update to authenticated
  using (public.is_conversation_member(conversation_id))
  with check (public.is_conversation_member(conversation_id));

-- ---------- Avaliações ----------

-- Reputação é pública: é o ativo que o profissional carrega.
create policy "avaliações são públicas"
  on public.ratings for select to authenticated using (true);

create policy "avalio quem trabalhou comigo"
  on public.ratings for insert to authenticated
  with check (
    rater_id = (select auth.uid())
    and (
      public.is_job_owner(job_id)
      or exists (
        select 1 from public.applications a
         where a.job_id = ratings.job_id
           and a.professional_id = (select auth.uid())
           and a.status = 'selecionada'
      )
    )
  );

-- ---------- Notificações ----------

create policy "gerencio meus tokens"
  on public.device_tokens for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

create policy "vejo minhas preferências"
  on public.notification_prefs for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "edito minhas preferências"
  on public.notification_prefs for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

create policy "vejo minhas notificações"
  on public.notifications for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "marco notificação como lida"
  on public.notifications for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- `notification_events` e `notification_deliveries` ficam sem policy de
-- propósito: RLS ligada e nenhuma policy = ninguém acessa pelo cliente.
-- Só a Edge Function (service_role) enxerga.
