import { supabase } from "@/src/lib/supabase";
import type { Enums } from "@/src/types/database";

export type VagaDoFeed = {
  id: string;
  titulo: string;
  descricao: string;
  cover_url: string | null;
  cidade: string | null;
  uf: string | null;
  starts_at: string;
  is_urgent: boolean;
  requires_invoice: boolean;
  pay_type: Enums<"pay_type">;
  pay_amount: number | null;
  category_id: string;
  hirer_id: string;
  hirer_nome: string | null;
  hirer_avatar: string | null;
  distancia_km: number | null;
};

export type FiltrosFeed = {
  raioKm?: number | null;
  categorias?: string[] | null;
  apenasUrgentes?: boolean;
  /**
   * Lugar escolhido. Escolher um lugar SUBSTITUI o raio no banco: quem
   * filtra por "RJ" está dizendo que a distância até a própria casa deixou
   * de ser o critério. `cidade` nula = o estado inteiro.
   */
  uf?: string | null;
  cidade?: string | null;
  /**
   * Sem recorte de lugar nenhum: o país inteiro.
   *
   * Existe porque quem vive rodando não tem lista de praças que fique em
   * dia. A ordenação por distância continua valendo, então o que está perto
   * aparece primeiro mesmo olhando tudo.
   */
  qualquerLugar?: boolean;
};

export type LugarComVagas = { uf: string; cidade: string | null; total: number };

/**
 * Praças que têm vaga aberta agora.
 *
 * O filtro é alimentado por isto e não por uma lista fixa de 27 estados:
 * uma lista fixa manda a pessoa para dez telas vazias, esta manda para onde
 * há trabalho.
 */
export async function lugaresComVagas(): Promise<LugarComVagas[]> {
  const { data, error } = await supabase.rpc("lugares_com_vagas");
  if (error) return [];
  return (data ?? []) as LugarComVagas[];
}

/**
 * Feed do profissional logado.
 *
 * A coordenada fica no banco: a RPC resolve o ponto pelo auth.uid() em
 * vez de o app carregar a localização do usuário só para consultar.
 */
export async function buscarFeed(
  filtros: FiltrosFeed = {},
  pagina = 0,
  porPagina = 20
): Promise<VagaDoFeed[]> {
  const { data, error } = await supabase.rpc("jobs_feed_para_mim", {
    p_raio_km: filtros.raioKm ?? undefined,
    p_categorias: filtros.categorias?.length ? filtros.categorias : undefined,
    p_only_urgent: filtros.apenasUrgentes ?? false,
    p_uf: filtros.uf ?? undefined,
    p_cidade: filtros.cidade ?? undefined,
    p_qualquer_lugar: filtros.qualquerLugar ?? false,
    p_limit: porPagina,
    p_offset: pagina * porPagina
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as VagaDoFeed[];
}

/**
 * Quantas vagas existem num raio maior, ignorando os demais filtros.
 * Serve para o estado vazio dizer "há N vagas em 50 km" em vez de
 * só mostrar nada e deixar a pessoa achar que o app está quebrado.
 */
export async function contarNoRaio(raioKm: number): Promise<number> {
  const { data, error } = await supabase.rpc("jobs_count_no_raio", { p_raio_km: raioKm });
  if (error) return 0;
  return data ?? 0;
}
