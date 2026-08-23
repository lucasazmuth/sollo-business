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
 * criou a conta mas ainda não há sessão. Confirma por código (não link) —
 * mesmo mecanismo pras duas personas.
 *
 * ⚠️ TAMANHO_CODIGO precisa bater com `mailer_otp_length` do projeto
 * (Dashboard → Authentication → Providers → Email → "Number of characters
 * used in the email OTP"). Se os dois divergirem, o app manda um pedaço do
 * código e o Supabase recusa até o código certo — com a mensagem genérica
 * "Token has expired or is invalid", que parece código errado e esconde a
 * causa real. Já aconteceu: o projeto estava em 8 e o app em 6.
 */
const TAMANHO_CODIGO = 6;

/**
 * Piso do botão "Confirmar". Deixar o botão livre a partir daqui evita que
 * uma mudança de `mailer_otp_length` no painel transforme a tela em beco
 * sem saída antes de alguém atualizar o app.
 */
const MINIMO_CODIGO = 6;

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
    // Aceita a partir de MINIMO_CODIGO em vez de exigir o tamanho exato: o
    // tamanho do OTP é configurável no projeto e já mudou uma vez (6 -> 8).
    // Travar no número exato transforma uma mudança de config numa tela morta.
    if (!emailNormalizado || valor.length < MINIMO_CODIGO) return;
    setConfirmando(true);
    setErro(null);

    // "email" é o tipo certo pra verificar o código aqui — "signup" é o tipo
    // do OUTRO fluxo (link de confirmação por token_hash). Usar "signup" aqui
    // faz o Supabase recusar até o código certo com "Token has expired".
    const { error } = await supabase.auth.verifyOtp({
      email: emailNormalizado,
      token: valor,
      type: "email"
    });

    if (error) {
      // O Supabase devolve a mesma mensagem genérica ("Token has expired or
      // is invalid") tanto pra código errado quanto pra código de tamanho
      // errado ou tipo errado. Mostrar o código técnico economiza horas de
      // depuração quando o problema é config, não digitação.
      setErro(
        `Código incorreto ou expirado. Confira o e-mail ou peça um novo. (${error.code ?? error.message})`
      );
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
          Mandamos um código de {TAMANHO_CODIGO} dígitos para {emailNormalizado ?? "seu e-mail"}.
          Digite abaixo.
        </Text>
      </View>

      <View style={styles.corpo}>
        <PinInput
          valor={codigo}
          tamanho={TAMANHO_CODIGO}
          onChange={(v) => {
            setCodigo(v);
            setErro(null);
            if (v.length === TAMANHO_CODIGO) confirmar(v);
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
          disabled={codigo.length < MINIMO_CODIGO}
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
