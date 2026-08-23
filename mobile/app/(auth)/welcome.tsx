import { Linking, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Blobs } from "@/src/components/Blobs";
import { IconMark, Wordmark } from "@/src/components/Logo";
import { LINKS } from "@/src/lib/links";
import { colors, space, type } from "@/src/theme/tokens";

/** Porta de entrada: escolha entre criar conta ou entrar. */
export default function Welcome() {
  const router = useRouter();

  return (
    <Screen scroll={false} fundo={<Blobs />}>
      <View style={styles.top}>
        <Animated.View entering={FadeIn.duration(600)}>
          <Wordmark width={132} />
        </Animated.View>

        {/* Símbolo em marca d'água, como na Hero da landing. */}
        <View style={styles.marcaDagua} pointerEvents="none">
          <IconMark width={260} opacity={0.06} />
        </View>
      </View>

      <View style={styles.center}>
        <Animated.Text entering={FadeInDown.delay(120).duration(700)} style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>SOLLO BUSINESS
        </Animated.Text>

        {/* Mesma ideia do título da landing, com o mesmo destaque em
            magenta, mas curto: numa tela de 390pt a frase inteira do site
            quebrava em quatro linhas e perdia o impacto. */}
        <Animated.Text entering={FadeInDown.delay(220).duration(700)} style={styles.title}>
          O marketplace do{"\n"}
          <Text style={styles.titleEm}>entretenimento</Text>.
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(320).duration(700)} style={styles.lead}>
          Caiu alguém da equipe e o evento é amanhã? Publique a vaga e avisamos, na hora, os
          profissionais que estão no seu raio.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.provas}>
          <Prova texto="Vaga urgente por raio" />
          <Prova texto="Candidatura de um toque" tom={colors.lime} />
          <Prova texto="Avaliação em duas vias" />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(480).duration(700)} style={styles.actions}>
        <Button label="Criar minha conta" onPress={() => router.push("/(auth)/tipo-de-conta")} />
        <Button label="Já tenho conta" variant="ghost" onPress={() => router.push("/(auth)/login")} />

        <Text style={styles.terms}>
          Ao continuar, você concorda com os{" "}
          <Text style={styles.link} onPress={() => Linking.openURL(LINKS.termos)}>
            Termos de uso
          </Text>{" "}
          e a{" "}
          <Text style={styles.link} onPress={() => Linking.openURL(LINKS.privacidade)}>
            Política de privacidade
          </Text>
          .
        </Text>
      </Animated.View>
    </Screen>
  );
}

function Prova({ texto, tom = colors.magenta }: { texto: string; tom?: string }) {
  return (
    <View style={styles.prova}>
      <View style={[styles.provaPonto, { backgroundColor: tom }]} />
      <Text style={styles.provaTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: space.lg },
  marcaDagua: { position: "absolute", top: 40, right: -110 },

  center: { flex: 1, justifyContent: "flex-end", gap: space.lg, paddingBottom: space.xl },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  title: { ...type.display, color: colors.white },
  titleEm: { color: colors.magenta },
  lead: { ...type.body, color: colors.inkDim },

  provas: { gap: space.sm, marginTop: space.xs },
  prova: { flexDirection: "row", alignItems: "center", gap: space.md },
  provaPonto: { width: 6, height: 6, borderRadius: 3 },
  provaTexto: { ...type.caption, color: colors.inkDim },

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
