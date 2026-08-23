import { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { colors, radius, space, type } from "@/src/theme/tokens";

type Props = TextInputProps & {
  label: string;
  error?: string;
  /** Adiciona o botão mostrar/ocultar. */
  secure?: boolean;
  /**
   * Estilo do bloco inteiro (rótulo + caixa + erro).
   *
   * `style` vai para o `TextInput` lá dentro, então `style={{ flex: 1 }}`
   * num campo em linha não estica coisa nenhuma: quem divide o espaço com
   * o irmão é este contêiner. Era o que deixava CEP, número e UF do
   * cadastro reduzidos a uma caixinha ilegível.
   */
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, secure, style, containerStyle, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>

      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.magenta}
          secureTextEntry={secure && hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {secure && (
          <Pressable
            hitSlop={12}
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
          >
            <Text style={styles.toggle}>{hidden ? "MOSTRAR" : "OCULTAR"}</Text>
          </Pressable>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { ...type.label, color: colors.inkDim },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 56,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "rgba(255,255,255,0.03)"
  },
  fieldFocused: { borderColor: colors.magenta, backgroundColor: "rgba(255,255,255,0.06)" },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, ...type.bodyMedium, color: colors.ink, paddingVertical: space.md },
  toggle: { ...type.label, color: colors.inkDim },
  error: { ...type.caption, color: colors.danger }
});
