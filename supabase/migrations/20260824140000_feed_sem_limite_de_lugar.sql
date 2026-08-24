-- =============================================================
-- "Todo o Brasil" no feed, e praça vira assunto de notificação.
--
-- A migration anterior tratou "ver a vaga" e "ser avisado da vaga" como o
-- mesmo problema, e resolveu os dois pedindo à pessoa que declarasse cada
-- praça. Para quem vive rodando — Rio numa semana, São Paulo na outra —
-- isso é cadastro sem fim, e nenhuma lista fica em dia.
--
-- Os dois problemas são diferentes:
--
--   Ver     é uma decisão do momento e não deveria exigir cadastro nenhum.
--           Quem quer olhar o país inteiro deve poder olhar, e se candidatar
--           onde fizer sentido.
--   Avisar  precisa de limite, sempre. Push de vaga em Porto Alegre para
--           quem está em Manaus não é serviço, é spam — e mata justamente a
--           promessa de "vaga urgente perto de você".
--
-- Então o feed ganha "todo o Brasil" (sem limite, sem cadastro), e as
-- praças continuam existindo só para o que de fato precisa de limite: o
-- fanout de notificação. `candidates_for_job` não muda.
-- =============================================================

-- `create or replace` não substitui quando a lista de tipos muda: cria uma
-- sobrecarga, e duas assinaturas vivas deixam toda chamada ambígua. Já
-- aconteceu uma vez nesta mesma função — daí derrubar antes de recriar.
drop function if exists public.jobs_feed(
  extensions.geography, int, uuid[], boolean, int, int, char(2), text
);
drop function if exists public.jobs_feed_para_mim(
  int, uuid[], boolean, int, int, char(2), text
);

create function public.jobs_feed(
  p_point           extensions.geography default null,
  p_raio_km         int     default 50,
  p_categorias      uuid[]  default null,
  p_only_urgent     boolean default false,
  p_limit           int     default 20,
  p_offset          int     default 0,
  p_uf              char(2) default null,
  p_cidade          text    default null,
  p_qualquer_lugar  boolean default false
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
    and (
      case
        -- Sem recorte de lugar. A ordenação por distância continua valendo,
        -- então o que está perto aparece primeiro mesmo olhando o país todo.
        when p_qualquer_lugar then true
        when p_uf is not null then
          j.uf = p_uf and (p_cidade is null or j.cidade = p_cidade)
        else
          p_point is null
          or j.point is null
          or extensions.st_dwithin(j.point, p_point, p_raio_km * 1000)
      end
    )
  order by
    j.is_urgent desc,
    case when p_point is null or j.point is null then 0
         else extensions.st_distance(j.point, p_point) end asc,
    j.starts_at asc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

create function public.jobs_feed_para_mim(
  p_raio_km        int     default null,
  p_categorias     uuid[]  default null,
  p_only_urgent    boolean default false,
  p_limit          int     default 20,
  p_offset         int     default 0,
  p_uf             char(2) default null,
  p_cidade         text    default null,
  p_qualquer_lugar boolean default false
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

  -- Só o feed POR RAIO precisa de base. Com lugar escolhido ou olhando o
  -- Brasil inteiro, quem ainda não configurou a base consegue explorar.
  if v_point is null and p_uf is null and not p_qualquer_lugar then
    return;
  end if;

  return query
    select * from public.jobs_feed(
      v_point, coalesce(v_raio, 30), v_categorias, p_only_urgent,
      p_limit, p_offset, p_uf, p_cidade, p_qualquer_lugar
    );
end;
$$;

grant execute on function public.jobs_feed(
  extensions.geography, int, uuid[], boolean, int, int, char(2), text, boolean
) to service_role;
