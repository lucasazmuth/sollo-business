import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { colors, radius, space, type } from "@/src/theme/tokens";

/**
 * Peças da Home no vocabulário visual da landing: cartão em gradiente
 * magenta, número gigante em contorno vazado e pílulas com ícone redondo.
 * São os mesmos três elementos das seções Serviços e Recursos do site,
 * traduzidos para o aparelho.
 */

/* ---------- Cartão principal, em gradiente ---------- */

type DestaqueProps = {
  eyebrow: string;
  valor: number | null;
  unidade: string;
  descricao: string;
  /** Selo em lima no canto — urgências, candidatos novos. */
  selo?: string | null;
  cta: string;
  onPress: () => void;
};

export function CardDestaque({
  eyebrow,
  valor,
  unidade,
  descricao,
  selo,
  cta,
  onPress
}: DestaqueProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={cta}>
      <LinearGradient
        // Mesmo ângulo e mesma parada de cor do .services__card da landing.
        colors={["#1A0210", "#8E0A45", colors.magenta]}
        locations={[0, 0.62, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.destaque}
      >
        <View style={styles.destaqueTopo}>
          <Text style={styles.destaqueEyebrow}>{eyebrow}</Text>
          {!!selo && (
            <View style={styles.selo}>
              <Text style={styles.seloTexto}>{selo}</Text>
            </View>
          )}
        </View>

        <View style={styles.destaqueNumeroLinha}>
          {valor === null ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.destaqueNumero}>{valor}</Text>
              <Text style={styles.destaqueUnidade}>{unidade}</Text>
            </>
          )}
        </View>

        <Text style={styles.destaqueDescricao}>{descricao}</Text>

        <View style={styles.destaqueCta}>
          <Text style={styles.destaqueCtaTexto}>{cta}</Text>
          <Seta />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/* ---------- Estatística com número vazado ---------- */

export function CardNumero({
  valor,
  rotulo,
  onPress
}: {
  valor: number | string | null;
  rotulo: string;
  onPress?: () => void;
}) {
  const conteudo = (
    <View style={styles.numeroCard}>
      {valor === null ? (
        <ActivityIndicator color={colors.magenta} style={styles.numeroCarregando} />
      ) : (
        <NumeroVazado valor={valor} />
      )}
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );

  if (!onPress) return conteudo;
  return (
    <Pressable onPress={onPress} style={styles.flex} accessibilityRole="button">
      {conteudo}
    </Pressable>
  );
}

/**
 * Número em contorno, como o `.services__card-n` da landing.
 *
 * Lá é `-webkit-text-stroke`, que o React Native não tem. Quatro cópias
 * deslocadas de 1px nos quatro sentidos desenham o traço, e a quinta, no
 * lugar certo e na cor do fundo, vaza o miolo. Duas cópias só (uma atrás,
 * uma na frente) dariam sombra, não contorno.
 */
function NumeroVazado({ valor }: { valor: number | string }) {
  const DESLOCAMENTOS = [
    { left: 0, top: 1 },
    { left: 2, top: 1 },
    { left: 1, top: 0 },
    { left: 1, top: 2 }
  ];

  return (
    <View style={styles.numeroWrap}>
      {DESLOCAMENTOS.map((d, i) => (
        <Text key={i} style={[styles.numeroVazado, styles.numeroTraco, d]}>
          {valor}
        </Text>
      ))}
      <Text style={[styles.numeroVazado, styles.numeroMiolo]}>{valor}</Text>
      {/* Invisível, só para o bloco ter a altura do número — os outros são
          todos absolutos. */}
      <Text style={[styles.numeroVazado, styles.numeroFantasma]}>{valor}</Text>
    </View>
  );
}

/* ---------- Pílula de ação ---------- */

export function Pilula({
  icone,
  label,
  detalhe,
  onPress
}: {
  icone: React.ReactNode;
  label: string;
  detalhe?: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.pilula} onPress={onPress} accessibilityRole="button">
      <View style={styles.pilulaIcone}>{icone}</View>
      <Text style={styles.pilulaLabel}>{label}</Text>
      {!!detalhe && (
        <View style={styles.pilulaBadge}>
          <Text style={styles.pilulaBadgeTexto}>{detalhe}</Text>
        </View>
      )}
      <Seta cor={colors.inkFaint} />
    </Pressable>
  );
}

function Seta({ cor = colors.white }: { cor?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke={cor}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  destaque: {
    padding: space.xl,
    borderRadius: radius.lg,
    gap: space.xs,
    overflow: "hidden"
  },
  destaqueTopo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  destaqueEyebrow: { ...type.label, color: "rgba(255,255,255,0.72)" },
  selo: {
    paddingHorizontal: space.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.lime
  },
  seloTexto: { ...type.label, fontSize: 9, color: colors.black },

  destaqueNumeroLinha: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm,
    minHeight: 62,
    marginTop: space.sm
  },
  destaqueNumero: { ...type.display, fontSize: 60, lineHeight: 62, color: colors.white },
  destaqueUnidade: { ...type.bodyMedium, color: "rgba(255,255,255,0.8)", paddingBottom: 10 },
  destaqueDescricao: { ...type.body, color: "rgba(255,255,255,0.78)" },

  destaqueCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.lg
  },
  destaqueCtaTexto: { ...type.button, color: colors.white },

  numeroCard: {
    flex: 1,
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  numeroCarregando: { alignSelf: "flex-start", height: 44 },
  numeroWrap: { alignSelf: "flex-start" },
  numeroVazado: { ...type.display, fontSize: 42, lineHeight: 44, position: "absolute" },
  numeroTraco: { color: "rgba(255,255,255,0.55)" },
  numeroMiolo: { left: 1, top: 1, color: colors.surface },
  numeroFantasma: { position: "relative", opacity: 0 },
  numeroRotulo: { ...type.label, fontSize: 9, color: colors.inkFaint },

  pilula: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    paddingRight: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line
  },
  pilulaIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    // Mesma tinta do .perk__icon da landing: rgba(216,19,104,0.16).
    backgroundColor: "rgba(216,19,104,0.16)"
  },
  pilulaLabel: { ...type.bodyMedium, color: colors.white, flex: 1 },
  pilulaBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.magenta
  },
  pilulaBadgeTexto: { ...type.label, fontSize: 9, color: colors.white }
});
