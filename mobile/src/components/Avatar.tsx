import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, fonts } from "@/src/theme/tokens";

type Props = {
  url?: string | null;
  nome?: string | null;
  size?: number;
  /** Anel lime = disponível para vagas. É o estado que o mercado precisa ver primeiro. */
  disponivel?: boolean | null;
};

export function Avatar({ url, nome, size = 56, disponivel }: Props) {
  const iniciais = (nome ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const anel = disponivel === true ? colors.lime : disponivel === false ? colors.line : null;
  const borda = anel ? Math.max(2, size * 0.035) : 0;
  const interno = size - borda * 2;

  return (
    <View
      style={[
        styles.anel,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: borda,
          borderColor: anel ?? "transparent",
          padding: anel ? borda : 0
        }
      ]}
    >
      {url ? (
        <Image
          source={{ uri: url }}
          style={{ width: interno, height: interno, borderRadius: interno / 2 }}
          contentFit="cover"
          transition={220}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: interno, height: interno, borderRadius: interno / 2 }
          ]}
        >
          <Text style={[styles.iniciais, { fontSize: interno * 0.36 }]}>{iniciais || "?"}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  anel: { alignItems: "center", justifyContent: "center" },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line
  },
  iniciais: { fontFamily: fonts.bold, color: colors.inkDim, letterSpacing: 0.5 }
});
