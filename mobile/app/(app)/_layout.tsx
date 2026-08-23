import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useSession } from "@/src/lib/session";
import { registrarParaPush, rotaDaNotificacao } from "@/src/lib/notifications";
import { colors } from "@/src/theme/tokens";

/** Área autenticada: sem sessão, volta para o fluxo de auth. */
export default function AppLayout() {
  const { session, loading } = useSession();
  const router = useRouter();

  const jaRegistrou = useRef(false);

  // `session` é um objeto novo a cada evento de auth (ex.: TOKEN_REFRESHED);
  // usar `!!session` evita reexecuções à toa deste efeito.
  const temSessao = !!session;

  useEffect(() => {
    if (!loading && !temSessao) router.replace("/(auth)/welcome");
  }, [loading, temSessao, router]);

  // Registra o aparelho uma vez por sessão. Falha silenciosa é aceitável
  // aqui: a tela de preferências explica o motivo em detalhe.
  useEffect(() => {
    const id = session?.user.id;
    if (!id || jaRegistrou.current) return;
    jaRegistrou.current = true;
    registrarParaPush(id);
  }, [session?.user.id]);

  // Push tocado leva direto ao item — é o atalho que faz a vaga urgente
  // valer: da tela bloqueada ao "tenho interesse" sem navegar.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((resposta) => {
      const rota = rotaDaNotificacao(resposta);
      if (rota) router.push(`/(app)${rota}` as never);
    });

    Notifications.getLastNotificationResponseAsync().then((resposta) => {
      const rota = resposta && rotaDaNotificacao(resposta);
      if (rota) router.push(`/(app)${rota}` as never);
    });

    return () => sub.remove();
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg }
      }}
    />
  );
}
