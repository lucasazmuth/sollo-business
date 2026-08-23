-- =============================================================
-- Webhook: outbox → Edge Function.
--
-- Toda linha nova em `notification_events` chama dispatch-notification
-- de forma assíncrona (pg_net). A transação que gerou o evento não
-- espera pelo envio — publicar vaga não pode travar esperando push.
--
-- A URL e o segredo vêm do Vault, nunca do código: esta migration pode
-- ir para o repositório sem carregar credencial nenhuma.
-- =============================================================

create extension if not exists supabase_vault with schema vault;

create or replace function public.disparar_notificacao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url    text;
  v_secret text;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'edge_dispatch_url';

  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'edge_dispatch_secret';

  -- Sem segredo configurado, o evento fica na fila em vez de sumir:
  -- alguém processa depois, e nada é perdido em silêncio.
  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'x-sollo-secret', v_secret
    ),
    body    := jsonb_build_object('event_id', new.id),
    timeout_milliseconds := 8000
  );

  return new;
end;
$$;

comment on function public.disparar_notificacao is
  'Chama a Edge Function de forma assíncrona quando um evento entra na outbox.';

create trigger notification_events_dispatch
  after insert on public.notification_events
  for each row execute function public.disparar_notificacao();

-- ---------- Reprocessamento ----------

-- Rede caiu, função estava fora do ar, segredo não configurado: os eventos
-- ficam com processed_at nulo. Esta função reempurra os pendentes.
create or replace function public.reprocessar_notificacoes_pendentes(p_limite int default 50)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url    text;
  v_secret text;
  v_conta  int := 0;
  r        record;
begin
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'edge_dispatch_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'edge_dispatch_secret';
  if v_url is null or v_secret is null then
    return 0;
  end if;

  for r in
    select id from public.notification_events
     where processed_at is null
       and attempts < 5
       and created_at > now() - interval '7 days'
     order by created_at
     limit p_limite
  loop
    perform net.http_post(
      url     := v_url,
      headers := jsonb_build_object('Content-Type','application/json','x-sollo-secret', v_secret),
      body    := jsonb_build_object('event_id', r.id),
      timeout_milliseconds := 8000
    );
    v_conta := v_conta + 1;
  end loop;

  return v_conta;
end;
$$;

revoke execute on function public.reprocessar_notificacoes_pendentes from anon, authenticated;
