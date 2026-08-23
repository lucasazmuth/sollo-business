import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Avatar } from "@/src/components/Avatar";
import { Chip } from "@/src/components/Chip";
import { NotificationBell } from "@/src/components/NotificationBell";
import { useSession } from "@/src/lib/session";
import { buscarPerfil, listarCategorias, type PerfilCompleto, type Category } from "@/src/api/profile";
import { colors, radius, space, type } from "@/src/theme/tokens";

export default function MeuPerfil() {
  const router = useRouter();
  const { session } = useSession();
  const { width } = useWindowDimensions();

  const [perfil, setPerfil] = useState<PerfilCompleto | null>(null);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Recarrega ao voltar da edição — sem isso o perfil mostra dado velho.
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      const id = session?.user.id;
      if (!id) return;

      Promise.all([buscarPerfil(id), listarCategorias()])
        .then(([p, c]) => {
          if (!vivo) return;
          setPerfil(p);
          setCategorias(c);
        })
        .finally(() => vivo && setCarregando(false));

      return () => {
        vivo = false;
      };
    }, [session?.user.id])
  );

  if (carregando || !perfil) {
    return (
      <Screen scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  const { profile, professional, hirer, portfolio } = perfil;
  const ehProfissional = profile.tipo === "profissional";

  const nomesCategorias = categorias
    .filter((c) => professional?.categorias?.includes(c.id))
    .map((c) => c.nome);

  // Grade: o primeiro item ocupa 2x2 e vira capa; o resto segue em 3 colunas.
  const gap = 3;
  const larguraUtil = width - space.xl * 2;
  const celula = (larguraUtil - gap * 2) / 3;

  return (
    <Screen right={<NotificationBell />}>
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

      {ehProfissional && (
        <View style={styles.status}>
          <View
            style={[styles.pontoStatus, { backgroundColor: professional?.disponivel ? colors.lime : colors.inkFaint }]}
          />
          <Text style={styles.statusTexto}>
            {professional?.disponivel ? "Disponível para vagas" : "Indisponível no momento"}
          </Text>
        </View>
      )}

      <View style={styles.metricas}>
        <Metric
          valor={professional?.rating_avg ? Number(professional.rating_avg).toFixed(1) : "-"}
          rotulo="avaliação"
        />
        <Metric valor={String(professional?.rating_count ?? 0)} rotulo="trabalhos" />
        <Metric valor={String(portfolio.length)} rotulo="no portfólio" />
      </View>

      {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      {nomesCategorias.length > 0 && (
        <View style={styles.categorias}>
          {nomesCategorias.map((n) => (
            <Chip key={n} label={n} />
          ))}
        </View>
      )}

      <View style={styles.acoes}>
        <Pressable style={styles.botaoSecundario} onPress={() => router.push("/(app)/perfil/editar")}>
          <Text style={styles.botaoSecundarioTexto}>EDITAR PERFIL</Text>
        </Pressable>
        {ehProfissional && (
          <Pressable
            style={styles.botaoSecundario}
            onPress={() => router.push("/(app)/perfil/localizacao")}
          >
            <Text style={styles.botaoSecundarioTexto}>ONDE EU ATUO</Text>
          </Pressable>
        )}
        <Pressable
          style={styles.botaoSecundario}
          onPress={() => router.push("/(app)/perfil/configuracoes")}
        >
          <Text style={styles.botaoSecundarioTexto}>CONFIGURAÇÕES</Text>
        </Pressable>
      </View>

      {ehProfissional && (
        <View style={styles.secaoPortfolio}>
          <Text style={styles.secaoTitulo}>Portfólio</Text>

          {portfolio.length === 0 ? (
            <Pressable style={styles.vazio} onPress={() => router.push("/(app)/perfil/editar")}>
              <Text style={styles.vazioTitulo}>Seu portfólio está vazio</Text>
              <Text style={styles.vazioTexto}>
                É por aqui que o contratante decide. Suba pelo menos três trabalhos.
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.grade, { gap }]}>
              {portfolio.map((item, i) => {
                const grande = i === 0;
                const lado = grande ? celula * 2 + gap : celula;
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
          )}
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
  topo: { flexDirection: "row", gap: space.lg, alignItems: "center", paddingTop: space.lg },
  identidade: { flex: 1, gap: 2 },
  nome: { ...type.h2, color: colors.white },
  headline: { ...type.bodyMedium, color: colors.inkDim },
  local: { ...type.caption, color: colors.inkFaint, marginTop: 2 },

  status: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.lg },
  pontoStatus: { width: 8, height: 8, borderRadius: 4 },
  statusTexto: { ...type.caption, color: colors.inkDim },

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

  acoes: { flexDirection: "row", gap: space.md, marginTop: space.xl },
  botaoSecundario: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  botaoSecundarioTexto: { ...type.button, fontSize: 11, color: colors.white },

  secaoPortfolio: { marginTop: space["2xl"], gap: space.lg, paddingBottom: space.xl },
  secaoTitulo: { ...type.h3, color: colors.white },
  grade: { flexDirection: "row", flexWrap: "wrap" },

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
