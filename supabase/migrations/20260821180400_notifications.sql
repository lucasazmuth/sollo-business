-- =============================================================
-- Notificações — ponto único de entrada.
--
-- Toda notificação nasce em `notification_events` (outbox). Nada
-- dispara push ou e-mail direto: trigger → outbox → Edge Function.
-- Isso é o que torna a estrutura A→B padronizada e auditável.
-- =============================================================

create type public.notification_event as enum (
  'job.published.nearby',
  'application.received',
  'application.selected',
  'application.rejected',
  'message.received',
  'job.cancelled',
  'job.reminder',
  'rating.received'
);

create type public.delivery_channel as enum ('inapp', 'push', 'email');

-- ---------- Tokens de push (um por aparelho) ----------

create table public.device_tokens (
  id         uuid primary key default extensions.uuid_generate_v4(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  expo_token text not null unique,
  platform   text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index device_tokens_profile_idx on public.device_tokens (profile_id);

create trigger device_tokens_touch
  before update on public.device_tokens
  for each row execute function public.touch_updated_at();

-- ---------- Preferências ----------

create table public.notification_prefs (
  profile_id              uuid primary key references public.profiles (id) on delete cascade,

  push_vagas              boolean not null default true,
  email_vagas             boolean not null default true,   -- só dispara quando urgente
  push_candidaturas       boolean not null default true,
  email_candidaturas      boolean not null default true,
  push_chat               boolean not null default true,
  push_status             boolean not null default true,

  -- Contrapeso obrigatório do motor de urgência: sem teto e silêncio,
  -- o app é desinstalado em duas semanas.
  quiet_start             time not null default '22:00',
  quiet_end               time not null default '07:00',
  urgente_ignora_silencio boolean not null default false,
  max_push_vagas_dia      int not null default 5 check (max_push_vagas_dia between 0 and 50),
  categorias_mudas        uuid[] not null default '{}',

  updated_at              timestamptz not null default now()
);

create trigger notification_prefs_touch
  before update on public.notification_prefs
  for each row execute function public.touch_updated_at();

-- ---------- Outbox ----------

create table public.notification_events (
  id           uuid primary key default extensions.uuid_generate_v4(),
  evento       public.notification_event not null,
  actor_id     uuid references public.profiles (id) on delete set null,

  -- Vazio significa "resolver na Edge Function" — o caso do fanout por raio.
  target_ids   uuid[] not null default '{}',

  payload      jsonb not null default '{}',
  processed_at timestamptz,
  attempts     int not null default 0,
  error        text,
  created_at   timestamptz not null default now()
);

-- Fila de trabalho: só o que ainda não foi processado.
create index notification_events_pendentes_idx
  on public.notification_events (created_at)
  where processed_at is null;

-- ---------- Inbox ----------

create table public.notifications (
  id         uuid primary key default extensions.uuid_generate_v4(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  evento     public.notification_event not null,
  titulo     text not null,
  corpo      text not null,
  data       jsonb not null default '{}',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_profile_idx on public.notifications (profile_id, created_at desc);
create index notifications_unread_idx  on public.notifications (profile_id) where read_at is null;

-- Trava de duplicidade: a mesma vaga nunca notifica a mesma pessoa duas vezes.
create unique index notifications_job_dedupe_idx
  on public.notifications (profile_id, evento, (data ->> 'job_id'))
  where evento = 'job.published.nearby';

-- ---------- Log de entrega ----------

create table public.notification_deliveries (
  id              uuid primary key default extensions.uuid_generate_v4(),
  notification_id uuid not null references public.notifications (id) on delete cascade,
  canal           public.delivery_channel not null,
  status          text not null default 'pendente',
  provider_id     text,
  error           text,
  created_at      timestamptz not null default now(),

  unique (notification_id, canal)
);

-- ---------- Preferências nascem junto com o perfil ----------

create or replace function public.handle_new_profile_prefs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notification_prefs (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

create trigger on_profile_created_prefs
  after insert on public.profiles
  for each row execute function public.handle_new_profile_prefs();
