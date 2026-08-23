import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { supabase } from "@/src/lib/supabase";
import { colors, radius, space, type } from "@/src/theme/tokens";

/**
 * Mostrada quando o projeto exige confirmação por e-mail: o signUp
 * criou a conta mas ainda não há sessão.
 */
export default function ConfirmarEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [reenviando, setReenviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function reenviar() {
    if (!email) return;
    setReenviando(true);
    setAviso(null);

    const { error } = await supabase.auth.resend({ type: "signup", email });

    setAviso(
      error
        ? "Não foi possível reenviar agora. Tente em alguns minutos."
        : "Enviamos de novo. Confira a caixa de entrada."
    );
    setReenviando(false);
  }

  return (
    <Screen back>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>QUASE LÁ
        </Text>
        <Text style={styles.title}>Confirme{"\n"}seu e-mail.</Text>
        <Text style={styles.lead}>
          Mandamos um link de confirmação para {email ?? "seu e-mail"}. Abra o link e volte para
          entrar.
        </Text>
      </View>

      <View style={styles.corpo}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por que confirmar?</Text>
          <Text style={styles.cardText}>
            É pelo e-mail que avisamos de vagas urgentes na sua região quando o push não chega. Sem
            ele confirmado, você perde oportunidade.
          </Text>
        </View>

        {!!aviso && (
          <Animated.Text entering={FadeIn.duration(400)} style={styles.aviso}>
            {aviso}
          </Animated.Text>
        )}
      </View>

      <View style={styles.acoes}>
        <Button label="Já confirmei, entrar" onPress={() => router.replace("/(auth)/login")} />
        <Button
          label="Reenviar e-mail"
          variant="ghost"
          loading={reenviando}
          onPress={reenviar}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingTop: space.lg, paddingBottom: space["2xl"] },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  title: { ...type.h1, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },
  corpo: { flex: 1, gap: space.lg },
  card: {
    gap: space.sm,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardTitle: { ...type.h3, color: colors.white },
  cardText: { ...type.body, color: colors.inkDim },
  aviso: { ...type.caption, color: colors.lime },
  acoes: { gap: space.md, paddingBottom: space.sm }
});
