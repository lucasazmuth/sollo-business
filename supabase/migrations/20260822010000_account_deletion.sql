-- =============================================================
-- Fase 9 — exclusão de conta pelo próprio app (exigência da Apple
-- para qualquer app com criação de conta: App Store Review 5.1.1(v)).
--
-- `profiles.id` referencia `auth.users(id) on delete cascade`, então
-- apagar a linha em `auth.users` já derruba profiles/professional_profiles/
-- hirer_profiles/portfolio/jobs/applications/messages/ratings/device_tokens/
-- notification_prefs em cascata. Só falta uma função que possa apagar de
-- `auth.users` — schema que o `authenticated` nunca tem acesso direto.
-- =============================================================

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

-- Dono postgres (superuser lógico do projeto) é o que dá a esta função
-- permissão de escrever em auth.users mesmo sem grant explícito no schema.
alter function public.delete_own_account() owner to postgres;

revoke all on function public.delete_own_account() from public, anon, authenticated;
grant execute on function public.delete_own_account() to authenticated;
