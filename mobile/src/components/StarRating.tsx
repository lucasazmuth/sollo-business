import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, space, type } from "@/src/theme/tokens";

type Props = {
  valor: number;
  onChange?: (nota: number) => void;
  tamanho?: number;
  somenteLeitura?: boolean;
};

/** Cinco estrelas — toque para avaliar, ou só exibição quando somenteLeitura. */
export function StarRating({ valor, onChange, tamanho = 40, somenteLeitura }: Props) {
  return (
    <View style={styles.linha}>
      {[1, 2, 3, 4, 5].map((n) => {
        const preenchida = n <= valor;
        return (
          <Pressable
            key={n}
            disabled={somenteLeitura || !onChange}
            onPress={() => onChange?.(n)}
            hitSlop={6}
            accessibilityRole={onChange ? "button" : undefined}
            accessibilityLabel={`${n} de 5 estrelas`}
          >
            <Text
              style={[
                { fontSize: tamanho, lineHeight: tamanho * 1.05 },
                preenchida ? styles.cheia : styles.vazia
              ]}
            >
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: "row", gap: space.sm },
  cheia: { color: colors.lime },
  vazia: { color: colors.line }
});
