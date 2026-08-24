-- =============================================================
-- Link externo no perfil do profissional.
--
-- `hirer_profiles` já tinha `site` desde a Fase 0. O profissional não —
-- ele tinha `links jsonb`, criado na mesma migration e nunca usado por
-- nenhuma tela.
--
-- Duas personas com o mesmo conceito passam a ter a mesma coluna, com o
-- mesmo nome e o mesmo tipo: a API do app fica simétrica em vez de gravar
-- texto de um lado e JSON do outro. `links` fica onde está, vazio, para o
-- dia em que "vários links" for um recurso de verdade.
-- =============================================================

alter table public.professional_profiles
  add column if not exists site text;

comment on column public.professional_profiles.site is
  'Link externo do profissional (reel, Behance, Instagram). Vitrine pública, como o resto da tabela.';
