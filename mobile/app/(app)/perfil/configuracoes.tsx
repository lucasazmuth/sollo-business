import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { avisar, confirmar } from "@/src/lib/dialogo";
import { excluirConta } from "@/src/lib/auth";
import { useSession } from "@/src/lib/session";
import { LINKS } from "@/src/lib/links";
import { colors, radius, space, type } from "@/src/theme/tokens";

export default function Configuracoes() {
  const router = useRouter();
  // O signOut do contexto também desregistra o push e zera o estado da
  // sessão — o de `lib/auth` sozinho deixaria o aparelho recebendo push
  // de uma conta que já saiu.
  const { signOut } = useSession();
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao() {
    const ok = await confirmar({
      titulo: "Excluir conta",
      mensagem:
        "Isso apaga permanentemente seu perfil, vagas, candidaturas, conversas e avaliações. Não é possível desfazer.",
      confirmar: "Excluir conta",
      destrutivo: true
    });
    if (ok) excluir();
  }

  // `openURL` rejeita quando não há app capaz de abrir o esquema (aparelho
  // sem cliente de e-mail configurado, por exemplo). Sem o catch, o toque
  // derrubava a tela com unhandled rejection em vez de não fazer nada.
  async function abrir(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      avisar("Não deu para abrir", url);
    }
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await excluirConta();
      router.replace("/(auth)/welcome");
    } catch (erro) {
      setExcluindo(false);
      avisar("Não foi possível excluir", erro instanceof Error ? erro.message : "Tente de novo.");
    }
  }

  return (
    <Screen back titulo="Configurações">
      <View style={[styles.lista, styles.primeiraLista]}>
        <Pressable
          style={styles.item}
          onPress={async () => {
            // Sair da conta não pode depender de a chamada dar certo: se o
            // token já não vale (conta apagada, sem rede), a pessoa precisa
            // sair da tela logada do mesmo jeito.
            await signOut().catch(() => {});
            router.replace("/(auth)/welcome");
          }}
        >
          <Text style={styles.itemTexto}>Sair da conta</Text>
        </Pressable>

        <Pressable
          style={styles.item}
          onPress={() => router.push("/(app)/notificacoes/preferencias")}
        >
          <Text style={styles.itemTexto}>Preferências de notificação</Text>
        </Pressable>
      </View>

      <Text style={styles.grupoTitulo}>AJUDA</Text>

      <View style={styles.lista}>
        <Pressable style={styles.item} onPress={() => abrir(LINKS.suporteMailto)}>
          <Text style={styles.itemTexto}>Suporte</Text>
          <Text style={styles.itemDetalhe}>{LINKS.suporteEmail}</Text>
        </Pressable>
      </View>

      <Text style={styles.grupoTitulo}>LEGAL</Text>

      <View style={styles.lista}>
        <Pressable style={styles.item} onPress={() => abrir(LINKS.termos)}>
          <Text style={styles.itemTexto}>Termos de uso</Text>
          <Text style={styles.itemDetalhe}>Abre no navegador</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => abrir(LINKS.privacidade)}>
          <Text style={styles.itemTexto}>Política de privacidade</Text>
          <Text style={styles.itemDetalhe}>Abre no navegador</Text>
        </Pressable>
      </View>

      <View style={styles.zonaPerigo}>
        <Text style={styles.zonaTitulo}>Zona de risco</Text>
        <Text style={styles.zonaTexto}>
          Excluir a conta apaga seu perfil, vagas, candidaturas, conversas e avaliações
          permanentemente. Essa ação não pode ser desfeita.
        </Text>
        <Pressable
          style={styles.botaoExcluir}
          onPress={confirmarExclusao}
          disabled={excluindo}
        >
          {excluindo ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.botaoExcluirTexto}>EXCLUIR MINHA CONTA</Text>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({

  grupoTitulo: { ...type.label, color: colors.inkFaint, marginTop: space.xl },
  lista: { marginTop: space.md, gap: space.sm },
  primeiraLista: { marginTop: space.xl },
  item: {
    gap: 2,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  itemTexto: { ...type.bodyMedium, color: colors.white },
  itemDetalhe: { ...type.caption, color: colors.inkFaint },

  zonaPerigo: {
    marginTop: space["2xl"],
    paddingBottom: space.xl,
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#5a1330",
    backgroundColor: "#200910"
  },
  zonaTitulo: { ...type.h3, color: colors.white },
  zonaTexto: { ...type.body, color: colors.inkDim },
  botaoExcluir: {
    marginTop: space.sm,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7a1533"
  },
  botaoExcluirTexto: { ...type.button, fontSize: 12, color: colors.white }
});
