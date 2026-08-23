import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useSession } from "@/src/lib/session";
import { contarNaoLidas } from "@/src/api/notifications";
import { colors } from "@/src/theme/tokens";

/** Sininho com contagem de não lidas, usado no topo das telas raiz de cada aba. */
export function NotificationBell() {
  const router = useRouter();
  const { session } = useSession();
  const [naoLidas, setNaoLidas] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const id = session?.user.id;
      if (!id) return;
      let vivo = true;
      contarNaoLidas(id)
        .then((n) => vivo && setNaoLidas(n))
        .catch(() => {});
      return () => {
        vivo = false;
      };
    }, [session?.user.id])
  );

  return (
    <Pressable
      onPress={() => router.push("/(app)/notificacoes")}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityLabel={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : "Notificações"}
      style={styles.botao}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3.5c-3.2 0-5.5 2.4-5.5 5.8v2.7c0 .7-.3 1.6-.8 2.3l-.9 1.2c-.6.8-.2 2 .8 2.2 3.2.7 8.6.7 11.8 0 1-.2 1.4-1.4.8-2.2l-.9-1.2c-.5-.7-.8-1.6-.8-2.3V9.3c0-3.4-2.3-5.8-5.5-5.8-1 0-1.9.2-2.7.6"
          stroke={colors.white}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9.7 20c.5.9 1.3 1.4 2.3 1.4s1.8-.5 2.3-1.4"
          stroke={colors.white}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {naoLidas > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>{naoLidas > 9 ? "9+" : naoLidas}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.magenta,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.bg
  },
  badgeTexto: { fontSize: 9, fontWeight: "700", color: colors.white }
});
