import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { Input } from "@/src/components/Input";
import { supabase } from "@/src/lib/supabase";
import { passwordIssue } from "@/src/lib/auth";
import { colors, radius, space, type } from "@/src/theme/tokens";

/**
 * O link de "recuperar-senha.tsx" abre esta tela via deep link
 * (sollo://redefinir-senha#access_token=...&refresh_token=...&type=recovery).
 * O client roda com `detectSessionInUrl: false` (é a config certa pra RN),
 * então quem lê a URL e ativa a sessão de recuperação é esta tela, na mão.
 */
function tokensDoLink(url: string) {
  const fragmento = url.split("#")[1] ?? url.split("?")[1];
  if (!fragmento) return null;

  const params = new URLSearchParams(fragmento);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token };
}

export default function RedefinirSenha() {
  const router = useRouter();
  const [preparando, setPreparando] = useState(true);
  const [linkValido, setLinkValido] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const jaAtivou = useRef(false);

  useEffect(() => {
    async function ativarSessaoDeRecuperacao(url: string | null) {
      if (!url || jaAtivou.current) return;
      const tokens = tokensDoLink(url);
      if (!tokens) return;

      jaAtivou.current = true;
      const { error } = await supabase.auth.setSession(tokens);
      setLinkValido(!error);
      setPreparando(false);
    }

    Linking.getInitialURL().then((url) => {
      ativarSessaoDeRecuperacao(url).then(() => {
        if (!jaAtivou.current) setPreparando(false);
      });
    });

    const sub = Linking.addEventListener("url", (evento) => {
      ativarSessaoDeRecuperacao(evento.url);
    });

    return () => sub.remove();
  }, []);

  const senhaHint = senha ? passwordIssue(senha) : null;
  const podeSalvar = !senhaHint && senha.length > 0 && senha === confirmar;

  async function salvar() {
    if (!podeSalvar) return;
    setErro(null);
    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setSucesso(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar a nova senha.");
    } finally {
      setSalvando(false);
    }
  }

  if (preparando) {
    return (
      <Screen scroll={false}>
        <View style={styles.centro}>
          <Text style={styles.lead}>Confirmando o link…</Text>
        </View>
      </Screen>
    );
  }

  if (!linkValido) {
    return (
      <Screen back scroll={false}>
        <View style={styles.centro}>
          <Text style={styles.title}>Link expirado</Text>
          <Text style={styles.lead}>
            Esse link de redefinição não é mais válido. Peça um novo em "Esqueci minha senha".
          </Text>
          <Button
            label="Pedir novo link"
            onPress={() => router.replace("/(auth)/recuperar-senha")}
            style={{ marginTop: space.lg }}
          />
        </View>
      </Screen>
    );
  }

  if (sucesso) {
    // Rota própria em vez de um bloco aqui: a tela de sucesso é a mesma da
    // confirmação de e-mail, só muda o texto.
    router.replace({
      pathname: "/(auth)/sucesso",
      params: {
        titulo: "Senha alterada",
        texto: "Pronto. Já dá para continuar usando o app normalmente.",
        destino: "/home",
        botao: "Continuar"
      }
    });
    return null;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Defina sua{"\n"}nova senha.</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Nova senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="Mínimo de 8 caracteres"
          autoCapitalize="none"
          secure
          returnKeyType="next"
        />
        {!!senhaHint && <Text style={styles.hint}>{senhaHint}</Text>}

        <Input
          label="Confirmar senha"
          value={confirmar}
          onChangeText={setConfirmar}
          placeholder="Repita a senha"
          autoCapitalize="none"
          secure
          returnKeyType="done"
          onSubmitEditing={salvar}
          error={confirmar.length > 0 && confirmar !== senha ? "As senhas não coincidem." : erro ?? undefined}
        />
      </View>

      <View style={styles.actions}>
        <Button label="Salvar nova senha" onPress={salvar} loading={salvando} disabled={!podeSalvar} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md, paddingTop: space.lg, paddingBottom: space["2xl"] },
  title: { ...type.h1, color: colors.white },
  lead: { ...type.body, color: colors.inkDim, textAlign: "center", marginTop: space.sm },
  hint: { ...type.caption, color: colors.inkFaint, marginTop: -space.sm },

  form: { flex: 1, gap: space.lg },
  actions: { paddingBottom: space.sm },

  centro: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xl },

});
