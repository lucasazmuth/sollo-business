import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Avatar } from "@/src/components/Avatar";
import { Chip } from "@/src/components/Chip";
import { buscarPerfil, listarCategorias, type Category, type PerfilCompleto } from "@/src/api/profile";
import { avaliacoesRecebidas, type AvaliacaoRecebida } from "@/src/api/ratings";
import { StarRating } from "@/src/components/StarRating";
import { colors, radius, space, type } from "@/src/theme/tokens";

/** Perfil público — o que o contratante vê antes de escolher. */
export default function PerfilPublico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const [perfil, setPerfil] = useState<PerfilCompleto | null>(null);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRecebida[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;
    let vivo = true;

    Promise.all([buscarPerfil(id), listarCategorias(), avaliacoesRecebidas(id)])
      .then(([p, c, a]) => {
        if (!vivo) return;
        setPerfil(p);
        setCategorias(c);
        setAvaliacoes(a);
      })
      .finally(() => vivo && setCarregando(false));

    return () => {
      vivo = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <Screen back scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  if (!perfil) {
    return (
      <Screen back scroll={false}>
        <View style={styles.centro}>
          <Text style={styles.vazio}>Perfil não encontrado.</Text>
        </View>
      </Screen>
    );
  }

  const { profile, professional, hirer, portfolio } = perfil;
  const ehProfissional = profile.tipo === "profissional";

  const nomesCategorias = categorias
    .filter((c) => professional?.categorias?.includes(c.id))
    .map((c) => c.nome);

  const gap = 3;
  const celula = (width - space.xl * 2 - gap * 2) / 3;

  return (
    <Screen back>
      <Animated.View entering={FadeIn.duration(400)} style={styles.topo}>
        <Avatar
          url={profile.avatar_url}
          nome={profile.nome}
          size={92}
          disponivel={ehProfissional ? professional?.disponivel : undefined}
        />
        <View style={styles.identidade}>
          <Text style={styles.nome}>{profile.nome}</Text>
          {!!professional?.headline && <Text style={styles.headline}>{professional.headline}</Text>}
          {!!hirer?.empresa && <Text style={styles.headline}>{hirer.empresa}</Text>}
          {!!professional?.base_label && (
            <Text style={styles.local}>
              {professional.base_label} · atende até {professional.raio_km} km
            </Text>
          )}
        </View>
      </Animated.View>

      <View style={styles.metricas}>
        <Metric
          valor={
            professional?.rating_avg
              ? Number(professional.rating_avg).toFixed(1)
              : hirer?.rating_avg
                ? Number(hirer.rating_avg).toFixed(1)
                : "-"
          }
          rotulo="avaliação"
        />
        <Metric
          valor={String(professional?.rating_count ?? hirer?.rating_count ?? 0)}
          rotulo="trabalhos"
        />
        {ehProfissional && <Metric valor={String(portfolio.length)} rotulo="no portfólio" />}
      </View>

      {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      {!!hirer?.sobre && <Text style={styles.bio}>{hirer.sobre}</Text>}

      {nomesCategorias.length > 0 && (
        <View style={styles.categorias}>
          {nomesCategorias.map((n) => (
            <Chip key={n} label={n} />
          ))}
        </View>
      )}

      {ehProfissional && portfolio.length > 0 && (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Portfólio</Text>
          <View style={[styles.grade, { gap }]}>
            {portfolio.map((item, i) => {
              const lado = i === 0 ? celula * 2 + gap : celula;
              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(i * 60).duration(500)}>
                  <Image
                    source={{ uri: item.media_url }}
                    style={{ width: lado, height: lado, borderRadius: 4 }}
                    contentFit="cover"
                    transition={200}
                  />
                </Animated.View>
              );
            })}
          </View>
        </View>
      )}

      {avaliacoes.length > 0 && (
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Avaliações</Text>
          <View style={{ gap: space.md }}>
            {avaliacoes.map((a, i) => (
              <Animated.View
                key={a.id}
                entering={FadeInDown.delay(i * 60).duration(420)}
                style={styles.avaliacao}
              >
                <View style={styles.avaliacaoTopo}>
                  <Avatar url={a.rater_avatar} nome={a.rater_nome} size={36} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.avaliacaoNome}>{a.rater_nome ?? "Alguém"}</Text>
                    <Text style={styles.avaliacaoVaga} numberOfLines={1}>
                      {a.job_titulo}
                    </Text>
                  </View>
                  <StarRating valor={a.nota} somenteLeitura tamanho={14} />
                </View>
                {!!a.comentario && <Text style={styles.avaliacaoTexto}>{a.comentario}</Text>}
              </Animated.View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

function Metric({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.metrica}>
      <Text style={styles.metricaValor}>{valor}</Text>
      <Text style={styles.metricaRotulo}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  vazio: { ...type.body, color: colors.inkDim },

  topo: { flexDirection: "row", gap: space.lg, alignItems: "center", paddingTop: space.lg },
  identidade: { flex: 1, gap: 2 },
  nome: { ...type.h2, color: colors.white },
  headline: { ...type.bodyMedium, color: colors.inkDim },
  local: { ...type.caption, color: colors.inkFaint, marginTop: 2 },

  metricas: {
    flexDirection: "row",
    gap: space.xl,
    marginTop: space.xl,
    paddingVertical: space.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line
  },
  metrica: { gap: 2 },
  metricaValor: { ...type.h3, color: colors.white },
  metricaRotulo: { ...type.label, color: colors.inkFaint },

  bio: { ...type.body, color: colors.inkDim, marginTop: space.lg },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.lg },

  secao: { marginTop: space["2xl"], gap: space.lg, paddingBottom: space.xl },
  secaoTitulo: { ...type.h3, color: colors.white },
  grade: { flexDirection: "row", flexWrap: "wrap" },

  avaliacao: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  avaliacaoTopo: { flexDirection: "row", alignItems: "center", gap: space.md },
  avaliacaoNome: { ...type.bodyMedium, color: colors.white },
  avaliacaoVaga: { ...type.caption, color: colors.inkFaint },
  avaliacaoTexto: { ...type.body, color: colors.inkDim }
});
