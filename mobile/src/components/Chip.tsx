import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, space, type } from "@/src/theme/tokens";

type Props = {
  label: string;
  selecionado?: boolean;
  onPress?: () => void;
  tom?: "magenta" | "lime" | "neutro";
};

export function Chip({ label, selecionado, onPress, tom = "magenta" }: Props) {
  const cor = tom === "lime" ? colors.lime : tom === "neutro" ? colors.white : colors.magenta;

  if (!onPress) {
    return (
      <Text style={[styles.chip, styles.texto, selecionado && { borderColor: cor, color: cor }]}>
        {label}
      </Text>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selecionado }}
      style={[
        styles.chip,
        selecionado && { borderColor: cor, backgroundColor: `${cor}1A` }
      ]}
    >
      <Text style={[styles.texto, selecionado && { color: cor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden"
  },
  texto: { ...type.bodyMedium, fontSize: 13, color: colors.inkDim }
});
