import { supabase } from "@/src/lib/supabase";
import { comRetry } from "@/src/lib/retry";

export type AvaliacaoPendente = {
  job_id: string;
  titulo: string;
  starts_at: string;
  rated_id: string;
  rated_nome: string | null;
  rated_avatar: string | null;
};

export type AvaliacaoRecebida = {
  id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
  rater_id: string;
  rater_nome: string | null;
  rater_avatar: string | null;
  job_titulo: string;
};

/**
 * Vagas concluídas em que a pessoa logada ainda não avaliou o outro lado.
 * Bilateral: contratante avalia o profissional selecionado, e vice-versa.
 */
export async function avaliacoesPendentes(): Promise<AvaliacaoPendente[]> {
  const { data, error } = await supabase.rpc("avaliacoes_pendentes");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function avaliacoesRecebidas(
  profileId: string,
  limite = 20
): Promise<AvaliacaoRecebida[]> {
  const { data, error } = await supabase.rpc("avaliacoes_recebidas", {
    p_profile_id: profileId,
    p_limit: limite
  });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** O trigger `ratings_recompute` atualiza rating_avg/rating_count sozinho. */
export async function enviarAvaliacao(input: {
  jobId: string;
  raterId: string;
  ratedId: string;
  nota: number;
  comentario?: string;
}) {
  await comRetry(async () => {
    const { error } = await supabase.from("ratings").insert({
      job_id: input.jobId,
      rater_id: input.raterId,
      rated_id: input.ratedId,
      nota: input.nota,
      comentario: input.comentario?.trim() || null
    });

    if (error) {
      // unique(job_id, rater_id, rated_id): já avaliou esta vaga.
      if (error.code === "23505") throw new Error("Você já avaliou esta pessoa nesta vaga.");
      throw new Error(error.message);
    }
  });
}
