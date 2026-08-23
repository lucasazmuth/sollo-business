import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, radius, space, type } from "@/src/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "magenta" | "lime" | "ghost";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const palette: Record<Variant, { bg: string; ink: string; border: string }> = {
  magenta: { bg: colors.magenta, ink: colors.white, border: "transparent" },
  lime: { bg: colors.lime, ink: colors.black, border: "transparent" },
  ghost: { bg: "transparent", ink: colors.white, border: colors.lineStrong }
};

/** Botão-pílula da marca, com resposta tátil de escala. */
export function Button({ label, onPress, variant = "magenta", loading, disabled, style }: Props) {
  const scale = useSharedValue(1);
  const tone = palette[variant];
  const inactive = disabled || loading;

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      style={[
        styles.base,
        { backgroundColor: tone.bg, borderColor: tone.border },
        inactive && styles.inactive,
        animated,
        style
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={tone.ink} size="small" />
        ) : (
          <Text style={[styles.label, { color: tone.ink }]}>{label.toUpperCase()}</Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: space.xl
  },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space.sm },
  label: { ...type.button },
  inactive: { opacity: 0.45 }
});
