import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Avatar } from "@/src/components/Avatar";
import { useSession } from "@/src/lib/session";
import { buscarVaga, cancelarVaga, alcanceDaVaga, type VagaDetalhe } from "@/src/api/jobs";
import {
  candidatar,
  minhaCandidatura,
  retirarCandidatura,
  ROTULO_STATUS_CANDIDATURA,
  type Application
} from "@/src/api/applications";
import { formatarDataHora } from "@/src/components/DataHoraInput";
import { colors, radius, space, type } from "@/src/theme/tokens";

const ROTULO_STATUS: Record<string, { texto: string; cor: string }> = {
  rascunho: { texto: "RASCUNHO", cor: colors.inkFaint },
  aberta: { texto: "ABERTA", cor: colors.lime },
  preenchida: { texto: "PREENCHIDA", cor: colors.magenta },
  encerrada: { texto: "ENCERRADA", cor: colors.inkFaint },
  cancelada: { texto: "CANCELADA", cor: colors.danger }
};

export default function DetalheVaga() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, profile } = useSession();
  const userId = session?.user.id;

  const [vaga, setVaga] = useState<VagaDetalhe | null>(null);
  const [alcance, setAlcance] = useState<number | null>(null);
  const [candidatura, setCandidatura] = useState<Application | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      if (!id || !userId) return;

      (async () => {
        const v = await buscarVaga(id);
        if (!vivo) return;
        setVaga(v);

        if (!v) return;
        if (v.hirer_id === userId) {
          setAlcance(await alcanceDaVaga(v.id));
        } else {
          setCandidatura(await minhaCandidatura(v.id, userId));
        }
      })()
        .catch(() => {})
        .finally(() => vivo && setCarregando(false));

      return () => {
        vivo = false;
      };
    }, [id, userId])
  );

  async function aplicar() {
    if (!vaga || !userId) return;
    setEnviando(true);
    try {
      const nova = await candidatar(vaga.id, userId);
      setCandidatura(nova);
    } catch (e) {
      Alert.alert("Não deu", e instanceof Error ? e.message : "Falha ao se candidatar.");
    } finally {
      setEnviando(false);
    }
  }

  function confirmarRetirada() {
    if (!candidatura) return;
    Alert.alert("Retirar candidatura?", "O contratante deixa de ver seu perfil nesta vaga.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Retirar",
        style: "destructive",
        onPress: async () => {
          await retirarCandidatura(candidatura.id);
          setCandidatura({ ...candidatura, status: "retirada" });
        }
      }
    ]);
  }

  function confirmarCancelamento() {
    Alert.alert("Cancelar a vaga?", "Todos os candidatos serão avisados. Isso não pode ser desfeito.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar vaga",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelarVaga(vaga!.id);
            router.back();
          } catch (e) {
            Alert.alert("Não deu", e instanceof Error ? e.message : "Falha ao cancelar.");
          }
        }
      }
    ]);
  }

  if (carregando) {
    return (
      <Screen back scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  if (!vaga) {
    return (
      <Screen back scroll={false}>
        <View style={styles.centro}>
          <Text style={styles.vazio}>Vaga não encontrada ou não está mais disponível.</Text>
        </View>
      </Screen>
    );
  }

  const souDono = vaga.hirer_id === userId;
  const status = ROTULO_STATUS[vaga.status] ?? ROTULO_STATUS.aberta;
  const podeGerir = souDono && ["rascunho", "aberta"].includes(vaga.status);
  const souProfissional = profile?.tipo === "profissional";
  const candidaturaAtiva = candidatura && candidatura.status !== "retirada";
  const vagaAceitaCandidatura = vaga.status === "aberta" && new Date(vaga.starts_at) > new Date();

  return (
    <Screen back>
      {!!vaga.cover_url && (
        <Image source={{ uri: vaga.cover_url }} style={styles.capa} contentFit="cover" />
      )}

      <View style={styles.selos}>
        <Text style={[styles.selo, { color: status.cor, borderColor: status.cor }]}>{status.texto}</Text>
        {vaga.is_urgent && <Text style={[styles.selo, styles.seloUrgente]}>URGENTE</Text>}
        {!!vaga.categories?.nome && <Text style={styles.selo}>{vaga.categories.nome}</Text>}
      </View>

      <Text style={styles.titulo}>{vaga.titulo}</Text>

      <Pressable
        style={styles.contratante}
        onPress={() => router.push(`/(app)/perfil/${vaga.hirer_id}`)}
      >
        <Avatar url={vaga.profiles?.avatar_url} nome={vaga.profiles?.nome} size={36} />
        <Text style={styles.contratanteNome}>{vaga.profiles?.nome ?? "Contratante"}</Text>
      </Pressable>

      <View style={styles.fatos}>
        <Fato rotulo="QUANDO" valor={formatarDataHora(new Date(vaga.starts_at))} />
        <Fato
          rotulo="ONDE"
          valor={vaga.endereco_texto ?? [vaga.cidade, vaga.uf].filter(Boolean).join("/") ?? "—"}
        />
        <Fato
          rotulo="CACHÊ"
          valor={
            vaga.pay_type === "valor" && vaga.pay_amount
              ? `R$ ${Number(vaga.pay_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "A combinar"
          }
        />
        <Fato rotulo="NOTA FISCAL" valor={vaga.requires_invoice ? "Exigida" : "Não exigida"} />
        {vaga.vagas_qtd > 1 && <Fato rotulo="VAGAS" valor={String(vaga.vagas_qtd)} />}
      </View>

      <Text style={styles.descricao}>{vaga.descricao}</Text>

      {souDono && alcance !== null && vaga.status === "aberta" && (
        <View style={styles.alcance}>
          <Text style={styles.alcanceNumero}>{alcance}</Text>
          <Text style={styles.alcanceTexto}>
            {alcance === 1
              ? "profissional da região se encaixa nesta vaga"
              : "profissionais da região se encaixam nesta vaga"}
          </Text>
        </View>
      )}

      {podeGerir && (
        <View style={styles.acoes}>
          <Button label="Ver candidatos" onPress={() => router.push(`/(app)/vaga/${vaga.id}/candidatos`)} />
          <Pressable onPress={confirmarCancelamento} hitSlop={8} style={styles.linkPerigo}>
            <Text style={styles.linkPerigoTexto}>Cancelar vaga</Text>
          </Pressable>
        </View>
      )}

      {/* Candidatura: um toque, sem formulário. O perfil já é a inscrição. */}
      {souProfissional && !souDono && (
        <View style={styles.acoes}>
          {candidaturaAtiva ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.aplicado}>
              <View style={styles.aplicadoLinha}>
                <View style={styles.pontoOk} />
                <Text style={styles.aplicadoTitulo}>
                  {ROTULO_STATUS_CANDIDATURA[candidatura!.status]}
                </Text>
              </View>
              <Text style={styles.aplicadoTexto}>
                {candidatura!.status === "selecionada"
                  ? "O contratante escolheu você. Combine os detalhes pelo chat."
                  : candidatura!.status === "recusada"
                    ? "Desta vez não rolou. Continue de olho no feed."
                    : "Seu perfil foi enviado. Avisamos assim que houver resposta."}
              </Text>

              {candidatura!.status === "selecionada" && (
                <Button
                  label="Abrir conversa"
                  onPress={() => router.push("/(app)/conversas")}
                  style={{ marginTop: space.sm }}
                />
              )}

              {["aplicada", "vista"].includes(candidatura!.status) && (
                <Pressable onPress={confirmarRetirada} hitSlop={8} style={styles.linkPerigo}>
                  <Text style={styles.linkPerigoTexto}>Retirar candidatura</Text>
                </Pressable>
              )}
            </Animated.View>
          ) : vagaAceitaCandidatura ? (
            <>
              <Button label="Tenho interesse" onPress={aplicar} loading={enviando} />
              <Text style={styles.rodapeAjuda}>
                Envia seu perfil para o contratante. Sem formulário.
              </Text>
            </>
          ) : (
            <Text style={styles.rodapeAjuda}>Esta vaga não está mais recebendo candidaturas.</Text>
          )}
        </View>
      )}
    </Screen>
  );
}

function Fato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.fato}>
      <Text style={styles.fatoRotulo}>{rotulo}</Text>
      <Text style={styles.fatoValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  vazio: { ...type.body, color: colors.inkDim, textAlign: "center" },

  capa: { width: "100%", height: 190, borderRadius: radius.lg, marginTop: space.lg },
  selos: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.lg },
  selo: {
    ...type.label,
    color: colors.inkDim,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: space.md,
    overflow: "hidden"
  },
  seloUrgente: { color: colors.magenta, borderColor: colors.magenta },

  titulo: { ...type.h1, color: colors.white, marginTop: space.lg },

  contratante: { flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.lg },
  contratanteNome: { ...type.bodyMedium, color: colors.inkDim },

  fatos: {
    gap: space.lg,
    marginTop: space.xl,
    paddingVertical: space.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line
  },
  fato: { gap: 4 },
  fatoRotulo: { ...type.label, color: colors.inkFaint },
  fatoValor: { ...type.bodyMedium, color: colors.white },

  descricao: { ...type.body, color: colors.inkDim, marginTop: space.xl },

  alcance: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.magenta,
    backgroundColor: "rgba(216,19,104,0.08)"
  },
  alcanceNumero: { ...type.h1, color: colors.magenta },
  alcanceTexto: { ...type.caption, color: colors.inkDim, flex: 1 },

  acoes: { gap: space.lg, marginTop: space["2xl"], paddingBottom: space.lg },

  aplicado: {
    gap: space.sm,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lime,
    backgroundColor: "rgba(206,254,42,0.06)"
  },
  aplicadoLinha: { flexDirection: "row", alignItems: "center", gap: space.sm },
  pontoOk: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime },
  aplicadoTitulo: { ...type.h3, color: colors.lime },
  aplicadoTexto: { ...type.body, color: colors.inkDim },

  linkPerigo: { alignItems: "center", marginTop: space.sm },
  linkPerigoTexto: { ...type.caption, color: colors.danger },
  rodapeAjuda: { ...type.caption, color: colors.inkFaint, textAlign: "center" }
});
