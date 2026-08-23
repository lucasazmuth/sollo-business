import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { NotificationBell } from "@/src/components/NotificationBell";
import { useSession } from "@/src/lib/session";
import { minhasVagas } from "@/src/api/jobs";
import { idsDasVagasQueAplicei } from "@/src/api/applications";
import { colors, radius, space, type } from "@/src/theme/tokens";

/** Início: resumo rápido por tipo de conta. Navegação principal vive na tab bar. */
export default function Home() {
  const { profile, session } = useSession();
  const router = useRouter();
  const ehContratante = profile?.tipo === "contratante";

  const [vagasAtivas, setVagasAtivas] = useState<number | null>(null);
  const [candidaturas, setCandidaturas] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const id = session?.user.id;
      if (!id) return;
      let vivo = true;

      if (ehContratante) {
        minhasVagas(id)
          .then((v) => vivo && setVagasAtivas(v.filter((x) => x.status === "aberta").length))
          .catch(() => {});
      } else {
        idsDasVagasQueAplicei(id)
          .then((ids) => vivo && setCandidaturas(ids.size))
          .catch(() => {});
      }

      return () => {
        vivo = false;
      };
    }, [session?.user.id, ehContratante])
  );

  return (
    <Screen right={<NotificationBell />}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {ehContratante ? "CONTRATANTE" : "PROFISSIONAL"}
        </Text>
        <Text style={styles.title}>Olá,{"\n"}{profile?.nome ?? "por aí"}.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{ehContratante ? "VAGAS ABERTAS" : "MINHAS CANDIDATURAS"}</Text>
        <View style={styles.cardValorLinha}>
          {(ehContratante ? vagasAtivas : candidaturas) === null ? (
            <ActivityIndicator color={colors.magenta} />
          ) : (
            <Text style={styles.cardValor}>{ehContratante ? vagasAtivas : candidaturas}</Text>
          )}
        </View>
      </View>

      <View style={styles.acoes}>
        {ehContratante ? (
          <Button label="Publicar vaga" onPress={() => router.push("/(app)/vaga/nova")} />
        ) : (
          <Button label="Minhas candidaturas" onPress={() => router.push("/(app)/candidaturas")} />
        )}
        <Button
          label="Avaliações"
          variant="ghost"
          onPress={() => router.push("/(app)/avaliacoes")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.lg },
  eyebrow: { ...type.label, color: colors.inkDim },
  title: { ...type.display, color: colors.white, marginTop: space.sm },

  card: {
    marginTop: space["2xl"],
    padding: space.xl,
    gap: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardLabel: { ...type.label, color: colors.inkFaint },
  cardValorLinha: { minHeight: 40, justifyContent: "center" },
  cardValor: { ...type.display, color: colors.white },

  acoes: { gap: space.md, marginTop: space["2xl"] }
});
