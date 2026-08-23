-- =============================================================
-- A conversa deixa de nascer da candidatura.
--
-- Até aqui, `applications_open_conversation_trigger` abria um chat a cada
-- INSERT em `applications`. Numa vaga urgente com vinte candidatos, o
-- contratante ganhava vinte conversas vazias na aba Conversas antes de
-- olhar um perfil sequer — e o profissional via um canal aberto que
-- ninguém pediu, que lê como "o contratante me chamou" quando não chamou.
--
-- Quem abre o canal é o contratante, por ato explícito: tocar em
-- "Conversar" na lista de candidatos, ou escolher o candidato para a vaga.
-- =============================================================

drop trigger if exists applications_open_conversation_trigger on public.applications;
drop function if exists public.applications_open_conversation();

-- ---------- Abertura explícita ----------

create or replace function public.abrir_conversa(
  p_job_id          uuid,
  p_professional_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'não autenticado';
  end if;

  -- Só o dono da vaga abre. `conversations` não tem policy de INSERT, então
  -- esta função é o único caminho — a checagem aqui é a trava, não um enfeite.
  if not exists (
    select 1 from public.jobs j where j.id = p_job_id and j.hirer_id = v_uid
  ) then
    raise exception 'só o contratante da vaga pode iniciar a conversa';
  end if;

  -- Sem candidatura viva não há assunto: evita o contratante abrir chat com
  -- qualquer profissional da vitrine usando o id da própria vaga.
  if not exists (
    select 1
      from public.applications a
     where a.job_id = p_job_id
       and a.professional_id = p_professional_id
       and a.status <> 'retirada'
  ) then
    raise exception 'esta pessoa não está candidatada a esta vaga';
  end if;

  insert into public.conversations (job_id, hirer_id, professional_id)
  values (p_job_id, v_uid, p_professional_id)
  on conflict (job_id, professional_id) do nothing;

  select c.id into v_id
    from public.conversations c
   where c.job_id = p_job_id
     and c.professional_id = p_professional_id;

  return v_id;
end;
$$;

comment on function public.abrir_conversa is
  'Abre (ou reaproveita) a conversa entre o contratante da vaga e um candidato. Só o dono da vaga executa.';

revoke all on function public.abrir_conversa(uuid, uuid) from public, anon;
grant execute on function public.abrir_conversa(uuid, uuid) to authenticated;

-- ---------- Escolher o candidato também abre o canal ----------

-- Selecionar é o contratante dizendo "é você". A tela do profissional já
-- manda "combine os detalhes pelo chat", então o canal precisa existir
-- nesse instante, sem depender de um segundo toque.
create or replace function public.applications_open_conversation_on_select()
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

create trigger applications_open_conversation_on_select_trigger
  after update on public.applications
  for each row
  when (new.status = 'selecionada' and old.status is distinct from 'selecionada')
  execute function public.applications_open_conversation_on_select();

-- ---------- Limpa os canais que o trigger antigo abriu sozinho ----------

-- Toda conversa existente nasceu do trigger de candidatura. As que nunca
-- receberam mensagem são exatamente o ruído que esta migration corrige;
-- as que têm histórico ficam intactas.
delete from public.conversations c
 where not exists (
   select 1 from public.messages m where m.conversation_id = c.id
 );
