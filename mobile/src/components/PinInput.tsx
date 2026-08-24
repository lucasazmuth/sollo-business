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
  // flex:1 nas caixas em vez de largura fixa — o código já variou de 6 pra
  // 8 dígitos uma vez (o tamanho é configurável no projeto Supabase), então
  // a largura precisa se ajustar sozinha em vez de estourar a tela.
  wrap: { flexDirection: "row", gap: space.sm, position: "relative" },
  caixa: {
    flex: 1,
    // Caixa alta e quadrada: o dígito precisa ser lido de relance por quem
    // está alternando entre o app e o e-mail.
    aspectRatio: 0.86,
    maxHeight: 68,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  caixaAtiva: { borderColor: colors.magenta, backgroundColor: colors.surface2 },
  digito: { ...type.h1, color: colors.white },
  inputReal: { position: "absolute", inset: 0, opacity: 0 }
});
