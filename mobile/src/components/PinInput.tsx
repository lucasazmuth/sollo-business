import { useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, space, type } from "@/src/theme/tokens";

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  tamanho?: number;
  autoFocus?: boolean;
};

/**
 * Campo de código de N dígitos: caixas decorativas mostram o valor, um
 * único TextInput invisível por cima captura o teclado numérico inteiro
 * (inclusive autofill de SMS/e-mail one-time-code).
 */
export function PinInput({ valor, onChange, tamanho = 6, autoFocus }: Props) {
  const ref = useRef<TextInput>(null);

  return (
    <Pressable style={styles.wrap} onPress={() => ref.current?.focus()}>
      {Array.from({ length: tamanho }, (_, i) => (
        <View key={i} style={[styles.caixa, i === valor.length && styles.caixaAtiva]}>
          <Text style={styles.digito}>{valor[i] ?? ""}</Text>
        </View>
      ))}

      <TextInput
        ref={ref}
        value={valor}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, tamanho))}
        keyboardType="number-pad"
        autoFocus={autoFocus}
        maxLength={tamanho}
        style={styles.inputReal}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: space.sm, position: "relative" },
  caixa: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  caixaAtiva: { borderColor: colors.magenta },
  digito: { ...type.h2, color: colors.white },
  inputReal: { position: "absolute", inset: 0, opacity: 0 }
});
