import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/src/components/Avatar";
import { useSession } from "@/src/lib/session";
import {
  buscarConversa,
  enviarMensagem,
  listarMensagens,
  marcarMensagensLidas,
  ouvirMensagens,
  type ConversaDetalhe,
  type Mensagem
} from "@/src/api/chat";
import { colors, radius, space, type } from "@/src/theme/tokens";

function hora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function mesmoDia(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function rotuloDia(iso: string) {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (d.toDateString() === hoje.toDateString()) return "hoje";
  if (d.toDateString() === ontem.toDateString()) return "ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function Conversa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const meuId = session?.user.id;

  const [conversa, setConversa] = useState<ConversaDetalhe | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id || !meuId) return;
    let vivo = true;

    (async () => {
      const [c, m] = await Promise.all([buscarConversa(id, meuId), listarMensagens(id)]);
      if (!vivo) return;
      setConversa(c);
      setMensagens(m);
      await marcarMensagensLidas(id, meuId).catch(() => {});
    })()
      .catch(() => {})
      .finally(() => vivo && setCarregando(false));

    // Realtime: mensagem do outro lado aparece sem precisar recarregar.
    const parar = ouvirMensagens(id, (nova) => {
      setMensagens((atual) => (atual.some((m) => m.id === nova.id) ? atual : [...atual, nova]));
      if (nova.sender_id !== meuId) marcarMensagensLidas(id, meuId).catch(() => {});
    });

    return () => {
      vivo = false;
      parar();
    };
  }, [id, meuId]);

  const enviar = useCallback(async () => {
    const corpo = texto.trim();
    if (!corpo || !id || !meuId) return;

    setTexto("");
    setEnviando(true);
    try {
      const nova = await enviarMensagem(id, meuId, corpo);
      // O Realtime também devolve esta mensagem; o guard de id evita duplicar.
      setMensagens((atual) => (atual.some((m) => m.id === nova.id) ? atual : [...atual, nova]));
    } catch {
      setTexto(corpo); // devolve o que foi digitado em vez de engolir
    } finally {
      setEnviando(false);
    }
  }, [texto, id, meuId]);

  if (carregando) {
    return (
      <View style={styles.root}>
        <View style={styles.centro}>
          <ActivityIndicator color={colors.magenta} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.cabecalho, { paddingTop: insets.top + space.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.voltar}>
          <Text style={styles.voltarIcone}>←</Text>
        </Pressable>

        <Pressable
          style={styles.identidade}
          onPress={() => conversa?.outro && router.push(`/(app)/perfil/${conversa.outro.id}`)}
        >
          <Avatar url={conversa?.outro?.avatar_url} nome={conversa?.outro?.nome} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nome} numberOfLines={1}>
              {conversa?.outro?.nome ?? "Conversa"}
            </Text>
            {!!conversa?.jobs && (
              <Text style={styles.vaga} numberOfLines={1}>
                {conversa.jobs.titulo}
              </Text>
            )}
          </View>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scroll}
          contentContainerStyle={styles.lista}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {mensagens.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>Comece a conversa</Text>
              <Text style={styles.vazioTexto}>
                Alinhe horário de chegada, equipamento e valor antes do dia.
              </Text>
            </View>
          ) : (
            mensagens.map((m, i) => {
              const minha = m.sender_id === meuId;
              const anterior = mensagens[i - 1];
              const novoDia = !anterior || !mesmoDia(anterior.created_at, m.created_at);

              return (
                <View key={m.id}>
                  {novoDia && (
                    <View style={styles.separadorDia}>
                      <Text style={styles.separadorTexto}>{rotuloDia(m.created_at)}</Text>
                    </View>
                  )}
                  <Animated.View
                    entering={FadeIn.duration(220)}
                    style={[styles.balao, minha ? styles.minha : styles.dele]}
                  >
                    <Text style={[styles.corpo, minha && { color: colors.white }]}>{m.corpo}</Text>
                    <Text style={[styles.hora, minha && { color: "rgba(255,255,255,0.6)" }]}>
                      {hora(m.created_at)}
                      {minha && m.read_at ? " · lida" : ""}
                    </Text>
                  </Animated.View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.barra, { paddingBottom: insets.bottom + space.md }]}>
          <TextInput
            style={styles.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva uma mensagem"
            placeholderTextColor={colors.inkFaint}
            selectionColor={colors.magenta}
            multiline
            maxLength={1000}
          />
          <Pressable
            onPress={enviar}
            disabled={!texto.trim() || enviando}
            style={[styles.enviar, (!texto.trim() || enviando) && styles.enviarInativo]}
          >
            {enviando ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.enviarIcone}>↑</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  voltar: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  voltarIcone: { ...type.h3, color: colors.white },
  identidade: { flexDirection: "row", alignItems: "center", gap: space.md, flex: 1 },
  nome: { ...type.bodyMedium, color: colors.white },
  vaga: { ...type.caption, color: colors.inkFaint },

  lista: { padding: space.lg, gap: space.sm, flexGrow: 1, justifyContent: "flex-end" },

  separadorDia: { alignItems: "center", paddingVertical: space.md },
  separadorTexto: { ...type.label, fontSize: 9, color: colors.inkFaint },

  balao: {
    maxWidth: "82%",
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    gap: 3
  },
  minha: { alignSelf: "flex-end", backgroundColor: colors.magenta, borderBottomRightRadius: 6 },
  dele: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface2,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.line
  },
  corpo: { ...type.body, color: colors.ink },
  hora: { ...type.caption, fontSize: 11, color: colors.inkFaint, alignSelf: "flex-end" },

  barra: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255,255,255,0.03)",
    ...type.body,
    color: colors.ink
  },
  enviar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.magenta,
    alignItems: "center",
    justifyContent: "center"
  },
  enviarInativo: { opacity: 0.35 },
  enviarIcone: { ...type.h3, color: colors.white, marginTop: -2 },

  vazio: { gap: space.sm, alignItems: "center", paddingVertical: space["3xl"] },
  vazioTitulo: { ...type.h3, color: colors.white },
  vazioTexto: { ...type.body, color: colors.inkDim, textAlign: "center" }
});
