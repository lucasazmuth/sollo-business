import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Avatar } from "@/src/components/Avatar";
import {
  candidatosDaVaga,
  marcarComoVista,
  recusarCandidato,
  selecionarCandidato,
  type Candidato
} from "@/src/api/applications";
import { buscarVaga, type VagaDetalhe } from "@/src/api/jobs";
import { abrirConversa } from "@/src/api/chat";
import { colors, radius, space, type } from "@/src/theme/tokens";

export default function Candidatos() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [vaga, setVaga] = useState<VagaDetalhe | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [agindo, setAgindo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!id) return;
    const [v, cs] = await Promise.all([buscarVaga(id), candidatosDaVaga(id)]);
    setVaga(v);
    setCandidatos(cs);

    // Abrir a lista já marca como visualizada: o candidato vê que
    // alguém olhou, em vez de ficar no silêncio.
    await Promise.all(
      cs.filter((c) => c.status === "aplicada").map((c) => marcarComoVista(c.id))
    ).catch(() => {});
  }, [id]);

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

  function confirmarSelecao(c: Candidato) {
    Alert.alert(
      `Escolher ${c.profiles?.nome ?? "este candidato"}?`,
      "A vaga é fechada e os demais candidatos são avisados automaticamente.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Escolher",
          onPress: async () => {
            setAgindo(c.id);
            try {
              await selecionarCandidato(c.id);
              await carregar();
            } catch (e) {
              Alert.alert("Não deu", e instanceof Error ? e.message : "Falha ao selecionar.");
            } finally {
              setAgindo(null);
            }
          }
        }
      ]
    );
  }

  // A conversa nasce daqui, de um toque do contratante — não mais de um
  // trigger em toda candidatura, que abria dezenas de canais vazios.
  async function conversar(c: Candidato) {
    if (!id) return;
    setAgindo(c.id);
    try {
      const conversaId = await abrirConversa(id, c.professional_id);
      router.push(`/(app)/conversa/${conversaId}`);
    } catch (e) {
      Alert.alert("Não deu", e instanceof Error ? e.message : "Falha ao abrir a conversa.");
    } finally {
      setAgindo(null);
    }
  }

  async function recusar(c: Candidato) {
    setAgindo(c.id);
    try {
      await recusarCandidato(c.id);
      await carregar();
    } catch (e) {
      Alert.alert("Não deu", e instanceof Error ? e.message : "Falha ao recusar.");
    } finally {
      setAgindo(null);
    }
  }

  const ativos = candidatos.filter((c) => c.status !== "retirada");
  const vagaFechada = vaga?.status !== "aberta";

  return (
    <Screen back>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>CANDIDATOS
        </Text>
        <Text style={styles.titulo} numberOfLines={2}>
          {vaga?.titulo ?? "Vaga"}
        </Text>
        <Text style={styles.lead}>
          {ativos.length === 0
            ? "Ninguém se candidatou ainda."
            : `${ativos.length} candidatura${ativos.length > 1 ? "s" : ""}.`}
        </Text>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      ) : ativos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Ainda no silêncio</Text>
          <Text style={styles.vazioTexto}>
            Assim que alguém da região se candidatar, avisamos você por notificação.
          </Text>
        </View>
      ) : (
        <View style={styles.lista}>
          {ativos.map((c, i) => {
            const selecionado = c.status === "selecionada";
            const recusado = c.status === "recusada";
            const ocupado = agindo === c.id;

            return (
              <Animated.View key={c.id} entering={FadeInDown.delay(i * 60).duration(420)}>
                <View
                  style={[
                    styles.card,
                    selecionado && styles.cardSelecionado,
                    recusado && styles.cardRecusado
                  ]}
                >
                  <Pressable
                    style={styles.identidade}
                    onPress={() => router.push(`/(app)/perfil/${c.professional_id}`)}
                  >
                    <Avatar url={c.profiles?.avatar_url} nome={c.profiles?.nome} size={52} />

                    <View style={styles.identidadeTexto}>
                      <Text style={styles.nome}>{c.profiles?.nome ?? "Profissional"}</Text>
                      {!!c.professional_profiles?.headline && (
                        <Text style={styles.headline} numberOfLines={1}>
                          {c.professional_profiles.headline}
                        </Text>
                      )}
                      <View style={styles.metaLinha}>
                        {!!c.professional_profiles?.base_label && (
                          <Text style={styles.meta}>{c.professional_profiles.base_label}</Text>
                        )}
                        {!!c.professional_profiles?.rating_count && (
                          <Text style={styles.meta}>
                            ★ {Number(c.professional_profiles.rating_avg).toFixed(1)} (
                            {c.professional_profiles.rating_count})
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>

                  {!!c.mensagem && <Text style={styles.mensagem}>“{c.mensagem}”</Text>}

                  {selecionado ? (
                    <View style={styles.faixaOk}>
                      <View style={styles.pontoOk} />
                      <Text style={styles.faixaOkTexto}>Escolhido para a vaga</Text>
                    </View>
                  ) : recusado ? (
                    <Text style={styles.faixaRecusado}>Não selecionado</Text>
                  ) : null}

                  {!recusado && (
                    <View style={styles.acoes}>
                      {!selecionado && !vagaFechada && (
                        <Pressable
                          style={[styles.botao, styles.botaoRecusar]}
                          onPress={() => recusar(c)}
                          disabled={ocupado}
                        >
                          <Text style={styles.botaoRecusarTexto}>RECUSAR</Text>
                        </Pressable>
                      )}

                      <Pressable
                        style={[styles.botao, styles.botaoConversar]}
                        onPress={() => conversar(c)}
                        disabled={ocupado}
                      >
                        <Text style={styles.botaoConversarTexto}>CONVERSAR</Text>
                      </Pressable>

                      {!selecionado && !vagaFechada && (
                        <Pressable
                          style={[styles.botao, styles.botaoEscolher]}
                          onPress={() => confirmarSelecao(c)}
                          disabled={ocupado}
                        >
                          {ocupado ? (
                            <ActivityIndicator color={colors.white} size="small" />
                          ) : (
                            <Text style={styles.botaoEscolherTexto}>ESCOLHER</Text>
                          )}
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
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
  titulo: { ...type.h2, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },

  lista: { gap: space.md, marginTop: space.xl, paddingBottom: space.xl },
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardSelecionado: { borderColor: colors.lime },
  cardRecusado: { opacity: 0.5 },

  identidade: { flexDirection: "row", gap: space.md, alignItems: "center" },
  identidadeTexto: { flex: 1, gap: 2 },
  nome: { ...type.h3, color: colors.white },
  headline: { ...type.caption, color: colors.inkDim },
  metaLinha: { flexDirection: "row", gap: space.md, marginTop: 2 },
  meta: { ...type.caption, color: colors.inkFaint },

  mensagem: { ...type.body, color: colors.inkDim, fontStyle: "italic" },

  acoes: { flexDirection: "row", gap: space.md, marginTop: space.xs },
  botao: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  botaoRecusar: { borderWidth: 1, borderColor: colors.line },
  botaoRecusarTexto: { ...type.button, fontSize: 11, color: colors.inkDim },
  botaoConversar: { borderWidth: 1, borderColor: colors.lineStrong },
  botaoConversarTexto: { ...type.button, fontSize: 11, color: colors.white },
  botaoEscolher: { backgroundColor: colors.magenta },
  botaoEscolherTexto: { ...type.button, fontSize: 11, color: colors.white },

  faixaOk: { flexDirection: "row", alignItems: "center", gap: space.sm },
  pontoOk: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime },
  faixaOkTexto: { ...type.bodyMedium, color: colors.lime },
  faixaRecusado: { ...type.caption, color: colors.inkFaint },

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
