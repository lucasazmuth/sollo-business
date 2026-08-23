-- =============================================================
-- Chat 1:1 por candidatura e avaliações.
-- =============================================================

create table public.conversations (
  id              uuid primary key default extensions.uuid_generate_v4(),
  job_id          uuid not null references public.jobs (id) on delete cascade,
  hirer_id        uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),

  unique (job_id, professional_id)
);

create index conversations_hirer_idx on public.conversations (hirer_id, last_message_at desc nulls last);
create index conversations_prof_idx  on public.conversations (professional_id, last_message_at desc nulls last);

create table public.messages (
  id              uuid primary key default extensions.uuid_generate_v4(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  corpo           text not null check (length(trim(corpo)) > 0),
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at desc);

-- A conversa nasce junto com a candidatura: quando o contratante quiser
-- falar, o canal já existe.
create or replace function public.applications_open_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.conversations (job_id, hirer_id, professional_id)
  select new.job_id, j.hirer_id, new.professional_id
    from public.jobs j
   where j.id = new.job_id
  on conflict (job_id, professional_id) do nothing;

  return new;
end;
$$;

create trigger applications_open_conversation_trigger
  after insert on public.applications
  for each row execute function public.applications_open_conversation();

create or replace function public.messages_touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation_trigger
  after insert on public.messages
  for each row execute function public.messages_touch_conversation();

-- ---------- Avaliações ----------

create table public.ratings (
  id         uuid primary key default extensions.uuid_generate_v4(),
  job_id     uuid not null references public.jobs (id) on delete cascade,
  rater_id   uuid not null references public.profiles (id) on delete cascade,
  rated_id   uuid not null references public.profiles (id) on delete cascade,
  nota       int  not null check (nota between 1 and 5),
  comentario text,
  created_at timestamptz not null default now(),

  unique (job_id, rater_id, rated_id),
  constraint ratings_sem_autoavaliacao check (rater_id <> rated_id)
);

create index ratings_rated_idx on public.ratings (rated_id, created_at desc);

-- Mantém a média denormalizada nos perfis: o feed lê isso o tempo todo.
create or replace function public.ratings_recompute()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alvo  uuid := coalesce(new.rated_id, old.rated_id);
  v_avg   numeric(3,2);
  v_count int;
  v_tipo  public.account_type;
begin
  select round(avg(nota)::numeric, 2), count(*)
    into v_avg, v_count
    from public.ratings
   where rated_id = v_alvo;

  select tipo into v_tipo from public.profiles where id = v_alvo;

  if v_tipo = 'profissional' then
    update public.professional_profiles
       set rating_avg = v_avg, rating_count = v_count
     where profile_id = v_alvo;
  else
    update public.hirer_profiles
       set rating_avg = v_avg, rating_count = v_count
     where profile_id = v_alvo;
  end if;

  return null;
end;
$$;

create trigger ratings_recompute_trigger
  after insert or update or delete on public.ratings
  for each row execute function public.ratings_recompute();
