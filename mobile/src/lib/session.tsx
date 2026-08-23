import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";
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
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let vivo = true;

    // Sessão persistida no Keychain, lida antes de decidir a rota inicial.
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!vivo) return;
        setSession(data.session);
        await carregaPerfil(data.session?.user.id);
      })
      .finally(() => vivo && setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evento, nova) => {
      if (!vivo) return;
      setSession(nova);
      await carregaPerfil(nova?.user.id);
      setLoading(false);
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, [carregaPerfil]);

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
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, refreshProfile, signOut }),
    [session, profile, loading, refreshProfile, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
