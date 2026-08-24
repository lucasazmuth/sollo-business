import { useRef, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/src/components/Button";
import { Ilustra, ILUSTRA } from "@/src/components/Ilustra";
import { Wordmark } from "@/src/components/Logo";
import { LINKS } from "@/src/lib/links";
import { colors, radius, space, type } from "@/src/theme/tokens";

const SLIDES = [
  {
    fonte: ILUSTRA.sino,
    tom: colors.lime,
    titulo: "Vaga urgente?\nVocê fica sabendo na hora.",
    texto:
      "Caiu alguém da equipe e o evento é amanhã. O contratante publica e nós avisamos, na hora, quem está dentro do raio."
  },
  {
    fonte: ILUSTRA.camera,
    tom: colors.magenta,
    titulo: "Seu trabalho é\na sua candidatura.",
    texto:
      "O perfil já conta sua história: portfólio, categorias e onde você atua. Candidatar é um toque, sem formulário nenhum."
  },
  {
    fonte: ILUSTRA.check,
    tom: colors.lime,
    titulo: "Reputação vale\npara os dois lados.",
    texto:
      "Terminou o job, contratante e profissional se avaliam. É essa nota que decide quem entra na próxima."
  }
];

/** Abertura: três telas de apresentação e as portas de entrada. */
export default function Welcome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const [slide, setSlide] = useState(0);

  const ultimo = slide === SLIDES.length - 1;
  // O palco encolhe em tela baixa para não empurrar os botões para fora.
  const tamanhoIlustra = Math.min(width * 0.46, 190);

  function aoRolar(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== slide) setSlide(i);
  }

  function avancar() {
    if (ultimo) {
      router.push("/(auth)/tipo-de-conta");
      return;
    }
    scroll.current?.scrollTo({ x: (slide + 1) * width, animated: true });
  }

  return (
    <SafeAreaView style={styles.raiz} edges={["top", "bottom"]}>
      <View style={styles.topo}>
        <Wordmark width={104} />
        {!ultimo && (
          <Pressable onPress={() => router.push("/(auth)/tipo-de-conta")} hitSlop={12}>
            <Text style={styles.pular}>PULAR</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={aoRolar}
        scrollEventThrottle={16}
        style={styles.trilho}
      >
        {SLIDES.map((s) => (
          <View key={s.titulo} style={[styles.slide, { width }]}>
            <View style={styles.palco}>
              <Ilustra fonte={s.fonte} tamanho={tamanhoIlustra} tom={s.tom} />
            </View>

            <Text style={styles.titulo}>{s.titulo}</Text>
            <Text style={styles.texto}>{s.texto}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.rodape}>
        <View style={styles.pontos}>
          {SLIDES.map((s, i) => (
            <Animated.View
              key={s.titulo}
              entering={FadeIn}
              style={[styles.ponto, i === slide && styles.pontoAtivo]}
            />
          ))}
        </View>

        <Button label={ultimo ? "Criar minha conta" : "Continuar"} onPress={avancar} />
        <Button
          label="Já tenho conta"
          variant="ghost"
          onPress={() => router.push("/(auth)/login")}
        />

        <Text style={styles.termos}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colors.bg },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingTop: space.md
  },
  pular: { ...type.label, color: colors.inkFaint },

  trilho: { flex: 1 },
  slide: { justifyContent: "center", paddingHorizontal: space.xl, gap: space.lg, paddingTop: space.xl },
  // Espaço próprio para o palco: sem ele o disco encosta no título quando a
  // ilustração cresce em tela grande.
  palco: { alignItems: "flex-start", paddingBottom: space["2xl"] },
  titulo: { ...type.h1, color: colors.white },
  texto: { ...type.body, color: colors.inkDim },

  rodape: { gap: space.md, paddingHorizontal: space.xl, paddingBottom: space.lg },
  pontos: { flexDirection: "row", gap: space.sm, paddingBottom: space.lg },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line
  },
  // O ativo vira barra em vez de só mudar de cor: o progresso fica legível
  // mesmo para quem não distingue bem magenta de cinza.
  pontoAtivo: { width: 26, borderRadius: radius.pill, backgroundColor: colors.magenta },

  termos: {
    ...type.caption,
    color: colors.inkFaint,
    textAlign: "center",
    marginTop: space.sm,
    paddingHorizontal: space.lg
  },
  link: { color: colors.inkDim, textDecorationLine: "underline" }
});
