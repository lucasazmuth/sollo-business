import { supabase } from "@/src/lib/supabase";
import { comRetry } from "@/src/lib/retry";
import type { Tables } from "@/src/types/database";

export type Profile = Tables<"profiles">;
export type ProfessionalProfile = Tables<"professional_profiles">;
export type HirerProfile = Tables<"hirer_profiles">;
export type PortfolioItem = Tables<"portfolio_items">;
export type Category = Tables<"categories">;

/** Perfil completo, como as telas consomem. */
export type PerfilCompleto = {
  profile: Profile;
  professional: ProfessionalProfile | null;
  hirer: HirerProfile | null;
  portfolio: PortfolioItem[];
};

export async function buscarPerfil(profileId: string): Promise<PerfilCompleto | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: professional }, { data: hirer }, { data: portfolio }] = await Promise.all([
    supabase.from("professional_profiles").select("*").eq("profile_id", profileId).maybeSingle(),
    supabase.from("hirer_profiles").select("*").eq("profile_id", profileId).maybeSingle(),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("profile_id", profileId)
      .order("ordem", { ascending: true })
  ]);

  return { profile, professional, hirer, portfolio: portfolio ?? [] };
}

export async function listarCategorias(): Promise<Category[]> {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("ativa", true)
    .order("ordem", { ascending: true });

  return data ?? [];
}

export async function salvarPerfil(
  profileId: string,
  campos: Partial<Pick<Profile, "nome" | "bio" | "avatar_url" | "telefone" | "cidade" | "uf">>
) {
  await comRetry(async () => {
    const { error } = await supabase.from("profiles").update(campos).eq("id", profileId);
    if (error) throw new Error(error.message);
  });
}

export async function salvarPerfilProfissional(
  profileId: string,
  campos: Partial<Pick<ProfessionalProfile, "headline" | "categorias" | "disponivel" | "raio_km" | "links">>
) {
  await comRetry(async () => {
    const { error } = await supabase
      .from("professional_profiles")
      .update(campos)
      .eq("profile_id", profileId);
    if (error) throw new Error(error.message);
  });
}

export async function salvarPerfilContratante(
  profileId: string,
  campos: Partial<
    Pick<
      HirerProfile,
      | "empresa"
      | "sobre"
      | "site"
      | "logo_url"
      | "nome_completo"
      | "cpf"
      | "cep"
      | "logradouro"
      | "numero"
      | "complemento"
      | "bairro"
      | "cidade"
      | "uf"
    >
  >
) {
  await comRetry(async () => {
    const { error } = await supabase
      .from("hirer_profiles")
      .update(campos)
      .eq("profile_id", profileId);
    if (error) throw new Error(error.message);
  });
}

/** Publicar vaga exige e-mail verificado, nome completo, CPF, telefone e endereço. */
export async function cadastroCompletoParaPublicar(profileId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("hirer_cadastro_completo", {
    p_profile_id: profileId
  });
  if (error) throw new Error(error.message);
  return !!data;
}

/**
 * Grava a localização base. A precisão é reduzida no banco (~1 km):
 * a busca por raio não perde nada e o endereço exato não fica exposto.
 */
export async function salvarLocalizacao(input: {
  lat: number;
  lng: number;
  label?: string;
  raioKm?: number;
}) {
  await comRetry(async () => {
    const { error } = await supabase.rpc("set_professional_location", {
      p_lat: input.lat,
      p_lng: input.lng,
      p_label: input.label ?? undefined,
      p_raio_km: input.raioKm ?? undefined
    });
    if (error) throw new Error(error.message);
  });
}

export async function adicionarAoPortfolio(profileId: string, mediaUrl: string, ordem: number) {
  return comRetry(async () => {
    const { data, error } = await supabase
      .from("portfolio_items")
      .insert({ profile_id: profileId, media_url: mediaUrl, ordem })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
}

export async function removerDoPortfolio(itemId: string) {
  const { error } = await supabase.from("portfolio_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
}
