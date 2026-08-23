-- =============================================================
-- Buckets de mídia e dados de referência.
--
-- Categorias entram como migration (não como seed.sql) porque são
-- dados de referência que o app depende para funcionar — seed.sql
-- só roda em `db reset` local.
-- =============================================================

-- ---------- Buckets ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',   'avatars',   true,  5 * 1024 * 1024, array['image/jpeg','image/png','image/webp']),
  ('portfolio', 'portfolio', true, 10 * 1024 * 1024, array['image/jpeg','image/png','image/webp']),
  ('jobs',      'jobs',      true, 10 * 1024 * 1024, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Convenção de caminho: {profile_id}/{arquivo}. A primeira pasta é
-- o dono, então a checagem de escrita é direta.
create policy "mídia pública para leitura"
  on storage.objects for select to public
  using (bucket_id in ('avatars', 'portfolio', 'jobs'));

create policy "escrevo na minha pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars', 'portfolio', 'jobs')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "atualizo minha mídia"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars', 'portfolio', 'jobs')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "apago minha mídia"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars', 'portfolio', 'jobs')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------- Categorias ----------

insert into public.categories (slug, nome, grupo, ordem) values
  ('audiovisual',        'Audiovisual',          'Audiovisual',    10),
  ('fotografia',         'Fotografia',           'Audiovisual',    20),
  ('edicao-pos',         'Edição e pós',         'Audiovisual',    30),
  ('direcao',            'Direção',              'Audiovisual',    40),
  ('som-audio',          'Som e áudio',          'Audiovisual',    50),
  ('iluminacao',         'Iluminação',           'Palco e evento', 60),
  ('producao-eventos',   'Produção de eventos',  'Palco e evento', 70),
  ('cenografia',         'Cenografia',           'Palco e evento', 80),
  ('assistencia',        'Assistência de produção', 'Palco e evento', 90),
  ('musica',             'Música',               'Palco e evento', 100),
  ('dj',                 'DJ',                   'Palco e evento', 110),
  ('danca',              'Dança',                'Palco e evento', 120),
  ('teatro',             'Teatro',               'Palco e evento', 130),
  ('design',             'Design',               'Criação',        140),
  ('publicidade',        'Publicidade',          'Criação',        150),
  ('moda',               'Moda',                 'Criação',        160),
  ('figurino',           'Figurino',             'Criação',        170),
  ('maquiagem',          'Maquiagem',            'Criação',        180),
  ('influencia-digital', 'Influência digital',   'Digital',        190),
  ('locucao',            'Locução',              'Digital',        200)
on conflict (slug) do nothing;
