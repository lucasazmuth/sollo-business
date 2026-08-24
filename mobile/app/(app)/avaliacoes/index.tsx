import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Avatar } from "@/src/components/Avatar";
import { avaliacoesPendentes, type AvaliacaoPendente } from "@/src/api/ratings";
import { colors, radius, space, type } from "@/src/theme/tokens";

function formatarData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AvaliacoesPendentes() {
  const router = useRouter();
  const [itens, setItens] = useState<AvaliacaoPendente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      avaliacoesPendentes()
        .then((v) => vivo && setItens(v))
        .catch(() => {})
        .finally(() => vivo && setCarregando(false));
      return () => {
        vivo = false;
      };
    }, [])
  );

  return (
    <Screen back titulo="Avaliações">
      <View style={styles.cabecalho}>
        <Text style={styles.estado}>
          {itens.length === 0 ? "Tudo em dia." : `${itens.length} pendente${itens.length > 1 ? "s" : ""}.`}
        </Text>
        <Text style={styles.lead}>
          Sua avaliação é a reputação que a próxima pessoa vê antes de decidir.
        </Text>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      ) : itens.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Nenhuma avaliação pendente</Text>
          <Text style={styles.vazioTexto}>
            Assim que um trabalho combinado passar da data, ele aparece aqui para você avaliar.
          </Text>
        </View>
      ) : (
        <View style={styles.lista}>
          {itens.map((item, i) => (
            <Animated.View
              key={`${item.job_id}-${item.rated_id}`}
              entering={FadeInDown.delay(i * 60).duration(420)}
            >
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/avaliacoes/[jobId]/[ratedId]",
                    params: {
                      jobId: item.job_id,
                      ratedId: item.rated_id,
                      nome: item.rated_nome ?? undefined
                    }
                  })
                }
              >
                <Avatar url={item.rated_avatar} nome={item.rated_nome} size={48} />
                <View style={styles.conteudo}>
                  <Text style={styles.nome} numberOfLines={1}>
                    {item.rated_nome ?? "Profissional"}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.titulo} · {formatarData(item.starts_at)}
                  </Text>
                </View>
                <Text style={styles.seta}>›</Text>
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
  estado: { ...type.body, color: colors.inkDim },
  lead: { ...type.body, color: colors.inkDim },

  lista: { gap: space.md, marginTop: space.xl, paddingBottom: space.xl },
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
  conteudo: { flex: 1, gap: 2 },
  nome: { ...type.bodyMedium, color: colors.white },
  meta: { ...type.caption, color: colors.inkDim },
  seta: { ...type.h2, color: colors.inkFaint },

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
