import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Avatar } from "@/src/components/Avatar";
import { NotificationBell } from "@/src/components/NotificationBell";
import { useSession } from "@/src/lib/session";
import { listarConversas, type ConversaDaLista } from "@/src/api/chat";
import { colors, radius, space, type } from "@/src/theme/tokens";

function quando(iso: string | null) {
  if (!iso) return "";
  const min = (Date.now() - new Date(iso).getTime()) / 60000;
  if (min < 1) return "agora";
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 1440) return `${Math.round(min / 60)}h`;
  return `${Math.round(min / 1440)}d`;
}

export default function Conversas() {
  const router = useRouter();
  const { session, profile } = useSession();
  const ehContratante = profile?.tipo === "contratante";
  const [itens, setItens] = useState<ConversaDaLista[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      const id = session?.user.id;
      if (!id) return;

      listarConversas(id)
        .then((c) => vivo && setItens(c))
        .catch(() => {})
        .finally(() => vivo && setCarregando(false));

      return () => {
        vivo = false;
      };
    }, [session?.user.id])
  );

  const naoLidas = itens.reduce((t, c) => t + c.naoLidas, 0);

  return (
    <Screen logo right={<NotificationBell />}>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>CONVERSAS
        </Text>
        <Text style={styles.titulo}>
          {naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Em dia"}
        </Text>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      ) : itens.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Nenhuma conversa ainda</Text>
          <Text style={styles.vazioTexto}>
            {ehContratante
              ? "Abra a lista de candidatos de uma vaga e toque em Conversar para falar com quem te interessou."
              : "Quando um contratante quiser falar sobre a sua candidatura, a conversa aparece aqui."}
          </Text>
        </View>
      ) : (
        <View style={styles.lista}>
          {itens.map((c, i) => (
            <Animated.View key={c.id} entering={FadeInDown.delay(i * 55).duration(400)}>
              <Pressable
                style={[styles.card, c.naoLidas > 0 && styles.cardNaoLida]}
                onPress={() => router.push(`/(app)/conversa/${c.id}`)}
              >
                <Avatar url={c.outro?.avatar_url} nome={c.outro?.nome} size={48} />

                <View style={styles.conteudo}>
                  <View style={styles.linhaTopo}>
                    <Text style={styles.nome} numberOfLines={1}>
                      {c.outro?.nome ?? "Conversa"}
                    </Text>
                    <Text style={styles.tempo}>{quando(c.last_message_at)}</Text>
                  </View>

                  <Text style={styles.vaga} numberOfLines={1}>
                    {c.jobs?.titulo ?? "-"}
                  </Text>

                  <Text
                    style={[styles.previa, c.naoLidas > 0 && { color: colors.white }]}
                    numberOfLines={1}
                  >
                    {c.ultima ?? "Sem mensagens ainda"}
                  </Text>
                </View>

                {c.naoLidas > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTexto}>{c.naoLidas}</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { paddingVertical: space["3xl"], alignItems: "center" },
  cabecalho: { gap: space.sm, paddingTop: space.lg },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  titulo: { ...type.h1, color: colors.white },

  lista: { gap: space.sm, marginTop: space.xl, paddingBottom: space.xl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardNaoLida: { borderColor: colors.lineStrong, backgroundColor: colors.surface2 },
  conteudo: { flex: 1, gap: 2 },
  linhaTopo: { flexDirection: "row", alignItems: "center", gap: space.sm },
  nome: { ...type.bodyMedium, color: colors.white, flex: 1 },
  tempo: { ...type.caption, color: colors.inkFaint },
  vaga: { ...type.caption, color: colors.inkFaint },
  previa: { ...type.caption, color: colors.inkDim, marginTop: 2 },

  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.magenta,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeTexto: { ...type.label, fontSize: 10, color: colors.white },

  vazio: {
    gap: space.sm,
    marginTop: space.xl,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.lineStrong
  },
  vazioTitulo: { ...type.h3, color: colors.white },
  vazioTexto: { ...type.body, color: colors.inkDim }
});
