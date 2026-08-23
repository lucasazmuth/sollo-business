import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, radius, space, type } from "@/src/theme/tokens";
import { formatarDataHora } from "@/src/components/DataHoraInput";
import type { VagaDoFeed } from "@/src/api/feed";

type Props = {
  vaga: VagaDoFeed;
  onPress: () => void;
  /** Marca a vaga em que a pessoa já se candidatou. */
  jaAplicou?: boolean;
};

/** Quanto falta, em linguagem de gente. */
function quandoRelativo(iso: string) {
  const horas = (new Date(iso).getTime() - Date.now()) / 3_600_000;
  if (horas < 1) return "começa em menos de 1h";
  if (horas < 24) return `em ${Math.round(horas)}h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? "amanhã" : `em ${dias} dias`;
}

export function VagaCard({ vaga, onPress, jaAplicou }: Props) {
  const cache =
    vaga.pay_type === "valor" && vaga.pay_amount
      ? `R$ ${Number(vaga.pay_amount).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
      : "A combinar";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, vaga.is_urgent && styles.cardUrgente]}
      accessibilityRole="button"
      accessibilityLabel={`${vaga.titulo}, ${quandoRelativo(vaga.starts_at)}`}
    >
      {!!vaga.cover_url && (
        <Image source={{ uri: vaga.cover_url }} style={styles.capa} contentFit="cover" transition={180} />
      )}

      <View style={styles.corpo}>
        <View style={styles.selos}>
          {vaga.is_urgent && <Text style={styles.urgente}>URGENTE</Text>}
          <Text style={styles.quando}>{quandoRelativo(vaga.starts_at)}</Text>
          {jaAplicou && <Text style={styles.aplicou}>JÁ APLIQUEI</Text>}
        </View>

        <Text style={styles.titulo} numberOfLines={2}>
          {vaga.titulo}
        </Text>

        <Text style={styles.contratante} numberOfLines={1}>
          {vaga.hirer_nome ?? "Contratante"}
        </Text>

        <View style={styles.rodape}>
          {/* Distância primeiro: é o que decide se vale a pena. */}
          <Text style={styles.distancia}>
            {vaga.distancia_km !== null ? `${vaga.distancia_km} km` : "—"}
          </Text>
          <Text style={styles.separador}>·</Text>
          <Text style={styles.data}>{formatarDataHora(new Date(vaga.starts_at))}</Text>
          <View style={styles.espaco} />
          <Text style={[styles.cache, vaga.pay_type === "valor" && { color: colors.lime }]}>
            {cache}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  cardUrgente: { borderColor: "rgba(216,19,104,0.55)" },
  capa: { width: "100%", height: 132 },
  corpo: { padding: space.lg, gap: space.sm },

  selos: { flexDirection: "row", alignItems: "center", gap: space.md },
  urgente: { ...type.label, fontSize: 10, color: colors.magenta },
  quando: { ...type.label, fontSize: 10, color: colors.inkDim },
  aplicou: { ...type.label, fontSize: 10, color: colors.lime },

  titulo: { ...type.h3, color: colors.white },
  contratante: { ...type.caption, color: colors.inkDim },

  rodape: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.sm,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  distancia: { ...type.caption, color: colors.white, fontFamily: type.h3.fontFamily },
  separador: { ...type.caption, color: colors.inkFaint },
  data: { ...type.caption, color: colors.inkDim },
  espaco: { flex: 1 },
  cache: { ...type.caption, color: colors.inkDim }
});
