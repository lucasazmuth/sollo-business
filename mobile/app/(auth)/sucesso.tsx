import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Ilustra, ILUSTRA } from "@/src/components/Ilustra";
import { colors, space, type } from "@/src/theme/tokens";

/**
 * Fim de fluxo bem-sucedido: e-mail confirmado, senha trocada.
 *
 * É uma tela só, parametrizada pela rota, em vez de uma por fluxo — o que
 * muda entre elas é texto e para onde o botão leva. Sem `back`: voltar para
 * o formulário que a pessoa acabou de concluir não leva a lugar nenhum.
 */
export default function Sucesso() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { titulo, texto, destino, botao } = useLocalSearchParams<{
    titulo?: string;
    texto?: string;
    destino?: string;
    botao?: string;
  }>();

  return (
    <Screen scroll={false}>
      <View style={styles.centro}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Ilustra
            fonte={ILUSTRA.check}
            tamanho={Math.min(width * 0.46, 190)}
            tom={colors.lime}
            satelites={false}
          />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(140).duration(600)} style={styles.titulo}>
          {titulo ?? "Tudo certo"}
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(220).duration(600)} style={styles.texto}>
          {texto ?? "Pode seguir."}
        </Animated.Text>
      </View>

      <View style={styles.rodape}>
        <Button
          label={botao ?? "Continuar"}
          onPress={() => router.replace((destino ?? "/home") as never)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.lg },
  titulo: { ...type.h1, color: colors.white, textAlign: "center", marginTop: space.xl },
  texto: {
    ...type.body,
    color: colors.inkDim,
    textAlign: "center",
    paddingHorizontal: space.lg
  },
  rodape: { paddingBottom: space.lg }
});
