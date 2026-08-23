import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Wordmark } from "@/src/components/Logo";
import { colors, space, type } from "@/src/theme/tokens";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  back?: boolean;
  /**
   * Marca no canto esquerdo do topo. Usada nas telas raiz das abas, que não
   * têm botão voltar — sem ela o app inteiro fica sem assinatura visual.
   * Em tela empurrada o lugar é do botão voltar, então `back` tem prioridade.
   */
  logo?: boolean;
  /** Ação no canto direito da fileira do topo (ex.: sininho de notificações). */
  right?: React.ReactNode;
  /**
   * Camada decorativa atrás de tudo, sangrando por baixo da safe area
   * (ex.: as esferas em gradiente da marca). Fica fora do `SafeAreaView`
   * de propósito: contida nele, pararia numa faixa preta no topo.
   */
  fundo?: React.ReactNode;
  contentStyle?: ViewStyle;
};

/**
 * Casca comum das telas: safe area, teclado e botão voltar, sobre preto puro.
 *
 * Usa o componente `SafeAreaView` (não o hook `useSafeAreaInsets` aplicado
 * como padding manual). O hook só tem o valor real de inset depois da
 * primeira renderização JS — na passada inicial ele pode valer 0, e nessa
 * fração de segundo o conteúdo desenha colado no topo físico da tela; se
 * esse frame chega a ser "commitado" pelo Fabric antes do re-render com o
 * inset correto, ele fica gravado por baixo do layout final (um elemento
 * da tela — geralmente o último item de uma lista — aparece cortado colado
 * na status bar). O componente `SafeAreaView` resolve o inset nativamente
 * antes da primeira pintura, então esse frame incorreto nunca chega a existir.
 */
export function Screen({
  children,
  scroll = true,
  back = false,
  logo = false,
  right,
  fundo,
  contentStyle
}: Props) {
  const router = useRouter();

  const body = (
    <View
      style={[
        scroll ? styles.bodyScroll : styles.body,
        contentStyle
      ]}
    >
      {children}
    </View>
  );

  const conteudo = (
    <SafeAreaView
      style={[styles.root, !!fundo && styles.rootTransparente]}
      edges={["top", "bottom"]}
    >
      {/* No fluxo, não absoluto: como irmão do KeyboardAvoidingView (flex:1)
          o botão ficava coberto por ele e os toques não chegavam. */}
      {(back || logo || right) && (
        <View style={styles.barraVoltar}>
          {back ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={16}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              style={styles.back}
            >
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
          ) : logo ? (
            <View style={styles.marca}>
              <Wordmark width={78} />
            </View>
          ) : (
            <View />
          )}
          {right}
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (!fundo) return conteudo;

  return (
    <View style={styles.root}>
      {fundo}
      {conteudo}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  rootTransparente: { backgroundColor: "transparent" },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { flex: 1, paddingHorizontal: space.xl, paddingBottom: space.xl },
  // Em ScrollView o corpo cresce com o conteúdo em vez de travar na viewport.
  bodyScroll: { flexGrow: 1, paddingHorizontal: space.xl, paddingBottom: space.xl },
  barraVoltar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.sm
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    // Fundo sólido: o conteúdo rola por baixo e o botão precisa continuar legível.
    backgroundColor: colors.bg
  },
  backIcon: { ...type.h3, color: colors.white, marginTop: -2 },
  // Mesma altura do botão voltar/sininho, para a fileira não pular de altura
  // entre uma tela e outra.
  marca: { height: 44, justifyContent: "center" }
});
