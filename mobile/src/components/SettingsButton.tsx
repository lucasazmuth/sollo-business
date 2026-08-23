import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/src/theme/tokens";

/**
 * Atalho para Configurações no topo da tela, ao lado do sininho.
 *
 * Antes era um terceiro botão-pílula na fileira "Editar perfil / Onde eu
 * atuo / Configurações" do perfil: apertava as três pílulas a ponto de o
 * rótulo quebrar em duas linhas, e misturava ajuste de conta com edição de
 * perfil. Como ação de sistema, o lugar dele é no header.
 */
export function SettingsButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(app)/perfil/configuracoes")}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityLabel="Configurações"
      style={styles.botao}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={3.1} stroke={colors.white} strokeWidth={1.6} />
        <Path
          d="M19.4 14.5a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-1.7-.3 1.5 1.5 0 0 0-.9 1.4v.2a1.8 1.8 0 1 1-3.6 0v-.1a1.5 1.5 0 0 0-1-1.4 1.5 1.5 0 0 0-1.7.3l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0 .3-1.7 1.5 1.5 0 0 0-1.4-.9h-.2a1.8 1.8 0 1 1 0-3.6h.1a1.5 1.5 0 0 0 1.4-1 1.5 1.5 0 0 0-.3-1.7l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.2a1.8 1.8 0 1 1 3.6 0v.1a1.5 1.5 0 0 0 .9 1.4 1.5 1.5 0 0 0 1.7-.3l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0-.3 1.7v.1a1.5 1.5 0 0 0 1.4.9h.2a1.8 1.8 0 1 1 0 3.6h-.1a1.5 1.5 0 0 0-1.4.9Z"
          stroke={colors.white}
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg
  }
});
