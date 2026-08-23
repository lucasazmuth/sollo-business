import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";
import { signOut as sairDaConta } from "@/src/lib/auth";
import { desregistrarPush } from "@/src/lib/notifications";
import type { Tables } from "@/src/types/database";

export type Profile = Tables<"profiles">;

type SessionContextValue = {
  session: SupabaseSession | null;
  /** Linha de `profiles` do usuário logado. null enquanto carrega. */
  profile: Profile | null;
  /** true até a sessão salva ser lida e o perfil resolvido. */
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {}
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const carregaPerfil = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    // Erro aqui não pode passar batido: perfil null faz a Home renderizar a
    // persona errada (contratante vendo tela de profissional) em vez de
    // avisar que algo falhou.
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[session] falha ao carregar perfil:", error.message);
      setProfile(null);
      return;
    }
    setProfile(data ?? null);
  }, []);

  /**
   * O callback do `onAuthStateChange` só mexe em estado local — nada de
   * `await` nem de chamada ao Supabase aqui dentro.
   *
   * Há um deadlock conhecido no supabase-js: o callback roda com o lock de
   * auth segurado, então qualquer chamada ao client lá dentro trava esse
   * lock e a PRÓXIMA chamada em qualquer lugar do app nunca retorna. O
   * sintoma é traiçoeiro por ser intermitente — a sessão entra, o app até
   * grava no banco, mas o perfil fica null e a Home mostra a persona
   * errada. Ver supabase/auth-js#762.
   */
  useEffect(() => {
    let vivo = true;

    // Sessão persistida no Keychain, lida antes de decidir a rota inicial.
    supabase.auth
      .getSession()
      .then(({ data }) => vivo && setSession(data.session))
      .finally(() => vivo && setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nova) => {
      if (!vivo) return;
      setSession(nova);
      setLoading(false);
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // O perfil carrega FORA do callback de auth, reagindo ao id da sessão.
  useEffect(() => {
    let vivo = true;
    carregaPerfil(session?.user.id).catch(() => vivo && setProfile(null));
    return () => {
      vivo = false;
    };
  }, [session?.user.id, carregaPerfil]);

  // Marca presença — o perfil mostra "visto por último", e o motor de
  // vagas usa isso para priorizar quem anda ativo.
  useEffect(() => {
    if (!session?.user.id) return;
    supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", session.user.id)
      .then(() => {});
  }, [session?.user.id]);

  const refreshProfile = useCallback(
    () => carregaPerfil(session?.user.id),
    [carregaPerfil, session?.user.id]
  );

  const signOut = useCallback(async () => {
    // Tira o token antes de perder a sessão: senão o aparelho continua
    // recebendo push de uma conta que já saiu.
    await desregistrarPush().catch(() => {});

    // `sairDaConta` já tem fallback local, mas o estado é zerado aqui de
    // qualquer jeito: se algo falhar no caminho, a pessoa não pode ficar
    // presa numa tela logada sem saída.
    await sairDaConta().catch(() => {});
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, refreshProfile, signOut }),
    [session, profile, loading, refreshProfile, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
