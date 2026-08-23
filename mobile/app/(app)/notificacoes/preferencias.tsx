import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen } from "@/src/components/Screen";
import { useSession } from "@/src/lib/session";
import {
  buscarPreferencias,
  salvarPreferencias,
  type Preferencias
} from "@/src/api/notifications";
import { registrarParaPush } from "@/src/lib/notifications";
import { colors, radius, space, type } from "@/src/theme/tokens";

const TETOS = [3, 5, 10, 20];

export default function PreferenciasNotificacao() {
  const { session, profile } = useSession();
  const userId = session?.user.id;

  const [prefs, setPrefs] = useState<Preferencias | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [statusPush, setStatusPush] = useState<string | null>(null);

  const ehProfissional = profile?.tipo === "profissional";

  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    buscarPreferencias(userId)
      .then((p) => vivo && setPrefs(p))
      .finally(() => vivo && setCarregando(false));

    // Tenta registrar o aparelho e reporta com honestidade se não der.
    registrarParaPush(userId).then((r) => {
      if (!vivo) return;
      if (r.ok) setStatusPush("Este aparelho está registrado para receber push.");
      else if (r.motivo === "expo-go")
        setStatusPush("No Expo Go o push remoto não funciona: precisa de um development build.");
      else if (r.motivo === "simulador")
        setStatusPush("Simulador não recebe push. Use um aparelho físico.");
      else if (r.motivo === "permissao-negada")
        setStatusPush("Permissão de notificação negada. Você pode liberar em Ajustes do sistema.");
      else setStatusPush("Não foi possível registrar este aparelho para push.");
    });

    return () => {
      vivo = false;
    };
  }, [userId]);

  async function alternar(campo: keyof Preferencias, valor: boolean | number) {
    if (!userId || !prefs) return;
    setPrefs({ ...prefs, [campo]: valor } as Preferencias);
    await salvarPreferencias(userId, { [campo]: valor } as never).catch(() => {});
  }

  if (carregando || !prefs) {
    return (
      <Screen back scroll={false}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>NOTIFICAÇÕES
        </Text>
        <Text style={styles.titulo}>O que avisar,{"\n"}e como.</Text>
      </View>

      {!!statusPush && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.statusPush}>
          <Text style={styles.statusPushTexto}>{statusPush}</Text>
        </Animated.View>
      )}

      {ehProfissional && (
        <Secao titulo="VAGAS NA MINHA REGIÃO">
          <Linha
            rotulo="Push de vaga"
            ajuda="O aviso que faz você chegar primeiro na vaga urgente."
            valor={prefs.push_vagas}
            onChange={(v) => alternar("push_vagas", v)}
          />
          <Linha
            rotulo="E-mail de vaga urgente"
            ajuda="Só para urgentes. Push perdido é vaga perdida."
            valor={prefs.email_vagas}
            onChange={(v) => alternar("email_vagas", v)}
          />
          <Linha
            rotulo="Urgente fura o silêncio"
            ajuda="Deixa vaga urgente tocar mesmo entre 22h e 7h."
            valor={prefs.urgente_ignora_silencio}
            onChange={(v) => alternar("urgente_ignora_silencio", v)}
          />

          <View style={styles.teto}>
            <Text style={styles.rotulo}>MÁXIMO DE AVISOS DE VAGA POR DIA</Text>
            <Text style={styles.ajuda}>
              Passando disso, seguramos até o dia seguinte. Notificação demais cansa e vira
              desinstalação.
            </Text>
            <View style={styles.opcoes}>
              {TETOS.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => alternar("max_push_vagas_dia", t)}
                  style={[styles.opcao, prefs.max_push_vagas_dia === t && styles.opcaoAtiva]}
                >
                  <Text
                    style={[
                      styles.opcaoTexto,
                      prefs.max_push_vagas_dia === t && { color: colors.white }
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Secao>
      )}

      <Secao titulo={ehProfissional ? "MINHAS CANDIDATURAS" : "CANDIDATOS"}>
        <Linha
          rotulo={ehProfissional ? "Push de resposta" : "Push de nova candidatura"}
          ajuda={
            ehProfissional
              ? "Quando o contratante escolhe ou recusa."
              : "Quando alguém se candidata às suas vagas."
          }
          valor={prefs.push_candidaturas}
          onChange={(v) => alternar("push_candidaturas", v)}
        />
        <Linha
          rotulo="E-mail"
          ajuda="Mesmo conteúdo, pela caixa de entrada."
          valor={prefs.email_candidaturas}
          onChange={(v) => alternar("email_candidaturas", v)}
        />
        <Linha
          rotulo="Mudanças de status"
          ajuda="Vaga cancelada, lembrete da véspera, avaliação recebida."
          valor={prefs.push_status}
          onChange={(v) => alternar("push_status", v)}
        />
      </Secao>

      <Secao titulo="CHAT">
        <Linha
          rotulo="Push de mensagem"
          ajuda="Respeita o horário de silêncio."
          valor={prefs.push_chat}
          onChange={(v) => alternar("push_chat", v)}
        />
      </Secao>

      <Text style={styles.rodape}>
        Horário de silêncio: {String(prefs.quiet_start).slice(0, 5)} às{" "}
        {String(prefs.quiet_end).slice(0, 5)}.
      </Text>
    </Screen>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function Linha({
  rotulo,
  ajuda,
  valor,
  onChange
}: {
  rotulo: string;
  ajuda: string;
  valor: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.linha}>
      <View style={styles.linhaTexto}>
        <Text style={styles.linhaRotulo}>{rotulo}</Text>
        <Text style={styles.ajuda}>{ajuda}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: colors.line, true: colors.magenta }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  cabecalho: { gap: space.md, paddingTop: space.lg },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  titulo: { ...type.h1, color: colors.white },

  statusPush: {
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  statusPushTexto: { ...type.caption, color: colors.inkDim },

  secao: { marginTop: space["2xl"], gap: space.lg },
  secaoTitulo: { ...type.label, color: colors.inkFaint },

  linha: { flexDirection: "row", alignItems: "center", gap: space.lg },
  linhaTexto: { flex: 1, gap: 3 },
  linhaRotulo: { ...type.bodyMedium, color: colors.white },
  ajuda: { ...type.caption, color: colors.inkFaint },
  rotulo: { ...type.label, color: colors.inkDim },

  teto: { gap: space.sm, paddingTop: space.sm },
  opcoes: { flexDirection: "row", gap: space.sm, marginTop: space.xs },
  opcao: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  opcaoAtiva: { borderColor: colors.magenta, backgroundColor: "rgba(216,19,104,0.12)" },
  opcaoTexto: { ...type.bodyMedium, color: colors.inkDim },

  rodape: {
    ...type.caption,
    color: colors.inkFaint,
    marginTop: space["2xl"],
    paddingBottom: space.xl
  }
});
