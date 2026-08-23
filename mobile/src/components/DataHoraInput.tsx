import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, radius, space, type } from "@/src/theme/tokens";

type Props = {
  valor: Date;
  onChange: (data: Date) => void;
  erro?: string;
};

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function formatarDataHora(d: Date) {
  const dia = String(d.getDate()).padStart(2, "0");
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${DIAS[d.getDay()]}, ${dia} ${MESES[d.getMonth()]} · ${hora}:${min}`;
}

/** Quanto falta para começar — é o que define se a vaga é urgente. */
export function horasAte(d: Date) {
  return (d.getTime() - Date.now()) / 3_600_000;
}

export function DataHoraInput({ valor, onChange, erro }: Props) {
  const [modo, setModo] = useState<"date" | "time" | null>(null);

  function aoEscolher(_: unknown, escolhida?: Date) {
    if (Platform.OS === "android") setModo(null);
    if (!escolhida) return;

    if (modo === "date") {
      // Mantém a hora já escolhida ao trocar só o dia.
      const nova = new Date(valor);
      nova.setFullYear(escolhida.getFullYear(), escolhida.getMonth(), escolhida.getDate());
      onChange(nova);
    } else {
      const nova = new Date(valor);
      nova.setHours(escolhida.getHours(), escolhida.getMinutes(), 0, 0);
      onChange(nova);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>QUANDO É O TRABALHO</Text>

      <View style={styles.linha}>
        <Pressable
          style={[styles.botao, !!erro && styles.botaoErro]}
          onPress={() => setModo(modo === "date" ? null : "date")}
        >
          <Text style={styles.botaoRotulo}>DIA</Text>
          <Text style={styles.botaoValor}>{formatarDataHora(valor).split(" · ")[0]}</Text>
        </Pressable>

        <Pressable
          style={[styles.botao, !!erro && styles.botaoErro]}
          onPress={() => setModo(modo === "time" ? null : "time")}
        >
          <Text style={styles.botaoRotulo}>HORA</Text>
          <Text style={styles.botaoValor}>{formatarDataHora(valor).split(" · ")[1]}</Text>
        </Pressable>
      </View>

      {modo && (
        <View style={styles.picker}>
          <DateTimePicker
            value={valor}
            mode={modo}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={modo === "date" ? new Date() : undefined}
            themeVariant="dark"
            locale="pt-BR"
            onChange={aoEscolher}
          />
          {Platform.OS === "ios" && (
            <Pressable onPress={() => setModo(null)} style={styles.pronto}>
              <Text style={styles.prontoTexto}>PRONTO</Text>
            </Pressable>
          )}
        </View>
      )}

      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { ...type.label, color: colors.inkDim },
  linha: { flexDirection: "row", gap: space.md },
  botao: {
    flex: 1,
    gap: 4,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    minHeight: 56,
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255,255,255,0.03)"
  },
  botaoErro: { borderColor: colors.danger },
  botaoRotulo: { ...type.label, fontSize: 9, color: colors.inkFaint },
  botaoValor: { ...type.bodyMedium, color: colors.white },
  picker: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  pronto: { alignItems: "center", paddingVertical: space.md, borderTopWidth: 1, borderTopColor: colors.line },
  prontoTexto: { ...type.label, color: colors.magenta },
  erro: { ...type.caption, color: colors.danger }
});
