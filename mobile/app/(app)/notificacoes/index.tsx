import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "@/src/lib/session";
import {
  listarNotificacoes,
  marcarLida,
  marcarTodasLidas,
  type Notificacao
} from "@/src/api/notifications";
import { colors, radius, space, type } from "@/src/theme/tokens";

const COR_EVENTO: Record<string, string> = {
  "job.published.nearby": colors.magenta,
  "application.received": colors.magenta,
  "application.selected": colors.lime,
  "application.rejected": colors.inkFaint,
  "message.received": colors.white,
  "job.cancelled": colors.danger,
  "job.reminder": colors.lime,
  "rating.received": colors.lime
};

function quandoRelativo(iso: string) {
  const min = (Date.now() - new Date(iso).getTime()) / 60000;
  if (min < 1) return "agora";
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 1440) return `${Math.round(min / 60)}h`;
  return `${Math.round(min / 1440)}d`;
}

export default function Notificacoes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const userId = session?.user.id;

  const [itens, setItens] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    if (!userId) return;
    setItens(await listarNotificacoes(userId));
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      carregar()
        .catch(() => {})
        .finally(() => vivo && setCarregando(false));
      return () => {
        vivo = false;
      };
    }, [carregar])
  );

  async function abrir(n: Notificacao) {
    if (!n.read_at) {
      await marcarLida(n.id).catch(() => {});
      setItens((atual) =>
        atual.map((i) => (i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i))
      );
    }
    const rota = (n.data as { rota?: string })?.rota;
    if (rota) router.push(`/(app)${rota}` as never);
  }

  const naoLidas = itens.filter((i) => !i.read_at).length;

  return (
    <View style={styles.root}>
      <View style={[styles.cabecalho, { paddingTop: insets.top + space.md }]}>
        <View style={styles.linhaTopo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              <Text style={styles.dot}>● </Text>NOTIFICAÇÕES
            </Text>
            <Text style={styles.titulo} numberOfLines={1}>
              {naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Em dia"}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/(app)/notificacoes/preferencias")}
            style={styles.botaoAjustes}
          >
            <Text style={styles.botaoAjustesTexto}>AJUSTES</Text>
          </Pressable>
        </View>

        {naoLidas > 0 && (
          <Pressable
            onPress={async () => {
              if (!userId) return;
              await marcarTodasLidas(userId);
              await carregar();
            }}
            hitSlop={8}
            style={styles.marcarTodas}
          >
            <Text style={styles.marcarTodasTexto}>Marcar todas como lidas</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + space["3xl"] }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            tintColor={colors.magenta}
            onRefresh={async () => {
              setAtualizando(true);
              await carregar().catch(() => {});
              setAtualizando(false);
            }}
          />
        }
      >
        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={colors.magenta} />
          </View>
        ) : itens.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTitulo}>Nada por aqui</Text>
            <Text style={styles.vazioTexto}>
              Avisamos quando surgir vaga na sua região, quando alguém se candidatar e quando
              houver resposta.
            </Text>
          </View>
        ) : (
          itens.map((n, i) => (
            <Animated.View key={n.id} entering={FadeInDown.delay(Math.min(i, 8) * 45).duration(380)}>
              <Pressable
                style={[styles.card, !n.read_at && styles.cardNaoLida]}
                onPress={() => abrir(n)}
              >
                <View
                  style={[
                    styles.marcador,
                    { backgroundColor: COR_EVENTO[n.evento] ?? colors.inkFaint },
                    !!n.read_at && { opacity: 0.3 }
                  ]}
                />
                <View style={styles.conteudo}>
                  <View style={styles.linhaTitulo}>
                    <Text style={[styles.cardTitulo, !!n.read_at && styles.lida]} numberOfLines={1}>
                      {n.titulo}
                    </Text>
                    <Text style={styles.tempo}>{quandoRelativo(n.created_at)}</Text>
                  </View>
                  <Text style={styles.cardCorpo} numberOfLines={2}>
                    {n.corpo}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  cabecalho: {
    paddingHorizontal: space.xl,
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  linhaTopo: { flexDirection: "row", alignItems: "flex-end", gap: space.md },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  titulo: { ...type.h2, color: colors.white, marginTop: space.sm },
  botaoAjustes: {
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line
  },
  botaoAjustesTexto: { ...type.label, fontSize: 10, color: colors.inkDim },
  marcarTodas: { marginTop: space.md },
  marcarTodasTexto: { ...type.caption, color: colors.magenta },

  lista: { padding: space.xl, gap: space.sm },
  centro: { paddingVertical: space["3xl"], alignItems: "center" },

  card: {
    flexDirection: "row",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardNaoLida: { borderColor: colors.lineStrong, backgroundColor: colors.surface2 },
  marcador: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  conteudo: { flex: 1, gap: 4 },
  linhaTitulo: { flexDirection: "row", alignItems: "center", gap: space.sm },
  cardTitulo: { ...type.bodyMedium, color: colors.white, flex: 1 },
  lida: { color: colors.inkDim },
  tempo: { ...type.caption, color: colors.inkFaint },
  cardCorpo: { ...type.caption, color: colors.inkDim },

  vazio: {
    gap: space.sm,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.lineStrong
  },
  vazioTitulo: { ...type.h3, color: colors.white },
  vazioTexto: { ...type.body, color: colors.inkDim }
});
