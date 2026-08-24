import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { ehAuthError, requestPasswordReset } from "@/src/lib/auth";
import { colors, radius, space, type } from "@/src/theme/tokens";

export default function RecuperarSenha() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (e) {
      setError(ehAuthError(e) ? e.message : "Não foi possível enviar agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen back>
      <View style={styles.header}>
        <Text style={styles.title}>Esqueceu{"\n"}a senha?</Text>
        <Text style={styles.lead}>
          Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
        </Text>
      </View>

      <View style={styles.form}>
        {sent ? (
          <Animated.View entering={FadeIn.duration(500)} style={styles.success}>
            <Text style={styles.successTitle}>E-mail a caminho</Text>
            <Text style={styles.successText}>
              Se existir uma conta para {email.trim().toLowerCase()}, o link de redefinição chega em
              instantes. Confira também o spam.
            </Text>
          </Animated.View>
        ) : (
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            error={error ?? undefined}
          />
        )}
      </View>

      <View style={styles.actions}>
        {sent ? (
          <Button label="Voltar para o login" onPress={() => router.replace("/(auth)/login")} />
        ) : (
          <Button label="Enviar link" onPress={onSubmit} loading={loading} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingTop: space.lg, paddingBottom: space["2xl"] },
  title: { ...type.h1, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },
  form: { flex: 1, gap: space.lg },
  success: {
    gap: space.md,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lime,
    backgroundColor: "rgba(206,254,42,0.06)"
  },
  successTitle: { ...type.h3, color: colors.lime },
  successText: { ...type.body, color: colors.inkDim },
  actions: { paddingBottom: space.sm }
});
