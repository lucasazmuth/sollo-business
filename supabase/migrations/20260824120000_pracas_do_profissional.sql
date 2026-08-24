-- =============================================================
-- Atuar fora do raio: praças adicionais.
--
-- Até aqui "onde eu atuo" era um ponto e um raio, e só. Isso descreve bem
-- quem pega job na própria cidade, e descreve mal boa parte do mercado: o
-- fotógrafo mora em São Paulo, tem cliente no Rio, e viaja para o job. Com
-- raio de 100 km ele nunca vê a vaga do Rio — e, pior, `candidates_for_job`
-- nunca o inclui no fanout, então ele também não é avisado. O raio é bom
-- para "estou perto"; não serve para "eu atendo lá".
--
-- Entra uma lista de praças por profissional. `cidade` nula significa o
-- estado inteiro ("atendo o RJ"), que é como as pessoas de fato pensam
-- quando viajam para trabalhar.
--
-- As vagas já guardam `cidade` e `uf` desde a Fase 0, então o casamento é
-- um join de texto: não precisa de coordenada, funciona no navegador (onde
-- não há geocoder nativo) e não custa nada ao motor de raio, que continua
-- exatamente como está para quem só atende perto.
-- =============================================================

create table if not exists public.professional_areas (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  uf         char(2) not null,
  -- Nula = estado inteiro.
  cidade     text,
  created_at timestamptz not null default now(),

  -- `coalesce` porque unique() trata NULLs como distintos entre si, e sem
  -- isso dava para inserir "RJ inteiro" quantas vezes quisesse.
  unique (profile_id, uf, cidade)
);

create index if not exists professional_areas_lugar_idx
  on public.professional_areas (uf, cidade);

comment on table public.professional_areas is
  'Praças que o profissional atende além do próprio raio. cidade nula = estado inteiro.';

-- ---------- RLS: vitrine pública, escrita só do dono ----------

alter table public.professional_areas enable row level security;

-- Onde alguém atende é informação de vitrine, como categoria e headline:
-- o contratante precisa ver antes de decidir.
create policy "praças são públicas"
  on public.professional_areas for select to authenticated
  using (true);

create policy "defino minhas praças"
  on public.professional_areas for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy "removo minhas praças"
  on public.professional_areas for delete to authenticated
  using (profile_id = (select auth.uid()));

-- ---------- Fanout passa a considerar as praças ----------

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
    left join public.dados_pessoais d
      on d.profile_id = pp.profile_id
    join public.notification_prefs np
      on np.profile_id = pp.profile_id
     and np.push_vagas
     and not (j.category_id = any (np.categorias_mudas))
   where j.id = p_job_id
     and (
       -- Perto da base: o raio é o do PROFISSIONAL ("até onde eu topo ir").
       (
         j.point is not null
         and d.base_point is not null
         and extensions.st_dwithin(d.base_point, j.point, pp.raio_km * 1000)
       )
       -- Ou numa praça que ele declarou atender, por longe que seja.
       or exists (
         select 1
           from public.professional_areas a
          where a.profile_id = pp.profile_id
            and a.uf = j.uf
            and (a.cidade is null or a.cidade = j.cidade)
       )
     )
     -- Teto diário de notificações de vaga.
     and (
       select count(*)
         from public.notifications n
        where n.profile_id = pp.profile_id
          and n.evento = 'job.published.nearby'
          and n.created_at > now() - interval '24 hours'
     ) < np.max_push_vagas_dia;
$$;

comment on function public.candidates_for_job is
  'Quem notificar de uma vaga: quem está no raio da própria base OU declarou atender aquela praça.';

-- ---------- Feed: filtrar por lugar em vez de por raio ----------

create or replace function public.jobs_feed(
  p_point       extensions.geography default null,
  p_raio_km     int     default 50,
  p_categorias  uuid[]  default null,
  p_only_urgent boolean default false,
  p_limit       int     default 20,
  p_offset      int     default 0,
  p_uf          char(2) default null,
  p_cidade      text    default null
)
returns table (
  id            uuid,
  titulo        text,
  descricao     text,
  cover_url     text,
  cidade        text,
  uf            char(2),
  starts_at     timestamptz,
  is_urgent     boolean,
  requires_invoice boolean,
  pay_type      public.pay_type,
  pay_amount    numeric,
  category_id   uuid,
  hirer_id      uuid,
  hirer_nome    text,
  hirer_avatar  text,
  distancia_km  numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    j.id, j.titulo, j.descricao, j.cover_url, j.cidade, j.uf,
    j.starts_at, j.is_urgent, j.requires_invoice,
    j.pay_type, j.pay_amount, j.category_id,
    j.hirer_id, p.nome, p.avatar_url,
    case
      when p_point is null or j.point is null then null
      else round((extensions.st_distance(j.point, p_point) / 1000)::numeric, 1)
    end
  from public.jobs j
  join public.profiles p on p.id = j.hirer_id
  where j.status = 'aberta'
    and j.starts_at > now()
    and (p_categorias is null or j.category_id = any (p_categorias))
    and (not p_only_urgent or j.is_urgent)
    -- Escolher um lugar SUBSTITUI o raio: quem filtra por "RJ" está dizendo
    -- que a distância até a própria casa deixou de ser o critério.
    and (
      case
        when p_uf is not null then
          j.uf = p_uf and (p_cidade is null or j.cidade = p_cidade)
        else
          p_point is null
          or j.point is null
          or extensions.st_dwithin(j.point, p_point, p_raio_km * 1000)
      end
    )
  -- Urgente primeiro, depois perto, depois o que começa antes.
  order by
    j.is_urgent desc,
    case when p_point is null or j.point is null then 0
         else extensions.st_distance(j.point, p_point) end asc,
    j.starts_at asc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

create or replace function public.jobs_feed_para_mim(
  p_raio_km     int     default null,
  p_categorias  uuid[]  default null,
  p_only_urgent boolean default false,
  p_limit       int     default 20,
  p_offset      int     default 0,
  p_uf          char(2) default null,
  p_cidade      text    default null
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

  -- Sem base definida o feed por raio não tem de onde partir. Com um lugar
  -- escolhido, tem: quem ainda não configurou a base consegue olhar o Rio.
  if v_point is null and p_uf is null then
    return;
  end if;

  return query
    select * from public.jobs_feed(
      v_point, coalesce(v_raio, 30), v_categorias, p_only_urgent,
      p_limit, p_offset, p_uf, p_cidade
    );
end;
$$;

-- ---------- Que praças existem, de verdade ----------

-- Alimenta o filtro com lugares que TÊM vaga aberta agora. Uma lista fixa de
-- 27 estados manda a pessoa para dez telas vazias; esta manda para onde há
-- trabalho.
create or replace function public.lugares_com_vagas()
returns table (uf char(2), cidade text, total int)
language sql
stable
security definer
set search_path = ''
as $$
  select j.uf, j.cidade, count(*)::int
    from public.jobs j
   where j.status = 'aberta'
     and j.starts_at > now()
     and j.uf is not null
   group by j.uf, j.cidade
   order by count(*) desc, j.uf, j.cidade;
$$;

revoke all on function public.lugares_com_vagas() from public, anon;
grant execute on function public.lugares_com_vagas() to authenticated;
