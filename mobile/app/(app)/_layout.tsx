import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { SideRail } from "@/src/components/SideRail";
import { useEhDesktop } from "@/src/lib/layout";
import { useSession } from "@/src/lib/session";
import { PUSH_SUPORTADO, registrarParaPush, rotaDaNotificacao } from "@/src/lib/notifications";
import { colors } from "@/src/theme/tokens";

/** Área autenticada: sem sessão, volta para o fluxo de auth. */
export default function AppLayout() {
  const { session, loading } = useSession();
  const router = useRouter();
  const desktop = useEhDesktop();

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
  //
  // Nada disso existe no navegador: `getLastNotificationResponseAsync` não
  // tem implementação web e derrubava a área logada inteira em
  // app.sollo.business com "not available on web".
  useEffect(() => {
    if (!PUSH_SUPORTADO) return;

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

  // O rail mora aqui, e não dentro de `(tabs)`, para não sumir quando a
  // pessoa abre uma tela empurrada: em desktop, perder a navegação inteira
  // ao entrar em Configurações ou no detalhe de uma vaga é justamente o que
  // um dashboard não faz.
  return (
    <View style={styles.raiz}>
      {desktop && <SideRail />}

      <View style={styles.conteudo}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, flexDirection: "row", backgroundColor: colors.bg },
  conteudo: { flex: 1 }
});
