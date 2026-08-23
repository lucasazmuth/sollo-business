import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated";
import { Wordmark } from "@/src/components/Logo";
import { useSession } from "@/src/lib/session";
import { colors, space, type } from "@/src/theme/tokens";

const HOLD_MS = 1500;

/**
 * Splash animada da marca.
 * Enquanto ela roda, a sessão salva é lida do disco e decide o destino.
 */
export default function Splash() {
  const router = useRouter();
  const { session, loading } = useSession();

  const logo = useSharedValue(0);
  const line = useSharedValue(0);
  const tag = useSharedValue(0);

  useEffect(() => {
    logo.value = withTiming(1, { duration: 900, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    line.value = withDelay(500, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    tag.value = withDelay(750, withTiming(1, { duration: 700 }));
  }, [logo, line, tag]);

  // Navega uma única vez. `session` é um objeto novo a cada evento do
  // Supabase Auth (inclusive TOKEN_REFRESHED) — usá-lo como dependência
  // reagendava o timeout e repetia router.replace() enquanto a transição
  // de fade anterior ainda rodava, deixando a splash "colada" atrás da
  // tela seguinte (crossfade nunca termina).
  const navegou = useRef(false);
  const temSessao = !!session;

  useEffect(() => {
    if (loading || navegou.current) return;

    const t = setTimeout(() => {
      navegou.current = true;
      router.replace(temSessao ? "/(app)/home" : "/(auth)/welcome");
    }, HOLD_MS);

    return () => clearTimeout(t);
  }, [loading, temSessao, router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logo.value,
    transform: [{ scale: 0.88 + logo.value * 0.12 }]
  }));

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: line.value }] }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tag.value,
    transform: [{ translateY: (1 - tag.value) * 12 }]
  }));

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Animated.View style={logoStyle}>
          <Wordmark width={220} />
        </Animated.View>

        <View style={styles.rule}>
          <Animated.View style={[styles.ruleFill, lineStyle]} />
        </View>

        <Animated.Text style={[styles.tagline, tagStyle]}>
          O marketplace do entretenimento
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, tagStyle]}>
        <Text style={styles.footerText}>SOLLO BUSINESS</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.lg },
  rule: {
    width: 220,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden"
  },
  ruleFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.magenta,
    transformOrigin: "left",
    transform: [{ scaleX: 0 }]
  },
  tagline: { ...type.caption, color: colors.inkDim, letterSpacing: 0.4 },
  footer: { alignItems: "center", paddingBottom: space["3xl"] },
  footerText: { ...type.label, color: colors.inkFaint }
});
