import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { VagaCard } from "@/src/components/VagaCard";
import { NotificationBell } from "@/src/components/NotificationBell";
import { FiltrosVagasModal } from "@/src/components/FiltrosVagasModal";
import { LARGURA_CONTEUDO, useEhDesktop, useGradeCards } from "@/src/lib/layout";
import { Wordmark } from "@/src/components/Logo";
import { useSession } from "@/src/lib/session";
import { buscarFeed, contarNoRaio, type VagaDoFeed } from "@/src/api/feed";
import { buscarPerfil, listarCategorias, type Category } from "@/src/api/profile";
import { idsDasVagasQueAplicei } from "@/src/api/applications";
import { colors, radius, space, type } from "@/src/theme/tokens";

export function FeedProfissional() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const desktop = useEhDesktop();
  const { colunas, larguraCard } = useGradeCards(space.md, space.xl);
  const { session, profile } = useSession();
  const userId = session?.user.id;

  const [vagas, setVagas] = useState<VagaDoFeed[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [temBase, setTemBase] = useState<boolean | null>(null);
  const [alemDoRaio, setAlemDoRaio] = useState(0);
  const [aplicadas, setAplicadas] = useState<Set<string>>(new Set());

  const [raio, setRaio] = useState<number | null>(null); // null = raio do perfil
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [apenasUrgentes, setApenasUrgentes] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  useEffect(() => {
    listarCategorias().then(setCategorias);
  }, []);

  const carregar = useCallback(async () => {
    if (!userId) return;

    const perfil = await buscarPerfil(userId);
    // `base_definida` em vez da coordenada: o app só precisa saber SE a base
    // existe, e ler o ponto pra isso era o que obrigava a expor a
    // localização de todo mundo na tabela-vitrine.
    const base = !!perfil?.professional?.base_definida;
    setTemBase(base);
    if (!base) {
      setVagas([]);
      return;
    }

    setAplicadas(await idsDasVagasQueAplicei(userId));

    const resultado = await buscarFeed({
      raioKm: raio,
      categorias: categoriaFiltro ? [categoriaFiltro] : null,
      apenasUrgentes
    });
    setVagas(resultado);

    // Vazio? Descobre se aumentar o raio resolveria.
    if (resultado.length === 0) {
      setAlemDoRaio(await contarNoRaio(100));
    }
  }, [userId, raio, categoriaFiltro, apenasUrgentes]);

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

  async function puxarParaAtualizar() {
    setAtualizando(true);
    await carregar().catch(() => {});
    setAtualizando(false);
  }

  const raioEfetivo = raio ?? 30;
  const filtrosAtivos = (raio !== null ? 1 : 0) + (categoriaFiltro ? 1 : 0) + (apenasUrgentes ? 1 : 0);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Esta tela monta o próprio SafeAreaView em vez de usar `Screen`
          (o feed rola com RefreshControl), então a fileira do topo entra
          aqui na mão, no mesmo lugar em que o `Screen` a desenha. O sininho
          mora aqui, e não junto do título: ao lado do FILTROS ele espremia
          a contagem de vagas a ponto de truncar ("4 oportunida..."). */}
      <View style={[styles.barraTopo, desktop && styles.contido]}>
        {/* Em desktop a marca já está no rail; repetir aqui seria ruído. */}
        {desktop ? <View /> : <Wordmark width={78} />}
        <NotificationBell />
      </View>

      <View style={[styles.cabecalho, desktop && styles.contido]}>
        <View style={styles.tituloLinha}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              <Text style={styles.dot}>● </Text>VAGAS PERTO DE VOCÊ
            </Text>
            <Text style={styles.titulo} numberOfLines={1}>
              {vagas.length > 0
                ? `${vagas.length} oportunidade${vagas.length > 1 ? "s" : ""}`
                : "Feed"}
            </Text>
          </View>

          <Pressable
            onPress={() => setFiltrosAbertos(true)}
            style={[styles.botaoFiltro, filtrosAtivos > 0 && styles.botaoFiltroAtivo]}
          >
            <Text style={[styles.botaoFiltroTexto, filtrosAtivos > 0 && { color: colors.white }]}>
              FILTROS{filtrosAtivos > 0 ? ` · ${filtrosAtivos}` : ""}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.lista,
          desktop && styles.contido,
          { paddingBottom: insets.bottom + space["3xl"] }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={puxarParaAtualizar}
            tintColor={colors.magenta}
          />
        }
      >
        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={colors.magenta} />
          </View>
        ) : temBase === false ? (
          <View style={styles.aviso}>
            <Text style={styles.avisoTitulo}>Defina onde você atua</Text>
            <Text style={styles.avisoTexto}>
              Sem sua base e o raio, não temos como mostrar o que está perto nem te avisar de vaga
              urgente na região.
            </Text>
            <Button
              label="Definir agora"
              onPress={() => router.push("/(app)/perfil/localizacao")}
              style={{ marginTop: space.lg }}
            />
          </View>
        ) : vagas.length === 0 ? (
          <View style={styles.aviso}>
            <Text style={styles.avisoTitulo}>Nada por aqui ainda</Text>
            <Text style={styles.avisoTexto}>
              {alemDoRaio > 0
                ? `Não há vaga dentro de ${raioEfetivo} km com esses filtros, mas existem ${alemDoRaio} até 100 km. Aumente o raio.`
                : "Nenhuma vaga aberta na sua região agora. Deixe as notificações ligadas: avisamos assim que surgir."}
            </Text>
            {alemDoRaio > 0 && (
              <Button
                label="Ampliar para 100 km"
                variant="ghost"
                onPress={() => setRaio(100)}
                style={{ marginTop: space.lg }}
              />
            )}
          </View>
        ) : (
          <View style={[styles.grade, colunas > 1 && styles.gradeColunas]}>
            {vagas.map((v, i) => (
              <Animated.View
                key={v.id}
                entering={FadeInDown.delay(Math.min(i, 6) * 60).duration(420)}
                style={larguraCard ? { width: larguraCard } : undefined}
              >
                <VagaCard
                  vaga={v}
                  jaAplicou={aplicadas.has(v.id)}
                  onPress={() => router.push(`/(app)/vaga/${v.id}`)}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <FiltrosVagasModal
        visivel={filtrosAbertos}
        onFechar={() => setFiltrosAbertos(false)}
        categorias={categorias}
        raio={raio}
        aoMudarRaio={setRaio}
        categoriaFiltro={categoriaFiltro}
        aoMudarCategoria={setCategoriaFiltro}
        apenasUrgentes={apenasUrgentes}
        aoMudarUrgentes={setApenasUrgentes}
        totalVagas={vagas.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  barraTopo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.sm
  },

  cabecalho: {
    paddingHorizontal: space.xl,
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  tituloLinha: { flexDirection: "row", alignItems: "flex-end", gap: space.md },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  titulo: { ...type.h2, color: colors.white, marginTop: space.sm },

  botaoFiltro: {
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line
  },
  botaoFiltroAtivo: { borderColor: colors.magenta, backgroundColor: "rgba(216,19,104,0.12)" },
  botaoFiltroTexto: { ...type.label, fontSize: 10, color: colors.inkDim },


  lista: { padding: space.xl, gap: space.md },
  contido: { width: "100%", maxWidth: LARGURA_CONTEUDO, alignSelf: "center" },
  grade: { gap: space.md },
  // `gap` no contêiner cuida do respiro; o negative-margin clássico não é
  // necessário porque a base já desconta o próprio gap no flexbox do RN.
  gradeColunas: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" },
  centro: { paddingVertical: space["3xl"], alignItems: "center" },

  aviso: {
    gap: space.sm,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.lineStrong
  },
  avisoTitulo: { ...type.h3, color: colors.white },
  avisoTexto: { ...type.body, color: colors.inkDim }
});
