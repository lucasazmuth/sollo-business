import { supabase } from "@/src/lib/supabase";
import { comRetry } from "@/src/lib/retry";
import type { Enums, Tables } from "@/src/types/database";

export type Application = Tables<"applications">;
export type ApplicationStatus = Enums<"application_status">;

/**
 * Candidatura em um toque.
 *
 * Sem formulário: o perfil já É a candidatura. Esse atrito zero entre
 * a notificação e o "tenho interesse" é o produto — em vaga urgente,
 * cada campo a mais custa candidato.
 */
export async function candidatar(jobId: string, professionalId: string, mensagem?: string) {
  return comRetry(async () => {
    const { data, error } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        professional_id: professionalId,
        mensagem: mensagem?.trim() || null
      })
      .select()
      .single();

    if (error) {
      // unique(job_id, professional_id): já existe candidatura.
      if (error.code === "23505") throw new Error("Você já se candidatou a esta vaga.");
      throw new Error(error.message);
    }
    return data;
  });
}

export async function retirarCandidatura(applicationId: string) {
  await comRetry(async () => {
    const { error } = await supabase
      .from("applications")
      .update({ status: "retirada" })
      .eq("id", applicationId);
    if (error) throw new Error(error.message);
  });
}

/** Candidatura da pessoa logada nesta vaga, se houver. */
export async function minhaCandidatura(
  jobId: string,
  professionalId: string
): Promise<Application | null> {
  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("professional_id", professionalId)
    .maybeSingle();

  return data ?? null;
}

export type CandidaturaDaLista = Application & {
  jobs: {
    id: string;
    titulo: string;
    starts_at: string;
    cidade: string | null;
    status: Enums<"job_status">;
    is_urgent: boolean;
  } | null;
};

export async function minhasCandidaturas(professionalId: string): Promise<CandidaturaDaLista[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, jobs(id, titulo, starts_at, cidade, status, is_urgent)")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CandidaturaDaLista[];
}

/** Vagas em que já me candidatei — usado para marcar o feed. */
export async function idsDasVagasQueAplicei(professionalId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("applications")
    .select("job_id")
    .eq("professional_id", professionalId)
    .neq("status", "retirada");

  return new Set((data ?? []).map((a) => a.job_id));
}

export type Candidato = Application & {
  profiles: {
    id: string;
    nome: string;
    avatar_url: string | null;
    bio: string | null;
    last_seen_at: string | null;
  } | null;
  professional_profiles: {
    headline: string | null;
    base_label: string | null;
    rating_avg: number | null;
    rating_count: number;
  } | null;
};

export async function candidatosDaVaga(jobId: string): Promise<Candidato[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      "*, profiles!applications_professional_id_fkey(id, nome, avatar_url, bio, last_seen_at)"
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const candidaturas = (data ?? []) as Candidato[];
  if (candidaturas.length === 0) return [];

  // O join de professional_profiles vem em uma segunda consulta porque a
  // FK sai de profiles, não de applications.
  const ids = candidaturas.map((c) => c.professional_id);
  const { data: perfis } = await supabase
    .from("professional_profiles")
    .select("profile_id, headline, base_label, rating_avg, rating_count")
    .in("profile_id", ids);

  const porId = new Map((perfis ?? []).map((p) => [p.profile_id, p]));

  return candidaturas.map((c) => ({
    ...c,
    professional_profiles: porId.get(c.professional_id) ?? null
  }));
}

/**
 * Selecionar dispara, em uma transação no banco:
 * vaga → 'preenchida', demais candidaturas → 'recusada', e os eventos
 * de notificação para todo mundo envolvido.
 */
export async function selecionarCandidato(applicationId: string) {
  await comRetry(async () => {
    const { error } = await supabase
      .from("applications")
      .update({ status: "selecionada" })
      .eq("id", applicationId);
    if (error) throw new Error(error.message);
  });
}

export async function recusarCandidato(applicationId: string) {
  await comRetry(async () => {
    const { error } = await supabase
      .from("applications")
      .update({ status: "recusada" })
      .eq("id", applicationId);
    if (error) throw new Error(error.message);
  });
}

export async function marcarComoVista(applicationId: string) {
  await supabase
    .from("applications")
    .update({ status: "vista" })
    .eq("id", applicationId)
    .eq("status", "aplicada"); // não regride quem já foi selecionado/recusado
}

export const ROTULO_STATUS_CANDIDATURA: Record<ApplicationStatus, string> = {
  aplicada: "Aguardando",
  vista: "Visualizada",
  selecionada: "Selecionado!",
  recusada: "Não selecionado",
  retirada: "Você retirou"
};
