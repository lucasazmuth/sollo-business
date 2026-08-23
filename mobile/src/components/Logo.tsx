import Svg, { Path } from "react-native-svg";
import { colors } from "@/src/theme/tokens";
import { ICON_PATHS, ICON_VIEWBOX, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/src/theme/logo";

type Props = {
  width: number;
  color?: string;
  opacity?: number;
};

/** Logotipo completo "sollo". Proporção original 1172 × 311. */
export function Wordmark({ width, color = colors.white, opacity = 1 }: Props) {
  return (
    <Svg
      width={width}
      height={(width * 311) / 1172}
      viewBox={WORDMARK_VIEWBOX}
      opacity={opacity}
      accessibilityRole="image"
      accessibilityLabel="Sollo Business"
    >
      {WORDMARK_PATHS.map((d, i) => (
        <Path key={i} d={d} fill={color} fillRule="evenodd" />
      ))}
    </Svg>
  );
}

/** Símbolo isolado. Proporção original 443 × 311. */
export function IconMark({ width, color = colors.white, opacity = 1 }: Props) {
  return (
    <Svg width={width} height={(width * 311) / 443} viewBox={ICON_VIEWBOX} opacity={opacity}>
      {ICON_PATHS.map((d, i) => (
        <Path key={i} d={d} fill={color} fillRule="evenodd" />
      ))}
    </Svg>
  );
}
