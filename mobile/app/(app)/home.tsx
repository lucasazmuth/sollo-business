import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { Button } from "@/src/components/Button";
import { IconMark } from "@/src/components/Logo";
import { useSession } from "@/src/lib/session";
import { colors, radius, space, type } from "@/src/theme/tokens";

/**
 * Placeholder da área logada — só confirma que o fluxo de auth fechou.
 * As telas do produto (feed, chat, projetos) entram aqui.
 */
export default function Home() {
  const { profile, signOut } = useSession();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <IconMark width={46} color={colors.magenta} />
        <Text style={styles.eyebrow}>
          {profile?.tipo === "contratante" ? "CONTRATANTE" : "PROFISSIONAL"}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Olá,{"\n"}{profile?.nome ?? "por aí"}.</Text>
        <Text style={styles.lead}>
          Sua conta está pronta. As próximas telas (perfil, anúncios, chat e orçamentos) entram a
          partir daqui.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PRÓXIMOS PASSOS</Text>
          {["Completar o perfil", "Explorar vagas abertas", "Configurar notificações"].map(
            (item) => (
              <View style={styles.row} key={item}>
                <View style={styles.dot} />
                <Text style={styles.rowText}>{item}</Text>
              </View>
            )
          )}
        </View>
      </View>

      <View style={styles.rodape}>
        {profile?.tipo === "contratante" ? (
          <>
            <Button label="Publicar vaga" onPress={() => router.push("/(app)/vaga/nova")} />
            <Button
              label="Minhas vagas"
              variant="ghost"
              onPress={() => router.push("/(app)/vagas")}
            />
          </>
        ) : null}
        {profile?.tipo === "profissional" ? (
          <>
            <Button label="Ver vagas perto de mim" onPress={() => router.push("/(app)/feed")} />
            <Button
              label="Minhas candidaturas"
              variant="ghost"
              onPress={() => router.push("/(app)/candidaturas")}
            />
          </>
        ) : null}
        <Button
          label="Conversas"
          variant="ghost"
          onPress={() => router.push("/(app)/conversas")}
        />
        <Button
          label="Avaliações"
          variant="ghost"
          onPress={() => router.push("/(app)/avaliacoes")}
        />
        <Button
          label="Notificações"
          variant="ghost"
          onPress={() => router.push("/(app)/notificacoes")}
        />
        <Button
          label="Meu perfil"
          variant="ghost"
          onPress={() => router.push("/(app)/perfil")}
        />
        <Button
          label="Sair da conta"
          variant="ghost"
          onPress={async () => {
            await signOut();
            router.replace("/(auth)/welcome");
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: space.lg
  },
  eyebrow: { ...type.label, color: colors.inkDim },
  center: { gap: space.lg, paddingVertical: space["2xl"] },
  title: { ...type.display, color: colors.white },
  lead: { ...type.body, color: colors.inkDim },
  card: {
    marginTop: space.lg,
    padding: space.xl,
    gap: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  cardLabel: { ...type.label, color: colors.inkFaint, marginBottom: space.xs },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.magenta },
  rowText: { ...type.bodyMedium, color: colors.ink },
  rodape: { gap: space.md }
});
