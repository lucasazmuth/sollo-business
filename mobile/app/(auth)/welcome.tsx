import { Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Wordmark } from "@/src/components/Logo";
import { colors, space, type } from "@/src/theme/tokens";

/** Porta de entrada: escolha entre criar conta ou entrar. */
export default function Welcome() {
  const router = useRouter();

  return (
    <Screen scroll={false}>
      <View style={styles.top}>
        <Animated.View entering={FadeIn.duration(600)}>
          <Wordmark width={132} />
        </Animated.View>
      </View>

      <View style={styles.center}>
        <Animated.Text entering={FadeInDown.delay(120).duration(700)} style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>SOLLO BUSINESS
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(220).duration(700)} style={styles.title}>
          Ser solo é trilhar{"\n"}o seu caminho.
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(320).duration(700)} style={styles.lead}>
          Encontre os melhores talentos do mercado, colabore em projetos e tire suas ideias do
          papel. Conecte-se, negocie e entregue com segurança.
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInDown.delay(420).duration(700)} style={styles.actions}>
        <Button label="Criar minha conta" onPress={() => router.push("/(auth)/tipo-de-conta")} />
        <Button label="Já tenho conta" variant="ghost" onPress={() => router.push("/(auth)/login")} />

        <Text style={styles.terms}>
          Ao continuar, você concorda com os{" "}
          <Text style={styles.link} onPress={() => Linking.openURL("https://www.sollo.business/termos")}>
            Termos de uso
          </Text>{" "}
          e a{" "}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://www.sollo.business/privacidade")}
          >
            Política de privacidade
          </Text>
          .
        </Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: space.lg },
  center: { flex: 1, justifyContent: "flex-end", gap: space.lg, paddingBottom: space["2xl"] },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  title: { ...type.display, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },
  actions: { gap: space.md, paddingBottom: space.lg },
  terms: {
    ...type.caption,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: space.sm,
    paddingHorizontal: space.lg
  },
  link: { color: colors.inkDim, textDecorationLine: "underline" }
});
