import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Avatar } from "@/src/components/Avatar";
import { IconMark } from "@/src/components/Logo";
import { IconConversas, IconEstrela, IconInicio, IconPerfil, IconVagas } from "@/src/components/TabIcons";
import { useSession } from "@/src/lib/session";
import { LARGURA_RAIL } from "@/src/lib/layout";
import { colors, radius, space, type } from "@/src/theme/tokens";

type Item = {
  rota: string;
  label: string;
  Icone: (p: { color: string; size?: number }) => React.ReactElement;
};

const ABAS: Item[] = [
  { rota: "/(app)/(tabs)/home", label: "Início", Icone: IconInicio },
  { rota: "/(app)/(tabs)/vagas", label: "Vagas", Icone: IconVagas },
  { rota: "/(app)/(tabs)/conversas", label: "Conversas", Icone: IconConversas },
  { rota: "/(app)/(tabs)/perfil", label: "Perfil", Icone: IconPerfil }
];

/**
 * Navegação lateral fixa, usada no lugar da tab bar em tela larga.
 *
 * Uma barra de quatro abas coladas embaixo faz sentido no polegar; num
 * monitor de 1440px ela vira uma faixa perdida a meio metro do conteúdo.
 * O rail resolve isso e ainda ganha espaço para o que não cabia no
 * celular: quem está logado, e os atalhos que hoje moram dentro do Perfil.
 *
 * Não usa os props de tab bar do react-navigation de propósito: fica fora
 * do `<Tabs>`, e navega por rota com o router do expo-router. Assim a
 * mesma peça serve para qualquer tela, inclusive as que não são aba.
 */
export function SideRail() {
  const router = useRouter();
  const caminho = usePathname();
  const { profile } = useSession();

  const ehContratante = profile?.tipo === "contratante";
  const primeiroNome = (profile?.nome ?? "").trim().split(" ")[0];

  return (
    <View style={styles.rail}>
      {/* Símbolo isolado, não o logotipo inteiro: numa coluna de 260px a
          palavra "sollo" precisa encolher tanto que perde peso e briga com
          os itens do menu logo abaixo. */}
      <View style={styles.topo}>
        <IconMark width={38} />
      </View>

      <Pressable
        style={styles.identidade}
        onPress={() => router.push("/(app)/(tabs)/perfil")}
        accessibilityRole="button"
        accessibilityLabel="Abrir meu perfil"
      >
        <Avatar url={profile?.avatar_url} nome={profile?.nome} size={64} />
        <View style={styles.identidadeTexto}>
          <Text style={styles.ola}>
            Olá, <Text style={styles.olaNome}>{primeiroNome || "por aí"}</Text>
          </Text>
          <Text style={styles.papel}>{ehContratante ? "Contratante" : "Profissional"}</Text>
        </View>
      </Pressable>

      <View style={styles.lista}>
        {ABAS.map(({ rota, label, Icone }) => {
          // `usePathname` devolve a rota já resolvida ("/vagas"), sem os
          // grupos entre parênteses — daí comparar pelo fim do caminho.
          const alvo = rota.split("/").pop()!;
          const ativo = caminho === `/${alvo}` || (alvo === "home" && caminho === "/");

          return (
            <Pressable
              key={rota}
              onPress={() => router.push(rota as never)}
              accessibilityRole="link"
              accessibilityState={{ selected: ativo }}
              style={[styles.item, ativo && styles.itemAtivo]}
            >
              <Icone color={ativo ? colors.white : colors.inkFaint} size={20} />
              <Text style={[styles.itemTexto, ativo && styles.itemTextoAtivo]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.rodape}>
        <Pressable
          style={styles.item}
          onPress={() =>
            router.push(ehContratante ? "/(app)/vaga/nova" : "/(app)/candidaturas")
          }
        >
          <IconVagas color={colors.inkFaint} size={20} />
          <Text style={styles.itemTexto}>
            {ehContratante ? "Publicar vaga" : "Minhas candidaturas"}
          </Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push("/(app)/avaliacoes")}>
          <IconEstrela color={colors.inkFaint} size={20} />
          <Text style={styles.itemTexto}>Avaliações</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: LARGURA_RAIL,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    backgroundColor: colors.bg
  },
  topo: { paddingLeft: space.md, paddingBottom: space["2xl"] },

  identidade: { flexDirection: "row", alignItems: "center", gap: space.md, paddingLeft: space.md },
  identidadeTexto: { flex: 1, gap: 2 },
  ola: { ...type.bodyMedium, color: colors.inkDim },
  olaNome: { color: colors.white, fontFamily: type.h3.fontFamily },
  papel: { ...type.label, fontSize: 9, color: colors.inkFaint },

  lista: { gap: space.xs, marginTop: space["2xl"] },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    height: 46,
    paddingHorizontal: space.md,
    borderRadius: radius.md
  },
  itemAtivo: { backgroundColor: colors.surface2 },
  itemTexto: { ...type.bodyMedium, color: colors.inkFaint },
  itemTextoAtivo: { color: colors.white, fontFamily: type.h3.fontFamily },

  rodape: {
    marginTop: "auto",
    gap: space.xs,
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line
  }
});
