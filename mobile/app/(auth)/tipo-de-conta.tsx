import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { colors, radius, space, type } from "@/src/theme/tokens";
import type { AccountType } from "@/src/lib/auth";

/**
 * Sem selo de preço: nenhuma cobrança está integrada ainda, e anunciar
 * valor numa tela de cadastro é promessa que o produto não cumpre hoje.
 */
const options: {
  id: AccountType;
  title: string;
  text: string;
  accent: string;
}[] = [
  {
    id: "profissional",
    title: "Sou profissional",
    text: "Exponha seu trabalho, candidate-se a vagas e receba pelos serviços entregues.",
    accent: colors.magenta
  },
  {
    id: "contratante",
    title: "Sou contratante",
    text: "Publique vagas, encontre talentos e combine os detalhes direto pelo chat.",
    accent: colors.lime
  }
];

/** Define o tipo de conta antes do cadastro — decisão central do produto. */
export default function TipoDeConta() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountType | null>(null);

  return (
    <Screen back>
      <View style={styles.header}>
        <Text style={styles.title}>Como você{"\n"}vai usar a Sollo Business?</Text>
        <Text style={styles.lead}>Dá para mudar isso depois, no seu perfil.</Text>
      </View>

      <View style={styles.list}>
        {options.map((option, i) => {
          const on = selected === option.id;
          return (
            <Animated.View key={option.id} entering={FadeInDown.delay(120 + i * 90).duration(600)}>
              <Pressable
                onPress={() => setSelected(option.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[styles.card, on && { borderColor: option.accent }]}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <View style={[styles.radio, on && { borderColor: option.accent }]}>
                    {on && <View style={[styles.radioDot, { backgroundColor: option.accent }]} />}
                  </View>
                </View>

                <Text style={styles.cardText}>{option.text}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Button
        label="Continuar"
        disabled={!selected}
        onPress={() =>
          router.push({ pathname: "/(auth)/cadastro", params: { tipo: selected ?? "profissional" } })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingTop: space.lg, paddingBottom: space["2xl"] },
  title: { ...type.h1, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },
  list: { flex: 1, gap: space.md, paddingBottom: space.xl },
  card: {
    padding: space.xl,
    gap: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { ...type.h2, color: colors.white },
  cardText: { ...type.body, color: colors.inkDim },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 }
});
