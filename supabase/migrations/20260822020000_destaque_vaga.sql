-- =============================================================
-- Fase 11 — destaque pago (R$ 7,90 / 7 dias, PIX via Asaas).
--
-- O Asaas ainda não está integrado: esta migration só prepara o
-- terreno (coluna + prioridade no feed). Nenhum fluxo de pagamento
-- real grava nela ainda — fica null em toda vaga até a integração
-- existir. O app mostra "em breve" ao tentar destacar (ver
-- DestacarVagaModal.tsx), sem chamar nenhuma API de cobrança.
-- =============================================================

alter table public.jobs add column if not exists destacada_ate timestamptz;

comment on column public.jobs.destacada_ate is
  'Até quando a vaga fica no topo do feed (destaque pago). Null = sem destaque.';

-- Mesma assinatura de sempre — só muda a ordenação, então
-- jobs_feed_para_mim (que faz "select * from jobs_feed(...)")
-- continua compatível sem precisar mudar seu próprio retorno.
create or replace function public.jobs_feed(
  p_point       extensions.geography default null,
  p_raio_km     int     default 50,
  p_categorias  uuid[]  default null,
  p_only_urgent boolean default false,
  p_limit       int     default 20,
  p_offset      int     default 0
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
      p_point is null
      or j.point is null
      or extensions.st_dwithin(j.point, p_point, p_raio_km * 1000)
    )
  -- Destaque pago primeiro, depois urgente, depois perto, depois o que começa antes.
  order by
    (j.destacada_ate is not null and j.destacada_ate > now()) desc,
    j.is_urgent desc,
    case when p_point is null or j.point is null then 0
         else extensions.st_distance(j.point, p_point) end asc,
    j.starts_at asc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;
