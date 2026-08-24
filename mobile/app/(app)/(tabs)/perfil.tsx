import { useCallback, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Avatar } from "@/src/components/Avatar";
import { Chip } from "@/src/components/Chip";
import { NotificationBell } from "@/src/components/NotificationBell";
import { SettingsButton } from "@/src/components/SettingsButton";
import { HeaderAcoes } from "@/src/components/HeaderAcoes";
import { useSession } from "@/src/lib/session";
import { buscarPerfil, listarCategorias, type PerfilCompleto, type Category } from "@/src/api/profile";
import { IconLink } from "@/src/components/TabIcons";
import { normalizarUrl, urlLegivel } from "@/src/lib/url";
import { colors, radius, space, type } from "@/src/theme/tokens";

export default function MeuPerfil() {
  const router = useRouter();
  const { session, signOut } = useSession();
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

  if (carregando) {
    return (
      <Screen scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  // Sessão válida no aparelho, mas sem perfil no banco: acontece quando a
  // conta foi apagada por fora (painel do Supabase) e o token continua no
  // Keychain. Antes isso caía no mesmo `if` do loading e girava para sempre
  // — e como o botão de sair vive nesta tela, a pessoa ficava presa dentro
  // do app sem nenhuma saída.
  if (!perfil) {
    return (
      <Screen scroll={false}>
        <View style={styles.centro}>
          <Text style={styles.erroTitulo}>Conta indisponível</Text>
          <Text style={styles.erroTexto}>
            Não encontramos seu perfil. Se a conta foi removida, saia e entre de novo.
          </Text>
          <Pressable
            style={styles.botaoSair}
            onPress={async () => {
              await signOut().catch(() => {});
              router.replace("/(auth)/welcome");
            }}
          >
            <Text style={styles.botaoSairTexto}>SAIR DA CONTA</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const { profile, professional, hirer, portfolio } = perfil;
  const ehProfissional = profile.tipo === "profissional";
  const site = professional?.site ?? hirer?.site ?? null;

  // A edição do portfólio vive na tela de editar perfil; daqui só levamos
  // a pessoa até lá.
  const irParaPortfolio = () => router.push("/(app)/perfil/editar?secao=portfolio");

  const nomesCategorias = categorias
    .filter((c) => professional?.categorias?.includes(c.id))
    .map((c) => c.nome);

  // Grade: o primeiro item ocupa 2x2 e vira capa; o resto segue em 3 colunas.
  const gap = 3;
  const larguraUtil = width - space.xl * 2;
  const celula = (larguraUtil - gap * 2) / 3;

  return (
    <Screen
      titulo="Perfil"
      right={
        <HeaderAcoes>
          <SettingsButton />
          <NotificationBell />
        </HeaderAcoes>
      }
    >
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

      {/* Contratante também tem nota e histórico, mas em `hirer_profiles`.
          Ler só de `professional` mostrava "-" e 0 para eles mesmo com
          avaliações reais, e ainda exibia "no portfólio", que não existe
          para esse tipo de conta. Mesma regra do perfil público. */}
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
        {ehProfissional && <Metric valor={String(portfolio.length)} rotulo="imagens" />}
      </View>

      {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      {!!site && (
        <Pressable
          style={styles.linkExterno}
          onPress={() => abrirSite(site)}
          accessibilityRole="link"
          accessibilityLabel={`Abrir ${urlLegivel(site)}`}
        >
          <IconLink color={colors.magenta} size={16} />
          <Text style={styles.linkExternoTexto} numberOfLines={1}>
            {urlLegivel(site)}
          </Text>
        </Pressable>
      )}

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
      </View>

      {ehProfissional && (
        <View style={styles.secaoPortfolio}>
          <Text style={styles.secaoTitulo}>Imagens</Text>

          {/* O card vazio era só texto e um toque sem pista nenhuma: para
              subir trabalho a pessoa tinha que adivinhar que o caminho era
              "Editar perfil". O (+) e o botão dizem para onde ir. */}
          {portfolio.length === 0 ? (
            <Pressable style={styles.vazio} onPress={irParaPortfolio}>
              <Text style={styles.vazioTitulo}>Nenhuma imagem ainda</Text>
              <Text style={styles.vazioTexto}>
                É por aqui que o contratante decide. Suba pelo menos três fotos do seu
                trabalho.
              </Text>
              <View style={styles.vazioBotao}>
                <Text style={styles.vazioBotaoTexto}>ADICIONAR IMAGENS</Text>
              </View>
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

              {/* Mesmo com a grade cheia faltava por onde acrescentar sem
                  passar por "Editar perfil". */}
              <Pressable
                style={[styles.adicionar, { width: celula, height: celula }]}
                onPress={irParaPortfolio}
                accessibilityRole="button"
                accessibilityLabel="Adicionar imagem"
              >
                <Text style={styles.adicionarSinal}>+</Text>
              </Pressable>
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


// O link vem normalizado com esquema na gravação, mas perfil antigo pode
// ter vindo sem — e `openURL` sem esquema não abre nada nem reclama.
async function abrirSite(url: string) {
  await Linking.openURL(normalizarUrl(url) ?? url).catch(() => {});
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.md },
  erroTitulo: { ...type.h2, color: colors.white, textAlign: "center" },
  erroTexto: { ...type.body, color: colors.inkDim, textAlign: "center" },
  botaoSair: {
    marginTop: space.lg,
    height: 52,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  botaoSairTexto: { ...type.button, color: colors.white },
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

  linkExterno: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    alignSelf: "flex-start",
    marginTop: space.lg
  },
  linkExternoTexto: { ...type.bodyMedium, color: colors.magenta, flexShrink: 1 },
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
  botaoSecundarioTexto: { ...type.button, fontSize: 12, color: colors.white },

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
  vazioTexto: { ...type.body, color: colors.inkDim },
  vazioBotao: {
    alignSelf: "flex-start",
    marginTop: space.md,
    height: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.magenta
  },
  vazioBotaoTexto: { ...type.button, fontSize: 11, color: colors.white },

  adicionar: {
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  adicionarSinal: { ...type.h2, color: colors.inkDim }
});
