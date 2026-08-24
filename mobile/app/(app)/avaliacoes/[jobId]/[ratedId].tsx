import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { avisar } from "@/src/lib/dialogo";
import { Button } from "@/src/components/Button";
import { StarRating } from "@/src/components/StarRating";
import { useSession } from "@/src/lib/session";
import { enviarAvaliacao } from "@/src/api/ratings";
import { colors, radius, space, type } from "@/src/theme/tokens";

const RÓTULOS: Record<number, string> = {
  1: "Não recomendo",
  2: "Ficou a desejar",
  3: "Cumpriu o combinado",
  4: "Muito bom",
  5: "Excelente"
};

export default function Avaliar() {
  const router = useRouter();
  const { session } = useSession();
  const { jobId, ratedId, nome } = useLocalSearchParams<{
    jobId: string;
    ratedId: string;
    nome?: string;
  }>();

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const meuId = session?.user.id;
    if (!meuId || !jobId || !ratedId || nota === 0) return;

    setEnviando(true);
    try {
      await enviarAvaliacao({ jobId, raterId: meuId, ratedId, nota, comentario });
      // Volta sozinho depois do aviso: depender do onPress do botão do
      // Alert deixava a pessoa parada na tela no web, onde o diálogo é um
      // `window.alert` sem callback.
      avisar("Avaliação enviada", "Obrigado, isso ajuda toda a comunidade.");
      router.back();
    } catch (e) {
      avisar("Não deu", e instanceof Error ? e.message : "Falha ao enviar a avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen back>
      <View style={styles.cabecalho}>
        <Text style={styles.eyebrow}>
          <Text style={styles.dot}>● </Text>AVALIAR
        </Text>
        <Text style={styles.titulo}>
          Como foi trabalhar{"\n"}com {nome ?? "essa pessoa"}?
        </Text>
      </View>

      <View style={styles.estrelas}>
        <StarRating valor={nota} onChange={setNota} tamanho={48} />
        <Text style={styles.rotuloNota}>{nota > 0 ? RÓTULOS[nota] : "Toque para avaliar"}</Text>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>COMENTÁRIO (OPCIONAL)</Text>
        <TextInput
          style={styles.input}
          value={comentario}
          onChangeText={setComentario}
          placeholder="O que valeu destacar sobre esse trabalho?"
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.magenta}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>

      <View style={styles.rodape}>
        <Button label="Enviar avaliação" onPress={enviar} loading={enviando} disabled={nota === 0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cabecalho: { gap: space.sm, paddingTop: space.lg },
  eyebrow: { ...type.label, color: colors.inkDim },
  dot: { color: colors.magenta },
  titulo: { ...type.h1, color: colors.white },

  estrelas: { alignItems: "center", gap: space.md, marginTop: space["2xl"] },
  rotuloNota: { ...type.bodyMedium, color: colors.inkDim },

  campo: { gap: space.sm, marginTop: space["2xl"] },
  label: { ...type.label, color: colors.inkDim },
  input: {
    minHeight: 120,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255,255,255,0.03)",
    ...type.body,
    color: colors.ink,
    textAlignVertical: "top"
  },

  rodape: { marginTop: space["2xl"], paddingBottom: space.lg }
});
