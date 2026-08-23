-- =============================================================
-- Definição de localização a partir do GPS.
--
-- O app manda lat/lng cru; aqui isso vira geography e, de propósito,
-- é ARREDONDADO para ~1 km antes de gravar. Guardar o ponto exato do
-- usuário seria expor endereço residencial sem necessidade — a busca
-- por raio não perde nada com essa granularidade.
-- =============================================================

create or replace function public.set_professional_location(
  p_lat   double precision,
  p_lng   double precision,
  p_label text default null,
  p_raio_km int default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lat double precision := round(p_lat::numeric, 2);
  v_lng double precision := round(p_lng::numeric, 2);
begin
  if (select auth.uid()) is null then
    raise exception 'não autenticado';
  end if;

  update public.professional_profiles
     set base_point = extensions.st_setsrid(extensions.st_makepoint(v_lng, v_lat), 4326)::extensions.geography,
         base_label = coalesce(p_label, base_label),
         raio_km    = coalesce(p_raio_km, raio_km)
   where profile_id = (select auth.uid());
end;
$$;

comment on function public.set_professional_location is
  'Grava a localização base do profissional com precisão de ~1 km (LGPD).';

-- Versão administrativa, usada por seed e testes automatizados.
create or replace function public.admin_set_professional_location(
  p_profile_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_label text default null,
  p_raio_km int default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.professional_profiles
     set base_point = extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
         base_label = coalesce(p_label, base_label),
         raio_km    = coalesce(p_raio_km, raio_km)
   where profile_id = p_profile_id;
end;
$$;

revoke execute on function public.admin_set_professional_location from anon, authenticated;

-- Idem para vagas: o app envia lat/lng do endereço escolhido no autocomplete.
create or replace function public.set_job_location(
  p_job_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_endereco text default null,
  p_cidade text default null,
  p_uf char(2) default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.jobs
     set point = extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
         endereco_texto = coalesce(p_endereco, endereco_texto),
         cidade = coalesce(p_cidade, cidade),
         uf = coalesce(p_uf, uf)
   where id = p_job_id
     and (hirer_id = (select auth.uid()) or (select auth.uid()) is null);
end;
$$;
