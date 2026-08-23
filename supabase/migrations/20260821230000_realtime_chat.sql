-- =============================================================
-- Realtime para o chat.
--
-- O Realtime só entrega linhas de tabelas que estão na publicação
-- `supabase_realtime`. E ele respeita RLS: cada participante recebe
-- apenas as mensagens das conversas de que faz parte — a mesma policy
-- que governa o SELECT vale para o stream.
-- =============================================================

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- REPLICA IDENTITY FULL faz o payload do Realtime carregar a linha
-- inteira no UPDATE (e não só a PK), que é o que o app precisa para
-- marcar mensagem como lida sem uma consulta extra.
alter table public.messages replica identity full;
