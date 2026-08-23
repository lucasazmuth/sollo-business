import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Chip } from "@/src/components/Chip";
import { EnderecoInput, type LocalResolvido } from "@/src/components/EnderecoInput";
import { DataHoraInput, horasAte } from "@/src/components/DataHoraInput";
import { DestacarVagaModal } from "@/src/components/DestacarVagaModal";
import { useSession } from "@/src/lib/session";
import { escolherImagem, enviarImagem, MediaError } from "@/src/lib/media";
import { listarCategorias, cadastroCompletoParaPublicar, type Category } from "@/src/api/profile";
import { alcanceDaVaga, criarVaga } from "@/src/api/jobs";
import { colors, radius, space, type } from "@/src/theme/tokens";

/** Daqui a 2 dias às 9h — chute razoável que evita digitação. */
function padraoInicio() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(9, 0, 0, 0);
  return d;
}

export default function NovaVaga() {
  const router = useRouter();
  const { session, profile } = useSession();
  const userId = session?.user.id;

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [local, setLocal] = useState<LocalResolvido | null>(null);
  const [inicio, setInicio] = useState(padraoInicio);
  const [comValor, setComValor] = useState(false);
  const [valor, setValor] = useState("");
  const [exigeNota, setExigeNota] = useState(false);
  const [vagasQtd, setVagasQtd] = useState(1);
  const [urgenteManual, setUrgenteManual] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [destacarAberto, setDestacarAberto] = useState(false);
  const [cadastroCompleto, setCadastroCompleto] = useState<boolean | null>(null);

  const emailConfirmado = !!session?.user.email_confirmed_at;

  useEffect(() => {
    listarCategorias().then(setCategorias);
  }, []);

  // Recheca sempre que a tela ganha foco — cobre o caso de voltar de
  // "completar cadastro" com os dados recém-salvos.
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let vivo = true;
      cadastroCompletoParaPublicar(userId)
        .then((ok) => vivo && setCadastroCompleto(ok))
        .catch(() => vivo && setCadastroCompleto(false));
      return () => {
        vivo = false;
      };
    }, [userId])
  );

  // Vaga em até 72h é urgente por definição — o banco infere igual.
  const urgentePorPrazo = horasAte(inicio) <= 72;
  const urgente = urgenteManual || urgentePorPrazo;

  const podeEnviar = useMemo(
    () => titulo.trim().length >= 5 && descricao.trim().length >= 20 && !!categoryId && !!local,
    [titulo, descricao, categoryId, local]
  );

  async function trocarCapa() {
    if (!userId) return;
    try {
      const asset = await escolherImagem();
      if (!asset) return;
      setEnviandoCapa(true);
      setCoverUrl(await enviarImagem("jobs", asset, userId));
    } catch (e) {
      Alert.alert("Não deu", e instanceof MediaError ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setEnviandoCapa(false);
    }
  }

  function validar() {
    const e: Record<string, string> = {};
    if (titulo.trim().length < 5) e.titulo = "Dê um título que diga a função.";
    if (descricao.trim().length < 20) e.descricao = "Descreva o que precisa em pelo menos uma frase.";
    if (!categoryId) e.categoria = "Escolha a categoria: é por ela que notificamos.";
    if (!local) e.local = "Confirme o endereço para podermos avisar quem está perto.";
    if (inicio.getTime() <= Date.now()) e.data = "A data precisa estar no futuro.";
    if (comValor && !Number(valor.replace(",", "."))) e.valor = "Informe o cachê ou marque a combinar.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function publicar() {
    if (!userId || !validar()) return;

    setSalvando(true);
    try {
      const vaga = await criarVaga(userId, {
        titulo,
        descricao,
        categoryId: categoryId!,
        coverUrl,
        startsAt: inicio,
        isUrgent: urgente,
        requiresInvoice: exigeNota,
        payType: comValor ? "valor" : "a_combinar",
        payAmount: comValor ? Number(valor.replace(",", ".")) : null,
        vagasQtd,
        local: {
          lat: local!.lat,
          lng: local!.lng,
          endereco: local!.endereco,
          cidade: local!.cidade,
          uf: local!.uf
        },
        publicar: true
      });

      const alcance = await alcanceDaVaga(vaga.id);

      Alert.alert(
        "Vaga publicada",
        alcance > 0
          ? `${alcance} profissional${alcance > 1 ? "is" : ""} da região ${alcance > 1 ? "serão avisados" : "será avisado"}.`
          : "Ainda não há profissionais dessa categoria no raio. A vaga fica aberta e avisamos assim que alguém se cadastrar.",
        [{ text: "Ver vaga", onPress: () => router.replace(`/(app)/vaga/${vaga.id}`) }]
      );
    } catch (e) {
      Alert.alert("Não deu", e instanceof Error ? e.message : "Falha ao publicar.");
    } finally {
      setSalvando(false);
    }
  }

  if (profile && profile.tipo !== "contratante") {
    return (
      <Screen back scroll={false}>
        <View style={styles.bloqueio}>
          <Text style={styles.bloqueioTitulo}>Só contratantes publicam vagas</Text>
          <Text style={styles.bloqueioTexto}>
            Sua conta é de profissional. Dá para mudar isso no seu perfil.
          </Text>
        </View>
      </Screen>
    );
  }

  if (!emailConfirmado) {
    return (
      <Screen back scroll={false}>
        <View style={styles.bloqueio}>
          <Text style={styles.bloqueioTitulo}>Confirme seu e-mail antes</Text>
          <Text style={styles.bloqueioTexto}>
            É por ele que avisamos sobre candidaturas. Confirme o código que mandamos no cadastro.
          </Text>
          <Button
            label="Confirmar e-mail"
            onPress={() => router.push("/(auth)/confirmar-email")}
            style={{ marginTop: space.lg }}
          />
        </View>
      </Screen>
    );
  }

  if (cadastroCompleto === false) {
    return (
      <Screen back scroll={false}>
        <View style={styles.bloqueio}>
          <Text style={styles.bloqueioTitulo}>Complete seu cadastro antes</Text>
          <Text style={styles.bloqueioTexto}>
            Nome completo, CPF, telefone e endereço — pedimos uma vez só, antes da primeira vaga.
          </Text>
          <Button
            label="Completar cadastro"
            onPress={() => router.push("/(app)/perfil/completar-cadastro")}
            style={{ marginTop: space.lg }}
          />
        </View>
      </Screen>
    );
  }

  if (cadastroCompleto === null) {
    return (
      <Screen back scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back>
      <Text style={styles.titulo}>Publicar vaga</Text>
      <Text style={styles.lead}>Quanto mais claro o anúncio, melhores os candidatos.</Text>

      <Pressable style={styles.capa} onPress={trocarCapa} disabled={enviandoCapa}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.capaImagem} contentFit="cover" />
        ) : (
          <View style={styles.capaVazia}>
            {enviandoCapa ? (
              <ActivityIndicator color={colors.magenta} />
            ) : (
              <>
                <Text style={styles.capaSinal}>+</Text>
                <Text style={styles.capaTexto}>Foto de capa (opcional)</Text>
              </>
            )}
          </View>
        )}
      </Pressable>

      <View style={styles.form}>
        <Input
          label="Título"
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Cinegrafista para evento corporativo"
          maxLength={80}
          error={erros.titulo}
        />

        <Input
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="O que precisa ser feito, equipamento necessário, o que você fornece."
          multiline
          numberOfLines={5}
          style={{ minHeight: 120, textAlignVertical: "top" }}
          maxLength={1200}
          error={erros.descricao}
        />

        <View style={styles.secao}>
          <Text style={styles.label}>CATEGORIA</Text>
          <Text style={styles.ajuda}>Define quem recebe a notificação. Escolha uma só.</Text>
          <View style={styles.chips}>
            {categorias.map((c) => (
              <Chip
                key={c.id}
                label={c.nome}
                selecionado={categoryId === c.id}
                onPress={() => setCategoryId(c.id)}
              />
            ))}
          </View>
          {!!erros.categoria && <Text style={styles.erro}>{erros.categoria}</Text>}
        </View>

        <EnderecoInput valor={local} onChange={setLocal} erro={erros.local} />

        <DataHoraInput valor={inicio} onChange={setInicio} erro={erros.data} />

        <View style={[styles.avisoUrgencia, urgente && styles.avisoUrgenciaAtivo]}>
          <View style={[styles.pontoUrgencia, urgente && { backgroundColor: colors.magenta }]} />
          <Text style={[styles.avisoUrgenciaTexto, urgente && { color: colors.white }]}>
            {urgentePorPrazo
              ? "Começa em menos de 72h: entra como urgente e dispara push e e-mail na região."
              : urgenteManual
                ? "Marcada como urgente: dispara push e e-mail na região."
                : "Vaga programada. Aparece no feed de quem está no raio."}
          </Text>
        </View>

        {!urgentePorPrazo && (
          <View style={styles.linhaSwitch}>
            <View style={styles.switchTexto}>
              <Text style={styles.label}>MARCAR COMO URGENTE</Text>
              <Text style={styles.ajuda}>Use quando precisa fechar rápido, não por padrão.</Text>
            </View>
            <Switch
              value={urgenteManual}
              onValueChange={setUrgenteManual}
              trackColor={{ false: colors.line, true: colors.magenta }}
              thumbColor={colors.white}
            />
          </View>
        )}

        <View style={styles.linhaSwitch}>
          <View style={styles.switchTexto}>
            <Text style={styles.label}>DEFINIR CACHÊ</Text>
            <Text style={styles.ajuda}>Anúncio com valor recebe mais candidatura.</Text>
          </View>
          <Switch
            value={comValor}
            onValueChange={setComValor}
            trackColor={{ false: colors.line, true: colors.magenta }}
            thumbColor={colors.white}
          />
        </View>

        {comValor && (
          <Animated.View entering={FadeIn.duration(240)}>
            <Input
              label="Cachê (R$)"
              value={valor}
              onChangeText={setValor}
              placeholder="800"
              keyboardType="decimal-pad"
              error={erros.valor}
            />
          </Animated.View>
        )}

        <View style={styles.linhaSwitch}>
          <View style={styles.switchTexto}>
            <Text style={styles.label}>EXIGE NOTA FISCAL</Text>
            <Text style={styles.ajuda}>Filtra quem não emite.</Text>
          </View>
          <Switch
            value={exigeNota}
            onValueChange={setExigeNota}
            trackColor={{ false: colors.line, true: colors.magenta }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.secao}>
          <Text style={styles.label}>QUANTAS VAGAS</Text>
          <View style={styles.quantidade}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setVagasQtd(n)}
                style={[styles.qtdOpcao, n === vagasQtd && styles.qtdAtiva]}
              >
                <Text style={[styles.qtdTexto, n === vagasQtd && { color: colors.white }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.destacar} onPress={() => setDestacarAberto(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>DESTACAR VAGA · R$ 7,90</Text>
            <Text style={styles.ajuda}>7 dias no topo do feed. Opcional.</Text>
          </View>
          <Text style={styles.destacarSeta}>›</Text>
        </Pressable>
      </View>

      <DestacarVagaModal visivel={destacarAberto} onFechar={() => setDestacarAberto(false)} />

      <View style={styles.rodape}>
        <Button
          label="Publicar vaga"
          onPress={publicar}
          loading={salvando}
          disabled={!podeEnviar}
        />
        {!podeEnviar && (
          <Text style={styles.rodapeAjuda}>
            Faltam título, descrição, categoria e endereço confirmado.
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulo: { ...type.h1, color: colors.white, paddingTop: space.lg },
  lead: { ...type.body, color: colors.inkDim, marginTop: space.sm },

  capa: { marginTop: space.xl, height: 170, borderRadius: radius.lg, overflow: "hidden" },
  capaImagem: { width: "100%", height: "100%" },
  capaVazia: {
    flex: 1,
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.lineStrong
  },
  capaSinal: { ...type.h2, color: colors.inkDim },
  capaTexto: { ...type.caption, color: colors.inkFaint },

  form: { gap: space.xl, marginTop: space.xl },
  secao: { gap: space.sm },
  label: { ...type.label, color: colors.inkDim },
  ajuda: { ...type.caption, color: colors.inkFaint },
  erro: { ...type.caption, color: colors.danger },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.xs },

  avisoUrgencia: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  avisoUrgenciaAtivo: { borderColor: colors.magenta },
  pontoUrgencia: { width: 7, height: 7, borderRadius: 4, marginTop: 6, backgroundColor: colors.inkFaint },
  avisoUrgenciaTexto: { ...type.caption, color: colors.inkDim, flex: 1 },

  linhaSwitch: { flexDirection: "row", alignItems: "center", gap: space.lg },
  switchTexto: { flex: 1, gap: 4 },

  quantidade: { flexDirection: "row", gap: space.sm, marginTop: space.xs },
  qtdOpcao: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  qtdAtiva: { borderColor: colors.magenta, backgroundColor: "rgba(216,19,104,0.12)" },
  qtdTexto: { ...type.bodyMedium, color: colors.inkDim },

  destacar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.lineStrong
  },
  destacarSeta: { ...type.h2, color: colors.inkFaint },

  rodape: { marginTop: space["2xl"], gap: space.sm, paddingBottom: space.lg },
  rodapeAjuda: { ...type.caption, color: colors.inkFaint, textAlign: "center" },

  bloqueio: { flex: 1, justifyContent: "center", gap: space.md },
  bloqueioTitulo: { ...type.h2, color: colors.white },
  bloqueioTexto: { ...type.body, color: colors.inkDim },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" }
});
