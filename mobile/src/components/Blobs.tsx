import { StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { colors } from "@/src/theme/tokens";

/**
 * Esferas em gradiente ao fundo — a assinatura visual da Hero da landing
 * (`.blob--1/2/3`), que é também o que ocupa o lugar das fotos nas seções
 * Conecte-se e Comunidades.
 *
 * Duas diferenças em relação à web, ambas por causa da tela pequena:
 *
 * 1. Na web são círculos com `filter: blur(3px)`. Aqui a última parada de
 *    cada gradiente vai a alpha 0, o que dissolve a borda sozinho — mesmo
 *    resultado sem depender de filtro SVG, cujo suporte varia entre
 *    plataformas em React Native.
 * 2. Vai um véu escuro por cima, como o da Hero. Num monitor as esferas
 *    ficam longe do texto; em 390pt de largura elas passam por baixo do
 *    título inteiro, e sem o véu o texto branco desaparece dentro do
 *    magenta.
 *
 * Decorativo e não interativo: vive atrás do conteúdo com
 * `pointerEvents="none"`, então nunca rouba toque de botão nenhum.
 */
export function Blobs({ intensidade = 0.75 }: { intensidade?: number }) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={width} height={height} style={{ opacity: intensidade }}>
        <Defs>
          <RadialGradient id="b1" cx="32%" cy="28%" r="70%">
            <Stop offset="0" stopColor={colors.pink} stopOpacity={0.9} />
            <Stop offset="0.5" stopColor={colors.magenta} stopOpacity={0.6} />
            <Stop offset="1" stopColor="#7A0335" stopOpacity={0} />
          </RadialGradient>

          <RadialGradient id="b2" cx="40%" cy="34%" r="70%">
            <Stop offset="0" stopColor="#FF86C8" stopOpacity={0.7} />
            <Stop offset="0.5" stopColor={colors.magenta} stopOpacity={0.45} />
            <Stop offset="1" stopColor="#5D0128" stopOpacity={0} />
          </RadialGradient>

          <RadialGradient id="b3" cx="36%" cy="30%" r="70%">
            <Stop offset="0" stopColor={colors.lime} stopOpacity={0.85} />
            <Stop offset="0.55" stopColor="#7FAE00" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#7FAE00" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Os centros ficam FORA da tela: só a franja de cada esfera entra,
            deixando o miolo do quadro livre para o texto. */}
        <Circle cx={width * 1.16} cy={height * -0.04} r={width * 0.72} fill="url(#b1)" />
        <Circle cx={width * -0.2} cy={height * 1.02} r={width * 0.6} fill="url(#b2)" />
        <Circle cx={width * 1.04} cy={height * 0.3} r={width * 0.13} fill="url(#b3)" />
      </Svg>

      {/* Véu: escurece topo e base, onde moram logo, título e botões, e
          quase some no meio, onde as esferas podem aparecer. */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.82)",
          "rgba(0,0,0,0.45)",
          "rgba(0,0,0,0.55)",
          "rgba(0,0,0,0.92)"
        ]}
        locations={[0, 0.3, 0.62, 1]}
        style={styles.veu}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  veu: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }
});
