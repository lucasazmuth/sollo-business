-- =============================================================
-- Feed a partir da base do próprio usuário.
--
-- O app não precisa (nem deveria) carregar a coordenada do usuário
-- para o cliente só para pedir o feed: a função resolve o ponto pelo
-- auth.uid(). Menos dado pessoal trafegando, menos chance de erro.
--
-- Se o profissional ainda não definiu a base, devolve vazio — o app
-- usa isso para mandar ele configurar "onde eu atuo".
-- =============================================================

create or replace function public.jobs_feed_para_mim(
  p_raio_km     int     default null,   -- null = usa o raio declarado no perfil
  p_categorias  uuid[]  default null,   -- null = usa as categorias do perfil
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
  v_point      extensions.geography;
  v_raio       int;
  v_categorias uuid[];
begin
  select pp.base_point,
         coalesce(p_raio_km, pp.raio_km),
         case
           when p_categorias is not null then p_categorias
           when array_length(pp.categorias, 1) > 0 then pp.categorias
           else null                        -- perfil sem categoria vê tudo
         end
    into v_point, v_raio, v_categorias
    from public.professional_profiles pp
   where pp.profile_id = (select auth.uid());

  if v_point is null then
    return;  -- sem base definida: nada a mostrar
  end if;

  return query
    select * from public.jobs_feed(
      v_point, coalesce(v_raio, 30), v_categorias, p_only_urgent, p_limit, p_offset
    );
end;
$$;

comment on function public.jobs_feed_para_mim is
  'Feed do profissional logado: usa a base e o raio do próprio perfil, com filtros opcionais.';

-- Quantas vagas abertas existem no raio, ignorando filtros — usado para
-- dizer "aumente o raio" com número, em vez de um vazio mudo.
create or replace function public.jobs_count_no_raio(p_raio_km int)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
    from public.professional_profiles pp
    join public.jobs j
      on j.status = 'aberta'
     and j.starts_at > now()
     and j.point is not null
     and extensions.st_dwithin(j.point, pp.base_point, p_raio_km * 1000)
   where pp.profile_id = (select auth.uid())
     and pp.base_point is not null;
$$;
