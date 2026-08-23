import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Avatar } from "@/src/components/Avatar";
import { Chip } from "@/src/components/Chip";
import { useSession } from "@/src/lib/session";
import { escolherImagem, enviarImagem, removerImagem, MediaError } from "@/src/lib/media";
import {
  adicionarAoPortfolio,
  buscarPerfil,
  listarCategorias,
  removerDoPortfolio,
  salvarPerfil,
  salvarPerfilContratante,
  salvarPerfilProfissional,
  type Category,
  type PortfolioItem
} from "@/src/api/profile";
import { colors, radius, space, type } from "@/src/theme/tokens";

export default function EditarPerfil() {
  const router = useRouter();
  const { session, profile: perfilSessao, refreshProfile } = useSession();
  const { width } = useWindowDimensions();
  const userId = session?.user.id;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);
  const [enviandoItem, setEnviandoItem] = useState(false);

  const [ehProfissional, setEhProfissional] = useState(true);
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [disponivel, setDisponivel] = useState(true);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    let vivo = true;

    Promise.all([buscarPerfil(userId), listarCategorias()])
      .then(([p, c]) => {
        if (!vivo || !p) return;
        setEhProfissional(p.profile.tipo === "profissional");
        setNome(p.profile.nome ?? "");
        setBio(p.profile.bio ?? "");
        setAvatarUrl(p.profile.avatar_url);
        setHeadline(p.professional?.headline ?? "");
        setEmpresa(p.hirer?.empresa ?? "");
        setDisponivel(p.professional?.disponivel ?? true);
        setSelecionadas(p.professional?.categorias ?? []);
        setPortfolio(p.portfolio);
        setCategorias(c);
      })
      .finally(() => vivo && setCarregando(false));

    return () => {
      vivo = false;
    };
  }, [userId]);

  const trocarAvatar = useCallback(async () => {
    if (!userId) return;
    try {
      const asset = await escolherImagem({ quadrada: true });
      if (!asset) return;

      setEnviandoAvatar(true);
      const url = await enviarImagem("avatars", asset, userId);
      const anterior = avatarUrl;

      await salvarPerfil(userId, { avatar_url: url });
      setAvatarUrl(url);
      await refreshProfile();

      // Só apaga a antiga depois que a nova está gravada.
      if (anterior) await removerImagem("avatars", anterior).catch(() => {});
    } catch (e) {
      Alert.alert("Não deu", e instanceof MediaError ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setEnviandoAvatar(false);
    }
  }, [userId, avatarUrl, refreshProfile]);

  const adicionarItem = useCallback(async () => {
    if (!userId) return;
    try {
      const asset = await escolherImagem();
      if (!asset) return;

      setEnviandoItem(true);
      const url = await enviarImagem("portfolio", asset, userId);
      const item = await adicionarAoPortfolio(userId, url, portfolio.length);
      setPortfolio((atual) => [...atual, item]);
    } catch (e) {
      Alert.alert("Não deu", e instanceof MediaError ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setEnviandoItem(false);
    }
  }, [userId, portfolio.length]);

  const removerItem = useCallback((item: PortfolioItem) => {
    Alert.alert("Remover do portfólio?", "A imagem sai do seu perfil.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await removerDoPortfolio(item.id);
          await removerImagem("portfolio", item.media_url).catch(() => {});
          setPortfolio((atual) => atual.filter((i) => i.id !== item.id));
        }
      }
    ]);
  }, []);

  async function salvar() {
    if (!userId) return;
    setSalvando(true);
    try {
      await salvarPerfil(userId, { nome: nome.trim(), bio: bio.trim() || null });

      if (ehProfissional) {
        await salvarPerfilProfissional(userId, {
          headline: headline.trim() || null,
          categorias: selecionadas,
          disponivel
        });
      } else {
        await salvarPerfilContratante(userId, { empresa: empresa.trim() || null });
      }

      await refreshProfile();
      router.back();
    } catch (e) {
      Alert.alert("Não deu", e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Screen scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  const celula = (width - space.xl * 2 - space.sm * 2) / 3;

  return (
    <Screen back>
      <Text style={styles.titulo}>Editar perfil</Text>

      <Pressable style={styles.avatarBloco} onPress={trocarAvatar} disabled={enviandoAvatar}>
        <Avatar url={avatarUrl} nome={nome || perfilSessao?.nome} size={88} />
        <Text style={styles.avatarAcao}>
          {enviandoAvatar ? "Enviando…" : avatarUrl ? "Trocar foto" : "Adicionar foto"}
        </Text>
      </Pressable>

      <View style={styles.form}>
        <Input label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />

        {ehProfissional ? (
          <Input
            label="Headline"
            value={headline}
            onChangeText={setHeadline}
            placeholder="Cinegrafista · documentário e eventos"
            maxLength={80}
          />
        ) : (
          <Input
            label="Produtora"
            value={empresa}
            onChangeText={setEmpresa}
            placeholder="Nome da sua produtora"
          />
        )}

        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Conte em duas linhas o que você faz melhor."
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: "top" }}
          maxLength={280}
        />
      </View>

      {ehProfissional && (
        <>
          <View style={styles.linhaSwitch}>
            <View style={styles.switchTexto}>
              <Text style={styles.rotulo}>DISPONÍVEL PARA VAGAS</Text>
              <Text style={styles.ajuda}>
                Desligado, você para de receber notificação de vaga e some do feed.
              </Text>
            </View>
            <Switch
              value={disponivel}
              onValueChange={setDisponivel}
              trackColor={{ false: colors.line, true: colors.magenta }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.rotulo}>CATEGORIAS</Text>
            <Text style={styles.ajuda}>
              É por elas que decidimos quais vagas te notificar. Escolha só o que você realmente faz.
            </Text>
            <View style={styles.chips}>
              {categorias.map((c) => (
                <Chip
                  key={c.id}
                  label={c.nome}
                  selecionado={selecionadas.includes(c.id)}
                  onPress={() =>
                    setSelecionadas((atual) =>
                      atual.includes(c.id) ? atual.filter((i) => i !== c.id) : [...atual, c.id]
                    )
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.secao}>
            <Text style={styles.rotulo}>PORTFÓLIO</Text>
            <Text style={styles.ajuda}>Toque e segure para remover.</Text>

            <View style={styles.grade}>
              {portfolio.map((item) => (
                <Pressable key={item.id} onLongPress={() => removerItem(item)}>
                  <Image
                    source={{ uri: item.media_url }}
                    style={{ width: celula, height: celula, borderRadius: 6 }}
                    contentFit="cover"
                  />
                </Pressable>
              ))}

              <Pressable
                style={[styles.adicionar, { width: celula, height: celula }]}
                onPress={adicionarItem}
                disabled={enviandoItem}
              >
                {enviandoItem ? (
                  <ActivityIndicator color={colors.magenta} size="small" />
                ) : (
                  <Text style={styles.adicionarSinal}>+</Text>
                )}
              </Pressable>
            </View>
          </View>
        </>
      )}

      <View style={styles.rodape}>
        <Button label="Salvar" onPress={salvar} loading={salvando} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  titulo: { ...type.h1, color: colors.white, paddingTop: space.lg },

  avatarBloco: { alignItems: "center", gap: space.sm, marginTop: space.xl },
  avatarAcao: { ...type.label, color: colors.magenta },

  form: { gap: space.lg, marginTop: space.xl },

  linhaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    marginTop: space.xl,
    paddingVertical: space.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line
  },
  switchTexto: { flex: 1, gap: 4 },

  secao: { marginTop: space.xl, gap: space.sm },
  rotulo: { ...type.label, color: colors.inkDim },
  ajuda: { ...type.caption, color: colors.inkFaint },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.sm },

  grade: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.sm },
  adicionar: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.lineStrong
  },
  adicionarSinal: { ...type.h2, color: colors.inkDim },

  rodape: { marginTop: space["2xl"], paddingBottom: space.lg }
});
