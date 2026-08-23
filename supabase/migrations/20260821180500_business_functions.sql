-- =============================================================
-- Regras de negócio no banco: quem notificar, o que mostrar no
-- feed, e os gatilhos que alimentam a outbox.
--
-- Toda função é SECURITY DEFINER com search_path fixo, então tudo
-- é qualificado (inclusive PostGIS, que mora em `extensions`).
-- =============================================================

-- ---------- Emissor único de eventos ----------

create or replace function public.emit_notification_event(
  p_evento     public.notification_event,
  p_target_ids uuid[] default '{}',
  p_payload    jsonb  default '{}',
  p_actor_id   uuid   default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.notification_events (evento, target_ids, payload, actor_id)
  values (p_evento, coalesce(p_target_ids, '{}'), coalesce(p_payload, '{}'), p_actor_id)
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.emit_notification_event is
  'Único caminho para criar notificação. Grava na outbox; a Edge Function dispatch-notification faz o resto.';

-- ---------- Quem notificar sobre uma vaga ----------

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
     and pp.base_point is not null
     and j.category_id = any (pp.categorias)
     -- O raio é o do PROFISSIONAL: "até onde eu topo ir".
     and extensions.st_dwithin(pp.base_point, j.point, pp.raio_km * 1000)
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

comment on function public.candidates_for_job is
  'Profissionais elegíveis para o fanout de uma vaga: raio + categoria + disponibilidade + preferências + teto diário.';

-- ---------- Feed de vagas ----------

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
  -- Urgente primeiro, depois perto, depois o que começa antes.
  order by
    j.is_urgent desc,
    case when p_point is null or j.point is null then 0
         else extensions.st_distance(j.point, p_point) end asc,
    j.starts_at asc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

-- =============================================================
-- Gatilhos que alimentam a outbox
-- =============================================================

-- Vaga publicada → fanout por raio (destinatários resolvidos depois).
create or replace function public.jobs_emit_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'aberta' and old.status is distinct from 'aberta' then
    perform public.emit_notification_event(
      'job.published.nearby',
      '{}',
      jsonb_build_object(
        'job_id',    new.id,
        'titulo',    new.titulo,
        'cidade',    new.cidade,
        'uf',        new.uf,
        'is_urgent', new.is_urgent,
        'starts_at', new.starts_at
      ),
      new.hirer_id
    );

  elsif new.status = 'cancelada' and old.status is distinct from 'cancelada' then
    perform public.emit_notification_event(
      'job.cancelled',
      array(
        select a.professional_id
          from public.applications a
         where a.job_id = new.id
           and a.status in ('aplicada', 'vista', 'selecionada')
      ),
      jsonb_build_object('job_id', new.id, 'titulo', new.titulo),
      new.hirer_id
    );
  end if;

  return new;
end;
$$;

create trigger jobs_emit_events_trigger
  after insert or update of status on public.jobs
  for each row execute function public.jobs_emit_events();

-- Candidatura recebida / selecionada / recusada.
create or replace function public.applications_emit_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hirer  uuid;
  v_titulo text;
begin
  select j.hirer_id, j.titulo into v_hirer, v_titulo
    from public.jobs j where j.id = new.job_id;

  if tg_op = 'INSERT' then
    perform public.emit_notification_event(
      'application.received',
      array[v_hirer],
      jsonb_build_object('job_id', new.job_id, 'titulo', v_titulo, 'application_id', new.id),
      new.professional_id
    );

  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'selecionada' then
      perform public.emit_notification_event(
        'application.selected',
        array[new.professional_id],
        jsonb_build_object('job_id', new.job_id, 'titulo', v_titulo, 'application_id', new.id),
        v_hirer
      );
    elsif new.status = 'recusada' then
      perform public.emit_notification_event(
        'application.rejected',
        array[new.professional_id],
        jsonb_build_object('job_id', new.job_id, 'titulo', v_titulo, 'application_id', new.id),
        v_hirer
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger applications_emit_events_trigger
  after insert or update of status on public.applications
  for each row execute function public.applications_emit_events();

-- Mensagem nova → notifica o outro lado da conversa.
create or replace function public.messages_emit_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_destino uuid;
  v_job     uuid;
begin
  select case when c.hirer_id = new.sender_id then c.professional_id else c.hirer_id end,
         c.job_id
    into v_destino, v_job
    from public.conversations c
   where c.id = new.conversation_id;

  perform public.emit_notification_event(
    'message.received',
    array[v_destino],
    jsonb_build_object(
      'conversation_id', new.conversation_id,
      'job_id',          v_job,
      'preview',         left(new.corpo, 120)
    ),
    new.sender_id
  );

  return new;
end;
$$;

create trigger messages_emit_events_trigger
  after insert on public.messages
  for each row execute function public.messages_emit_events();

-- Avaliação recebida.
create or replace function public.ratings_emit_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.emit_notification_event(
    'rating.received',
    array[new.rated_id],
    jsonb_build_object('job_id', new.job_id, 'nota', new.nota),
    new.rater_id
  );
  return new;
end;
$$;

create trigger ratings_emit_events_trigger
  after insert on public.ratings
  for each row execute function public.ratings_emit_events();
