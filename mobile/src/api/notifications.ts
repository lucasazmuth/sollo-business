import { supabase } from "@/src/lib/supabase";
import { comRetry } from "@/src/lib/retry";
import type { Tables } from "@/src/types/database";

export type Notificacao = Tables<"notifications">;
export type Preferencias = Tables<"notification_prefs">;

export async function listarNotificacoes(profileId: string, limite = 50): Promise<Notificacao[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function contarNaoLidas(profileId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .is("read_at", null);

  return count ?? 0;
}

export async function marcarLida(id: string) {
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}

export async function marcarTodasLidas(profileId: string) {
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", profileId)
    .is("read_at", null);
}

export async function buscarPreferencias(profileId: string): Promise<Preferencias | null> {
  const { data } = await supabase
    .from("notification_prefs")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  return data ?? null;
}

export async function salvarPreferencias(
  profileId: string,
  campos: Partial<
    Pick<
      Preferencias,
      | "push_vagas"
      | "email_vagas"
      | "push_candidaturas"
      | "email_candidaturas"
      | "push_chat"
      | "push_status"
      | "urgente_ignora_silencio"
      | "max_push_vagas_dia"
    >
  >
) {
  await comRetry(async () => {
    const { error } = await supabase
      .from("notification_prefs")
      .update(campos)
      .eq("profile_id", profileId);
    if (error) throw new Error(error.message);
  });
}
