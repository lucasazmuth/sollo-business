import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { excluirConta } from "@/src/lib/auth";
import { useSession } from "@/src/lib/session";
import { colors, radius, space, type } from "@/src/theme/tokens";

export default function Configuracoes() {
  const router = useRouter();
  // O signOut do contexto também desregistra o push e zera o estado da
  // sessão — o de `lib/auth` sozinho deixaria o aparelho recebendo push
  // de uma conta que já saiu.
  const { signOut } = useSession();
  const [excluindo, setExcluindo] = useState(false);

  function confirmarExclusao() {
    Alert.alert(
      "Excluir conta",
      "Isso apaga permanentemente seu perfil, vagas, candidaturas, conversas e avaliações. Não é possível desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir conta", style: "destructive", onPress: excluir }
      ]
    );
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await excluirConta();
      router.replace("/(auth)/welcome");
    } catch (erro) {
      setExcluindo(false);
      Alert.alert("Não foi possível excluir", erro instanceof Error ? erro.message : "Tente de novo.");
    }
  }

  return (
    <Screen back>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>CONFIGURAÇÕES
        </Text>
        <Text style={styles.titulo}>Conta</Text>
      </View>

      <View style={styles.lista}>
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
  cabecalho: { gap: space.sm, paddingTop: space.lg },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  titulo: { ...type.h1, color: colors.white },

  lista: { marginTop: space.xl, gap: space.sm },
  item: {
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  itemTexto: { ...type.bodyMedium, color: colors.white },

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
