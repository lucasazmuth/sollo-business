-- =============================================================
-- Avaliações — o que falta avaliar, dos dois lados.
--
-- Elegível pra avaliar = vaga preenchida com a data de início já
-- passada (o trabalho já deveria ter acontecido) e o participante
-- ainda não avaliou o outro lado. Bilateral: contratante avalia o
-- profissional selecionado, e o profissional selecionado avalia o
-- contratante — a policy de INSERT em `ratings` já permite os dois
-- sentidos (is_job_owner OR fui_selecionado).
-- =============================================================

create or replace function public.avaliacoes_pendentes()
returns table (
  job_id       uuid,
  titulo       text,
  starts_at    timestamptz,
  rated_id     uuid,
  rated_nome   text,
  rated_avatar text
)
language sql
stable
security definer
set search_path = ''
as $$
  -- Eu sou o contratante: avalio o profissional selecionado.
  select j.id, j.titulo, j.starts_at, a.professional_id, p.nome, p.avatar_url
    from public.jobs j
    join public.applications a
      on a.job_id = j.id and a.status = 'selecionada'
    join public.profiles p
      on p.id = a.professional_id
   where j.hirer_id = (select auth.uid())
     and j.status = 'preenchida'
     and j.starts_at < now()
     and not exists (
       select 1 from public.ratings r
        where r.job_id = j.id
          and r.rater_id = (select auth.uid())
          and r.rated_id = a.professional_id
     )

  union all

  -- Eu sou o profissional selecionado: avalio o contratante.
  select j.id, j.titulo, j.starts_at, j.hirer_id, p.nome, p.avatar_url
    from public.jobs j
    join public.applications a
      on a.job_id = j.id and a.status = 'selecionada'
    join public.profiles p
      on p.id = j.hirer_id
   where a.professional_id = (select auth.uid())
     and j.status = 'preenchida'
     and j.starts_at < now()
     and not exists (
       select 1 from public.ratings r
        where r.job_id = j.id
          and r.rater_id = (select auth.uid())
          and r.rated_id = j.hirer_id
     )

  order by starts_at desc;
$$;

-- Avaliações recebidas por alguém, com quem avaliou — mostrado no
-- perfil público. rating_avg/rating_count já ficam denormalizados
-- nos perfis; isso aqui é só a lista de comentários.
create or replace function public.avaliacoes_recebidas(p_profile_id uuid, p_limit int default 20)
returns table (
  id           uuid,
  nota         int,
  comentario   text,
  created_at   timestamptz,
  rater_id     uuid,
  rater_nome   text,
  rater_avatar text,
  job_titulo   text
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.nota, r.comentario, r.created_at,
         r.rater_id, p.nome, p.avatar_url, j.titulo
    from public.ratings r
    join public.profiles p on p.id = r.rater_id
    join public.jobs j on j.id = r.job_id
   where r.rated_id = p_profile_id
   order by r.created_at desc
   limit greatest(p_limit, 1);
$$;

grant execute on function public.avaliacoes_pendentes() to authenticated;
grant execute on function public.avaliacoes_recebidas(uuid, int) to authenticated;
