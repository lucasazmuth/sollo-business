import { supabase } from "@/src/lib/supabase";
import { comRetry } from "@/src/lib/retry";
import type { Enums, Tables } from "@/src/types/database";

export type Job = Tables<"jobs">;
export type JobStatus = Enums<"job_status">;
export type PayType = Enums<"pay_type">;

export type NovaVaga = {
  titulo: string;
  descricao: string;
  categoryId: string;
  coverUrl?: string | null;
  startsAt: Date;
  duracaoHoras?: number | null;
  isUrgent: boolean;
  requiresInvoice: boolean;
  payType: PayType;
  payAmount?: number | null;
  vagasQtd: number;
  local: { lat: number; lng: number; endereco: string; cidade?: string | null; uf?: string | null };
  publicar: boolean;
};

/**
 * Cria a vaga e grava o local em seguida.
 *
 * O ponto vai por RPC porque `geography` não trafega bem pelo PostgREST.
 * A vaga nasce como rascunho e só então é publicada: assim o trigger de
 * fanout dispara com o local já definido — publicar antes notificaria
 * gente errada, ou ninguém.
 */
export async function criarVaga(hirerId: string, v: NovaVaga): Promise<Job> {
  const vaga = await comRetry(async () => {
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        hirer_id: hirerId,
        titulo: v.titulo.trim(),
        descricao: v.descricao.trim(),
        category_id: v.categoryId,
        cover_url: v.coverUrl ?? null,
        starts_at: v.startsAt.toISOString(),
        duracao_horas: v.duracaoHoras ?? null,
        is_urgent: v.isUrgent,
        requires_invoice: v.requiresInvoice,
        pay_type: v.payType,
        pay_amount: v.payType === "valor" ? v.payAmount : null,
        vagas_qtd: v.vagasQtd,
        status: "rascunho"
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });

  await comRetry(async () => {
    const { error } = await supabase.rpc("set_job_location", {
      p_job_id: vaga.id,
      p_lat: v.local.lat,
      p_lng: v.local.lng,
      p_endereco: v.local.endereco,
      p_cidade: v.local.cidade ?? undefined,
      p_uf: v.local.uf ?? undefined
    });
    if (error) throw new Error(error.message);
  });

  if (!v.publicar) return vaga;

  return publicarVaga(vaga.id);
}

/** Publicar dispara o fanout por raio (trigger → outbox → Edge Function). */
export async function publicarVaga(jobId: string): Promise<Job> {
  return comRetry(async () => {
    const { data, error } = await supabase
      .from("jobs")
      .update({ status: "aberta" })
      .eq("id", jobId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
}

export async function atualizarVaga(
  jobId: string,
  campos: Partial<
    Pick<
      Job,
      | "titulo"
      | "descricao"
      | "category_id"
      | "cover_url"
      | "starts_at"
      | "duracao_horas"
      | "is_urgent"
      | "requires_invoice"
      | "pay_type"
      | "pay_amount"
      | "vagas_qtd"
    >
  >
) {
  await comRetry(async () => {
    const { error } = await supabase.from("jobs").update(campos).eq("id", jobId);
    if (error) throw new Error(error.message);
  });
}

export async function atualizarLocalVaga(
  jobId: string,
  local: { lat: number; lng: number; endereco: string; cidade?: string | null; uf?: string | null }
) {
  await comRetry(async () => {
    const { error } = await supabase.rpc("set_job_location", {
      p_job_id: jobId,
      p_lat: local.lat,
      p_lng: local.lng,
      p_endereco: local.endereco,
      p_cidade: local.cidade ?? undefined,
      p_uf: local.uf ?? undefined
    });
    if (error) throw new Error(error.message);
  });
}

/** Cancelar avisa todos os candidatos — o trigger cuida disso. */
export async function cancelarVaga(jobId: string) {
  await comRetry(async () => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: "cancelada", closed_at: new Date().toISOString() })
      .eq("id", jobId);
    if (error) throw new Error(error.message);
  });
}

export type VagaDaLista = Job & {
  categories: { nome: string } | null;
  applications: { count: number }[];
};

export async function minhasVagas(hirerId: string): Promise<VagaDaLista[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, categories(nome), applications(count)")
    .eq("hirer_id", hirerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as VagaDaLista[];
}

export type VagaDetalhe = Job & {
  categories: { nome: string } | null;
  profiles: { nome: string; avatar_url: string | null } | null;
};

export async function buscarVaga(jobId: string): Promise<VagaDetalhe | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, categories(nome), profiles!jobs_hirer_id_fkey(nome, avatar_url)")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as VagaDetalhe | null;
}

/**
 * Quantos profissionais o fanout alcançaria — mostrado ao publicar.
 *
 * Usa `job_reach_count`, que devolve só o NÚMERO e confere se quem
 * pergunta é o dono da vaga. `candidates_for_job` devolveria a lista de
 * ids, abrindo a base de profissionais da região.
 */
export async function alcanceDaVaga(jobId: string): Promise<number> {
  const { data, error } = await supabase.rpc("job_reach_count", { p_job_id: jobId });
  if (error) return 0;
  return data ?? 0;
}
