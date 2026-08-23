import { supabase } from "@/src/lib/supabase";
import { comRetry } from "@/src/lib/retry";
import type { Tables } from "@/src/types/database";

export type Conversa = Tables<"conversations">;
export type Mensagem = Tables<"messages">;

export type ConversaDaLista = Conversa & {
  jobs: { id: string; titulo: string; status: string } | null;
  /** O outro lado da conversa, já resolvido conforme quem está logado. */
  outro: { id: string; nome: string; avatar_url: string | null } | null;
  naoLidas: number;
  ultima: string | null;
};

/**
 * Abre (ou reaproveita) a conversa com um candidato.
 *
 * Só o contratante dono da vaga consegue: `conversations` não tem policy de
 * INSERT, e a checagem vive dentro da função no banco. Antes o chat nascia
 * de um trigger em toda candidatura, o que enchia a caixa dos dois lados de
 * canal vazio que ninguém abriu.
 */
export async function abrirConversa(jobId: string, professionalId: string): Promise<string> {
  return comRetry(async () => {
    const { data, error } = await supabase.rpc("abrir_conversa", {
      p_job_id: jobId,
      p_professional_id: professionalId
    });
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Não foi possível abrir a conversa.");
    return data as string;
  });
}

export async function listarConversas(meuId: string): Promise<ConversaDaLista[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, jobs(id, titulo, status)")
    .or(`hirer_id.eq.${meuId},professional_id.eq.${meuId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  const conversas = data ?? [];
  if (conversas.length === 0) return [];

  const outrosIds = conversas.map((c) => (c.hirer_id === meuId ? c.professional_id : c.hirer_id));

  const [{ data: perfis }, { data: ultimas }] = await Promise.all([
    supabase.from("profiles").select("id, nome, avatar_url").in("id", outrosIds),
    supabase
      .from("messages")
      .select("conversation_id, corpo, sender_id, read_at, created_at")
      .in(
        "conversation_id",
        conversas.map((c) => c.id)
      )
      .order("created_at", { ascending: false })
  ]);

  const porId = new Map((perfis ?? []).map((p) => [p.id, p]));
  const msgs = ultimas ?? [];

  return conversas.map((c) => {
    const doChat = msgs.filter((m) => m.conversation_id === c.id);
    return {
      ...c,
      outro: porId.get(c.hirer_id === meuId ? c.professional_id : c.hirer_id) ?? null,
      ultima: doChat[0]?.corpo ?? null,
      naoLidas: doChat.filter((m) => m.sender_id !== meuId && !m.read_at).length
    } as ConversaDaLista;
  });
}

export type ConversaDetalhe = Conversa & {
  jobs: { id: string; titulo: string; status: string; starts_at: string } | null;
  outro: { id: string; nome: string; avatar_url: string | null } | null;
};

export async function buscarConversa(id: string, meuId: string): Promise<ConversaDetalhe | null> {
  const { data } = await supabase
    .from("conversations")
    .select("*, jobs(id, titulo, status, starts_at)")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const outroId = data.hirer_id === meuId ? data.professional_id : data.hirer_id;
  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, nome, avatar_url")
    .eq("id", outroId)
    .maybeSingle();

  return { ...data, outro: perfil ?? null } as ConversaDetalhe;
}

export async function listarMensagens(conversationId: string, limite = 100): Promise<Mensagem[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limite);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function enviarMensagem(
  conversationId: string,
  senderId: string,
  corpo: string
): Promise<Mensagem> {
  return comRetry(async () => {
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: senderId, corpo: corpo.trim() })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
}

/** Marca como lidas as mensagens que o outro mandou. */
export async function marcarMensagensLidas(conversationId: string, meuId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", meuId)
    .is("read_at", null);
}

/**
 * Escuta mensagens novas da conversa.
 *
 * O Realtime respeita RLS: só chega o que a policy de SELECT deixaria
 * ler, então não há risco de vazar conversa alheia pelo stream.
 */
export function ouvirMensagens(conversationId: string, aoChegar: (m: Mensagem) => void) {
  const canal = supabase
    .channel(`conversa:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => aoChegar(payload.new as Mensagem)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(canal);
  };
}

export async function contarMensagensNaoLidas(meuId: string): Promise<number> {
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .or(`hirer_id.eq.${meuId},professional_id.eq.${meuId}`);

  const ids = (data ?? []).map((c) => c.id);
  if (ids.length === 0) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .neq("sender_id", meuId)
    .is("read_at", null);

  return count ?? 0;
}
