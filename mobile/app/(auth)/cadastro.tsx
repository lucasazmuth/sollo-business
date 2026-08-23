import { useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { ehAuthError, passwordIssue, signUp, type AccountType } from "@/src/lib/auth";
import { colors, space, type } from "@/src/theme/tokens";

export default function Cadastro() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tipo?: string }>();
  const tipo: AccountType = params.tipo === "contratante" ? "contratante" : "profissional";

  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aceito, setAceito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const senhaHint = senha ? passwordIssue(senha) : null;

  async function onSubmit() {
    setErrors({});

    if (!aceito) {
      setErrors({ termos: "É preciso aceitar os termos para continuar." });
      return;
    }

    setLoading(true);
    try {
      const { precisaConfirmarEmail } = await signUp({ nome, email, senha, tipo });

      if (precisaConfirmarEmail) {
        // Precisa ser o mesmo e-mail normalizado que o signUp mandou pro
        // Supabase — senão o verifyOtp da tela seguinte compara com um
        // e-mail diferente do dono do código e sempre recusa.
        router.replace({
          pathname: "/(auth)/confirmar-email",
          params: { email: email.trim().toLowerCase() }
        });
      } else {
        router.replace("/home");
      }
    } catch (e) {
      if (ehAuthError(e) && e.field) setErrors({ [e.field]: e.message });
      else setErrors({ geral: "Não foi possível criar sua conta agora." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen back>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>PASSO 2 DE 2 · {tipo.toUpperCase()}
        </Text>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.lead}>
          Leva menos de um minuto. Você completa o perfil depois de entrar.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Nome"
          value={nome}
          onChangeText={setNome}
          placeholder="Como podemos te chamar?"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          error={errors.nome}
        />

        <Input
          ref={emailRef}
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
          placeholder="Mínimo de 8 caracteres"
          autoCapitalize="none"
          autoComplete="new-password"
          secure
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={errors.senha}
        />

        {!!senhaHint && !errors.senha && <Text style={styles.hint}>{senhaHint}</Text>}

        <Pressable
          style={styles.terms}
          onPress={() => setAceito((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: aceito }}
        >
          <View style={[styles.check, aceito && styles.checkOn]}>
            {aceito && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Li e aceito os{" "}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL("https://www.sollo.business/termos")}
            >
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
        </Pressable>

        {!!errors.termos && <Text style={styles.error}>{errors.termos}</Text>}
        {!!errors.geral && <Text style={styles.error}>{errors.geral}</Text>}
      </View>

      <View style={styles.actions}>
        <Button label="Criar conta" onPress={onSubmit} loading={loading} />
        <Pressable onPress={() => router.replace("/(auth)/login")} hitSlop={8}>
          <Text style={styles.switch}>
            Já tem conta? <Text style={styles.switchStrong}>Entrar</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingTop: space.lg, paddingBottom: space.xl },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  title: { ...type.h1, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },
  form: { flex: 1, gap: space.lg, paddingBottom: space.xl },
  hint: { ...type.caption, color: colors.inkFaint, marginTop: -space.sm },
  terms: { flexDirection: "row", alignItems: "flex-start", gap: space.md, marginTop: space.xs },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  checkOn: { backgroundColor: colors.magenta, borderColor: colors.magenta },
  checkMark: { color: colors.white, fontSize: 13, lineHeight: 16 },
  termsText: { ...type.caption, color: colors.inkDim, flex: 1 },
  link: { color: colors.white, textDecorationLine: "underline" },
  error: { ...type.caption, color: colors.danger },
  actions: { gap: space.lg, paddingBottom: space.sm },
  switch: { ...type.caption, color: colors.inkDim, textAlign: "center" },
  switchStrong: { color: colors.white, fontFamily: type.h3.fontFamily }
});
