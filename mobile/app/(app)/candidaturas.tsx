import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { useSession } from "@/src/lib/session";
import {
  minhasCandidaturas,
  ROTULO_STATUS_CANDIDATURA,
  type CandidaturaDaLista
} from "@/src/api/applications";
import { formatarDataHora } from "@/src/components/DataHoraInput";
import { colors, radius, space, type } from "@/src/theme/tokens";

const COR_STATUS: Record<string, string> = {
  aplicada: colors.inkDim,
  vista: colors.white,
  selecionada: colors.lime,
  recusada: colors.inkFaint,
  retirada: colors.inkFaint
};

export default function MinhasCandidaturas() {
  const router = useRouter();
  const { session } = useSession();
  const [itens, setItens] = useState<CandidaturaDaLista[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      const id = session?.user.id;
      if (!id) return;

      minhasCandidaturas(id)
        .then((c) => vivo && setItens(c))
        .catch(() => {})
        .finally(() => vivo && setCarregando(false));

      return () => {
        vivo = false;
      };
    }, [session?.user.id])
  );

  const selecionadas = itens.filter((i) => i.status === "selecionada").length;

  return (
    <Screen back>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>MINHAS CANDIDATURAS
        </Text>
        <Text style={styles.titulo}>
          {itens.length === 0 ? "Nenhuma ainda" : `${itens.length} enviada${itens.length > 1 ? "s" : ""}`}
        </Text>
        {selecionadas > 0 && (
          <Text style={styles.destaque}>
            Você foi escolhido em {selecionadas} {selecionadas > 1 ? "vagas" : "vaga"}.
          </Text>
        )}
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      ) : itens.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Comece pelo feed</Text>
          <Text style={styles.vazioTexto}>
            Candidatar leva um toque: seu perfil já é a inscrição.
          </Text>
          <Button
            label="Ver vagas perto de mim"
            onPress={() => router.push("/(app)/feed")}
            style={{ marginTop: space.lg }}
          />
        </View>
      ) : (
        <View style={styles.lista}>
          {itens.map((c, i) => {
            const vagaCancelada = c.jobs?.status === "cancelada";
            return (
              <Animated.View key={c.id} entering={FadeInDown.delay(i * 60).duration(420)}>
                <Pressable
                  style={[styles.card, c.status === "selecionada" && styles.cardOk]}
                  onPress={() => c.jobs && router.push(`/(app)/vaga/${c.jobs.id}`)}
                >
                  <View style={styles.topo}>
                    <Text style={[styles.status, { color: COR_STATUS[c.status] }]}>
                      {vagaCancelada ? "VAGA CANCELADA" : ROTULO_STATUS_CANDIDATURA[c.status].toUpperCase()}
                    </Text>
                    {c.jobs?.is_urgent && <Text style={styles.urgente}>URGENTE</Text>}
                  </View>

                  <Text style={styles.cardTitulo} numberOfLines={2}>
                    {c.jobs?.titulo ?? "Vaga"}
                  </Text>

                  {!!c.jobs && (
                    <Text style={styles.meta}>
                      {formatarDataHora(new Date(c.jobs.starts_at))}
                      {c.jobs.cidade ? ` · ${c.jobs.cidade}` : ""}
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
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
  destaque: { ...type.bodyMedium, color: colors.lime },

  lista: { gap: space.md, marginTop: space.xl, paddingBottom: space.xl },
  card: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardOk: { borderColor: colors.lime },
  topo: { flexDirection: "row", gap: space.md, alignItems: "center" },
  status: { ...type.label, fontSize: 10 },
  urgente: { ...type.label, fontSize: 10, color: colors.magenta },
  cardTitulo: { ...type.h3, color: colors.white },
  meta: { ...type.caption, color: colors.inkDim },

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
