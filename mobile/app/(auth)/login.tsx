import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { Wordmark } from "@/src/components/Logo";
import { Blobs } from "@/src/components/Blobs";
import { ehAuthError, signIn } from "@/src/lib/auth";
import { colors, space, type } from "@/src/theme/tokens";

export default function Login() {
  const router = useRouter();
  const senhaRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit() {
    setErrors({});
    setLoading(true);
    try {
      await signIn(email, senha);
      router.replace("/home");
    } catch (e) {
      // Conta existe mas o e-mail nunca foi confirmado: em vez de deixar a
      // pessoa presa num erro sem saída, leva pra tela do código (que tem o
      // botão de reenviar). Era a única forma de chegar lá depois do cadastro.
      if (ehAuthError(e) && e.motivo === "email_nao_confirmado") {
        router.push({
          pathname: "/(auth)/confirmar-email",
          params: { email: email.trim().toLowerCase() }
        });
        return;
      }

      if (ehAuthError(e) && e.field) setErrors({ [e.field]: e.message });
      else setErrors({ geral: "Não foi possível entrar agora." });
    } finally {
      setLoading(false);
    }
  }

  return (
    // Esferas mais fracas que na abertura: aqui a tela é formulário, e o
    // fundo precisa dar continuidade de marca sem competir com os campos.
    <Screen back fundo={<Blobs intensidade={0.4} />}>
      <View style={styles.header}>
        <Wordmark width={104} />
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>ENTRAR
        </Text>
        <Text style={styles.title}>Bem-vindo{"\n"}de volta.</Text>
        <Text style={styles.lead}>
          Suas vagas, candidaturas e conversas continuam de onde pararam.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => senhaRef.current?.focus()}
          error={errors.email}
        />

        <Input
          ref={senhaRef}
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          autoCapitalize="none"
          autoComplete="current-password"
          secure
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={errors.senha}
        />

        <Pressable
          onPress={() => router.push("/(auth)/recuperar-senha")}
          hitSlop={8}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgot}>Esqueci minha senha</Text>
        </Pressable>

        {!!errors.geral && <Text style={styles.error}>{errors.geral}</Text>}
      </View>

      <View style={styles.actions}>
        <Button label="Entrar" onPress={onSubmit} loading={loading} />
        <Pressable onPress={() => router.replace("/(auth)/tipo-de-conta")} hitSlop={8}>
          <Text style={styles.switch}>
            Ainda não tem conta? <Text style={styles.switchStrong}>Criar agora</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingTop: space.lg, paddingBottom: space["2xl"] },
  eyebrow: { ...type.label, color: colors.inkDim, marginTop: space.md },
  dot: { color: colors.magenta },
  title: { ...type.display, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },
  form: { flex: 1, gap: space.lg, paddingBottom: space.xl },
  forgotWrap: { alignSelf: "flex-start" },
  forgot: { ...type.caption, color: colors.magenta, fontFamily: type.h3.fontFamily },
  error: { ...type.caption, color: colors.danger },
  actions: { gap: space.lg, paddingBottom: space.sm },
  switch: { ...type.caption, color: colors.inkDim, textAlign: "center" },
  switchStrong: { color: colors.white, fontFamily: type.h3.fontFamily }
});
