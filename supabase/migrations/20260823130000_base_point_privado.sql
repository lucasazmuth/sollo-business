-- =============================================================
-- base_point sai da vitrine e vai para os dados pessoais.
--
-- `professional_profiles` tem SELECT `using (true)` (é a vitrine que
-- o contratante consulta antes de escolher). Com `base_point` ali,
-- qualquer usuário autenticado conseguia baixar a coordenada da base
-- de TODOS os profissionais — é geolocalização, dado pessoal na LGPD.
--
-- A coordenada já é gravada arredondada (~1 km) e o bairro (`base_label`)
-- é exibido de propósito no perfil público. A diferença é que um rótulo
-- de bairro numa tela não é a mesma coisa que uma coluna de coordenadas
-- baixável em massa por qualquer conta.
--
-- O que fica público continua público: `base_label`, `raio_km` e o novo
-- `base_definida`. As funções de raio são SECURITY DEFINER, então
-- continuam lendo a coordenada normalmente — o motor não muda.
-- =============================================================

alter table public.dados_pessoais
  add column if not exists base_point extensions.geography(Point, 4326);

-- Sem este índice a busca por raio degrada (era GiST em professional_profiles).
create index if not exists dados_pessoais_base_point_idx
  on public.dados_pessoais using gist (base_point);

-- Sinal público de "já configurou onde atua". O app só precisa disso;
-- ler a coordenada só para checar se ela existe era o que forçava a
-- exposição.
alter table public.professional_profiles
  add column if not exists base_definida boolean not null default false;

-- ---------- Migra o que já existe ----------

insert into public.dados_pessoais (profile_id, base_point)
select pp.profile_id, pp.base_point
  from public.professional_profiles pp
 where pp.base_point is not null
on conflict (profile_id) do update set base_point = excluded.base_point;

update public.professional_profiles
   set base_definida = true
 where base_point is not null;

-- ---------- Funções de raio passam a ler de dados_pessoais ----------

create or replace function public.set_professional_location(
  p_lat   double precision,
  p_lng   double precision,
  p_label text default null,
  p_raio_km int default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_lat double precision := round(p_lat::numeric, 2);
  v_lng double precision := round(p_lng::numeric, 2);
begin
  if v_uid is null then
    raise exception 'não autenticado';
  end if;

  insert into public.dados_pessoais (profile_id, base_point)
  values (v_uid, extensions.st_setsrid(extensions.st_makepoint(v_lng, v_lat), 4326)::extensions.geography)
  on conflict (profile_id) do update set base_point = excluded.base_point;

  update public.professional_profiles
     set base_label    = coalesce(p_label, base_label),
         raio_km       = coalesce(p_raio_km, raio_km),
         base_definida = true
   where profile_id = v_uid;
end;
$$;

comment on function public.set_professional_location is
  'Grava a localização base do profissional com precisão de ~1 km (LGPD), em dados_pessoais (RLS de dono).';

create or replace function public.admin_set_professional_location(
  p_profile_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_label text default null,
  p_raio_km int default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.dados_pessoais (profile_id, base_point)
  values (p_profile_id, extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography)
  on conflict (profile_id) do update set base_point = excluded.base_point;

  update public.professional_profiles
     set base_label    = coalesce(p_label, base_label),
         raio_km       = coalesce(p_raio_km, raio_km),
         base_definida = true
   where profile_id = p_profile_id;
end;
$$;

revoke execute on function public.admin_set_professional_location from anon, authenticated;

create or replace function public.candidates_for_job(p_job_id uuid)
returns table (profile_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select pp.profile_id
    from public.jobs j
    join public.professional_profiles pp
      on pp.disponivel
     and j.category_id = any (pp.categorias)
    join public.dados_pessoais d
      on d.profile_id = pp.profile_id
     and d.base_point is not null
     -- O raio é o do PROFISSIONAL: "até onde eu topo ir".
     and extensions.st_dwithin(d.base_point, j.point, pp.raio_km * 1000)
    join public.notification_prefs np
      on np.profile_id = pp.profile_id
     and np.push_vagas
     and not (j.category_id = any (np.categorias_mudas))
   where j.id = p_job_id
     and j.point is not null
     -- Teto diário de notificações de vaga.
     and (
       select count(*)
         from public.notifications n
        where n.profile_id = pp.profile_id
          and n.evento = 'job.published.nearby'
          and n.created_at > now() - interval '24 hours'
     ) < np.max_push_vagas_dia;
$$;

create or replace function public.jobs_feed_para_mim(
  p_raio_km     int     default null,
  p_categorias  uuid[]  default null,
  p_only_urgent boolean default false,
  p_limit       int     default 20,
  p_offset      int     default 0
)
returns table (
  id               uuid,
  titulo           text,
  descricao        text,
  cover_url        text,
  cidade           text,
  uf               char(2),
  starts_at        timestamptz,
  is_urgent        boolean,
  requires_invoice boolean,
  pay_type         public.pay_type,
  pay_amount       numeric,
  category_id      uuid,
  hirer_id         uuid,
  hirer_nome       text,
  hirer_avatar     text,
  distancia_km     numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid        uuid := (select auth.uid());
  v_point      extensions.geography;
  v_raio       int;
  v_categorias uuid[];
begin
  select d.base_point,
         coalesce(p_raio_km, pp.raio_km),
         case
           when p_categorias is not null then p_categorias
           when array_length(pp.categorias, 1) > 0 then pp.categorias
           else null
         end
    into v_point, v_raio, v_categorias
    from public.professional_profiles pp
    left join public.dados_pessoais d on d.profile_id = pp.profile_id
   where pp.profile_id = v_uid;

  if v_point is null then
    return;  -- sem base definida: nada a mostrar
  end if;

  return query
    select * from public.jobs_feed(
      v_point, coalesce(v_raio, 30), v_categorias, p_only_urgent, p_limit, p_offset
    );
end;
$$;

create or replace function public.jobs_count_no_raio(p_raio_km int)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
    from public.dados_pessoais d
    join public.jobs j
      on j.status = 'aberta'
     and j.starts_at > now()
     and j.point is not null
     and extensions.st_dwithin(j.point, d.base_point, p_raio_km * 1000)
   where d.profile_id = (select auth.uid())
     and d.base_point is not null;
$$;

-- ---------- Só depois de tudo migrado, derruba a coluna exposta ----------

drop index if exists public.professional_base_point_idx;
alter table public.professional_profiles drop column if exists base_point;
