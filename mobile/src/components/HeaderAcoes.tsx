import { StyleSheet, View } from "react-native";
import { space } from "@/src/theme/tokens";

/** Agrupa mais de uma ação no canto direito do header (`right` do `Screen`). */
export function HeaderAcoes({ children }: { children: React.ReactNode }) {
  return <View style={styles.linha}>{children}</View>;
}

const styles = StyleSheet.create({
  linha: { flexDirection: "row", alignItems: "center", gap: space.sm }
});
