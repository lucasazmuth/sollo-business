-- =============================================================
-- Vagas e candidaturas — o núcleo do marketplace.
-- =============================================================

create table public.jobs (
  id               uuid primary key default extensions.uuid_generate_v4(),
  hirer_id         uuid not null references public.profiles (id) on delete cascade,

  titulo           text not null,
  descricao        text not null,
  cover_url        text,
  category_id      uuid not null references public.categories (id),

  -- Coordenada resolvida UMA vez, na criação (Google Places ou GPS).
  -- Nenhuma busca de vaga chama API externa depois disso.
  endereco_texto   text,
  cidade           text,
  uf               char(2),
  point            extensions.geography(Point, 4326),

  starts_at        timestamptz not null,
  duracao_horas    numeric(4,1),

  is_urgent        boolean not null default false,
  requires_invoice boolean not null default false,

  pay_type         public.pay_type not null default 'a_combinar',
  pay_amount       numeric(10,2),
  vagas_qtd        int not null default 1 check (vagas_qtd >= 1),

  status           public.job_status not null default 'rascunho',
  published_at     timestamptz,
  closed_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint jobs_valor_coerente
    check (pay_type = 'a_combinar' or pay_amount is not null)
);

create index jobs_point_idx      on public.jobs using gist (point);
create index jobs_status_idx     on public.jobs (status, starts_at);
create index jobs_hirer_idx      on public.jobs (hirer_id, status, created_at desc);
create index jobs_category_idx   on public.jobs (category_id);
create index jobs_abertas_idx    on public.jobs (starts_at) where status = 'aberta';

create trigger jobs_touch
  before update on public.jobs
  for each row execute function public.touch_updated_at();

comment on column public.jobs.is_urgent is
  'Marcada pelo contratante ou inferida na publicação quando starts_at cai dentro de 72h.';

-- Vaga que começa em até 72h é urgente por definição, mesmo que o
-- contratante não marque — é justamente o caso que o produto existe para servir.
create or replace function public.jobs_infer_urgency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'aberta' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'aberta' and new.starts_at <= now() + interval '72 hours' then
    new.is_urgent := true;
  end if;

  return new;
end;
$$;

create trigger jobs_infer_urgency_trigger
  before insert or update of status, starts_at on public.jobs
  for each row execute function public.jobs_infer_urgency();

-- ---------- Candidaturas ----------

create table public.applications (
  id              uuid primary key default extensions.uuid_generate_v4(),
  job_id          uuid not null references public.jobs (id) on delete cascade,
  professional_id uuid not null references public.profiles (id) on delete cascade,
  status          public.application_status not null default 'aplicada',
  mensagem        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (job_id, professional_id)
);

create index applications_job_idx  on public.applications (job_id, status, created_at desc);
create index applications_prof_idx on public.applications (professional_id, created_at desc);

create trigger applications_touch
  before update on public.applications
  for each row execute function public.touch_updated_at();

-- Selecionar um candidato fecha a vaga e recusa os demais, em uma transação.
create or replace function public.applications_on_select()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'selecionada' and old.status is distinct from 'selecionada' then
    update public.applications
       set status = 'recusada'
     where job_id = new.job_id
       and id <> new.id
       and status in ('aplicada', 'vista');

    update public.jobs
       set status = 'preenchida', closed_at = now()
     where id = new.job_id;
  end if;

  return new;
end;
$$;

create trigger applications_on_select_trigger
  after update of status on public.applications
  for each row execute function public.applications_on_select();
