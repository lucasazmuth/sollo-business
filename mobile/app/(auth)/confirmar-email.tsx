import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { PinInput } from "@/src/components/PinInput";
import { supabase } from "@/src/lib/supabase";
import { colors, radius, space, type } from "@/src/theme/tokens";

/**
 * Mostrada quando o projeto exige confirmação por e-mail: o signUp
 * criou a conta mas ainda não há sessão. Confirma por código de 6
 * dígitos (não link) — mesmo mecanismo pras duas personas.
 */
export default function ConfirmarEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [codigo, setCodigo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Precisa bater exatamente com o e-mail normalizado que o signUp mandou
  // pro Supabase — senão o verifyOtp compara com um e-mail diferente do
  // dono do código e recusa mesmo com o código certo.
  const emailNormalizado = email?.trim().toLowerCase();

  async function confirmar(valor: string) {
    if (!emailNormalizado || valor.length !== 6) return;
    setConfirmando(true);
    setErro(null);

    // "email" é o tipo certo pra verificar o código de 6 dígitos aqui —
    // "signup" é o tipo usado no OUTRO fluxo (link de confirmação por
    // token_hash), não no verifyOtp de código. Usar "signup" aqui faz o
    // Supabase recusar até o código certo com "Token has expired or is invalid".
    const { error } = await supabase.auth.verifyOtp({
      email: emailNormalizado,
      token: valor,
      type: "email"
    });

    if (error) {
      setErro("Código incorreto ou expirado. Confira o e-mail ou peça um novo.");
      setCodigo("");
    } else {
      router.replace("/home");
    }
    setConfirmando(false);
  }

  async function reenviar() {
    if (!emailNormalizado) return;
    setReenviando(true);
    setAviso(null);
    setErro(null);

    const { error } = await supabase.auth.resend({ type: "signup", email: emailNormalizado });

    setAviso(
      error
        ? "Não foi possível reenviar agora. Tente em alguns minutos."
        : "Enviamos um novo código. Confira a caixa de entrada."
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
          Mandamos um código de 6 dígitos para {emailNormalizado ?? "seu e-mail"}. Digite abaixo.
        </Text>
      </View>

      <View style={styles.corpo}>
        <PinInput
          valor={codigo}
          onChange={(v) => {
            setCodigo(v);
            setErro(null);
            if (v.length === 6) confirmar(v);
          }}
          autoFocus
        />

        {!!erro && (
          <Animated.Text entering={FadeIn.duration(300)} style={styles.erro}>
            {erro}
          </Animated.Text>
        )}

        {!!aviso && !erro && (
          <Animated.Text entering={FadeIn.duration(300)} style={styles.aviso}>
            {aviso}
          </Animated.Text>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por que confirmar?</Text>
          <Text style={styles.cardText}>
            É pelo e-mail que avisamos de vagas urgentes na sua região quando o push não chega. Sem
            ele confirmado, você perde oportunidade.
          </Text>
        </View>
      </View>

      <View style={styles.acoes}>
        <Button
          label="Confirmar"
          onPress={() => confirmar(codigo)}
          loading={confirmando}
          disabled={codigo.length !== 6}
        />
        <Button label="Reenviar código" variant="ghost" loading={reenviando} onPress={reenviar} />
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
  erro: { ...type.caption, color: colors.danger },
  aviso: { ...type.caption, color: colors.lime },
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
  acoes: { gap: space.md, paddingBottom: space.sm }
});
