-- =============================================================
-- Derruba as assinaturas antigas de jobs_feed e jobs_feed_para_mim.
--
-- `create or replace function` só substitui quando a lista de tipos dos
-- argumentos é idêntica. Acrescentar `p_uf` e `p_cidade` na migration
-- anterior não substituiu nada: criou uma SOBRECARGA ao lado da original.
--
-- Com as duas vivas, qualquer chamada com os parâmetros antigos vira
-- ambígua e o Postgres recusa — o que apagou o feed inteiro, porque o app
-- chama por nome e nunca passa os dois campos novos quando não há lugar
-- escolhido. Fica só a versão de 8 argumentos.
-- =============================================================

drop function if exists public.jobs_feed(
  extensions.geography, int, uuid[], boolean, int, int
);

drop function if exists public.jobs_feed_para_mim(
  int, uuid[], boolean, int, int
);
