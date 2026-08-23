import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { NotificationBell } from "@/src/components/NotificationBell";
import { useSession } from "@/src/lib/session";
import { minhasVagas, type VagaDaLista } from "@/src/api/jobs";
import { formatarDataHora } from "@/src/components/DataHoraInput";
import { colors, radius, space, type } from "@/src/theme/tokens";

const CORES_STATUS: Record<string, string> = {
  rascunho: colors.inkFaint,
  aberta: colors.lime,
  preenchida: colors.magenta,
  encerrada: colors.inkFaint,
  cancelada: colors.danger
};

export function MinhasVagasContratante() {
  const router = useRouter();
  const { session } = useSession();
  const [vagas, setVagas] = useState<VagaDaLista[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      const id = session?.user.id;
      if (!id) return;

      minhasVagas(id)
        .then((v) => vivo && setVagas(v))
        .catch(() => {})
        .finally(() => vivo && setCarregando(false));

      return () => {
        vivo = false;
      };
    }, [session?.user.id])
  );

  return (
    <Screen logo right={<NotificationBell />}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Minhas vagas</Text>
        <Text style={styles.lead}>
          {vagas.length === 0
            ? "Você ainda não publicou nenhuma."
            : `${vagas.length} publicada${vagas.length > 1 ? "s" : ""}.`}
        </Text>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      ) : vagas.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Publique a primeira</Text>
          <Text style={styles.vazioTexto}>
            Vaga urgente avisa por push e e-mail quem está no raio e se encaixa na categoria.
          </Text>
        </View>
      ) : (
        <View style={styles.lista}>
          {vagas.map((v, i) => {
            const candidaturas = v.applications?.[0]?.count ?? 0;
            return (
              <Animated.View key={v.id} entering={FadeInDown.delay(i * 60).duration(450)}>
                <Pressable style={styles.card} onPress={() => router.push(`/(app)/vaga/${v.id}`)}>
                  <View style={styles.cardTopo}>
                    <Text
                      style={[styles.status, { color: CORES_STATUS[v.status] ?? colors.inkDim }]}
                    >
                      {v.status.toUpperCase()}
                    </Text>
                    {v.is_urgent && <Text style={styles.urgente}>URGENTE</Text>}
                  </View>

                  <Text style={styles.cardTitulo}>{v.titulo}</Text>

                  <Text style={styles.cardMeta}>
                    {formatarDataHora(new Date(v.starts_at))}
                    {v.cidade ? ` · ${v.cidade}` : ""}
                  </Text>

                  <View style={styles.cardRodape}>
                    <Text style={styles.categoria}>{v.categories?.nome ?? "-"}</Text>
                    <Text style={[styles.candidaturas, candidaturas > 0 && { color: colors.magenta }]}>
                      {candidaturas === 0
                        ? "sem candidaturas"
                        : `${candidaturas} candidatura${candidaturas > 1 ? "s" : ""}`}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      <View style={styles.rodape}>
        <Button label="Publicar nova vaga" onPress={() => router.push("/(app)/vaga/nova")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { paddingVertical: space["3xl"], alignItems: "center" },
  cabecalho: { gap: space.sm, paddingTop: space.lg },
  titulo: { ...type.h1, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },

  lista: { gap: space.md, marginTop: space.xl },
  card: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardTopo: { flexDirection: "row", gap: space.md, alignItems: "center" },
  status: { ...type.label, fontSize: 10 },
  urgente: { ...type.label, fontSize: 10, color: colors.magenta },
  cardTitulo: { ...type.h3, color: colors.white },
  cardMeta: { ...type.caption, color: colors.inkDim },
  cardRodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space.sm,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  categoria: { ...type.caption, color: colors.inkFaint },
  candidaturas: { ...type.caption, color: colors.inkFaint },

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
  vazioTexto: { ...type.body, color: colors.inkDim },

  rodape: { marginTop: "auto", paddingTop: space["2xl"], paddingBottom: space.lg }
});
