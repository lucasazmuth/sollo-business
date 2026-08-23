-- =============================================================
-- Identidade: perfis, taxonomia de categorias e portfólio.
-- `profiles` é 1:1 com auth.users; os dois perfis especializados
-- pendem dele conforme o tipo de conta.
-- =============================================================

-- ---------- Categorias ----------

create table public.categories (
  id         uuid primary key default extensions.uuid_generate_v4(),
  slug       text not null unique,
  nome       text not null,
  grupo      text not null,
  ordem      int  not null default 0,
  ativa      boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.categories is
  'Áreas do entretenimento. MVP começa enxuto de propósito: taxonomia grande com base pequena fragmenta o feed.';

-- ---------- Perfil base ----------

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  tipo         public.account_type not null,
  nome         text not null,
  avatar_url   text,
  telefone     text,
  cidade       text,
  uf           char(2),
  bio          text,
  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profiles_tipo_idx on public.profiles (tipo);

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------- Perfil do profissional ----------

create table public.professional_profiles (
  profile_id   uuid primary key references public.profiles (id) on delete cascade,
  headline     text,
  categorias   uuid[] not null default '{}',

  -- Ponto APROXIMADO (bairro), nunca o endereço exato: reduz exposição
  -- de dado pessoal sem prejudicar a busca por raio.
  base_point   extensions.geography(Point, 4326),
  base_label   text,
  raio_km      int not null default 30 check (raio_km between 1 and 300),

  disponivel   boolean not null default true,
  links        jsonb not null default '{}',
  rating_avg   numeric(3,2),
  rating_count int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Sem este índice a busca por raio degrada assim que a base cresce.
create index professional_base_point_idx
  on public.professional_profiles using gist (base_point);

create index professional_categorias_idx
  on public.professional_profiles using gin (categorias);

create index professional_disponivel_idx
  on public.professional_profiles (disponivel) where disponivel;

create trigger professional_profiles_touch
  before update on public.professional_profiles
  for each row execute function public.touch_updated_at();

-- ---------- Portfólio (grade do perfil) ----------

create table public.portfolio_items (
  id         uuid primary key default extensions.uuid_generate_v4(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  media_url  text not null,
  legenda    text,
  ordem      int not null default 0,
  created_at timestamptz not null default now()
);

create index portfolio_profile_idx on public.portfolio_items (profile_id, ordem);

-- ---------- Perfil do contratante ----------

create table public.hirer_profiles (
  profile_id   uuid primary key references public.profiles (id) on delete cascade,
  empresa      text,
  sobre        text,
  site         text,
  logo_url     text,
  rating_avg   numeric(3,2),
  rating_count int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger hirer_profiles_touch
  before update on public.hirer_profiles
  for each row execute function public.touch_updated_at();

-- ---------- Criação automática do perfil no signup ----------

-- O app envia { nome, tipo } em options.data no signUp; aqui isso
-- vira o perfil e o perfil especializado, numa transação só.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo public.account_type;
  v_nome text;
begin
  v_tipo := coalesce(
    nullif(new.raw_user_meta_data ->> 'tipo', '')::public.account_type,
    'profissional'
  );
  v_nome := coalesce(
    nullif(new.raw_user_meta_data ->> 'nome', ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, tipo, nome)
  values (new.id, v_tipo, v_nome);

  if v_tipo = 'profissional' then
    insert into public.professional_profiles (profile_id) values (new.id);
  else
    insert into public.hirer_profiles (profile_id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
