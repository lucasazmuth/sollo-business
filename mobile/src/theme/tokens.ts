/**
 * Tokens da marca Sollo — espelham as variáveis CSS da landing page
 * (cores extraídas do manual "SOLLO Branding").
 */

export const colors = {
  magenta: "#D81368",
  pink: "#EE53A9",
  lime: "#CEFE2A",
  black: "#000000",
  white: "#FFFFFF",
  concrete: "#D9D9D9",

  bg: "#000000",
  surface: "#0B0B0B",
  surface2: "#131313",

  ink: "#FFFFFF",
  inkDim: "rgba(255,255,255,0.62)",
  inkFaint: "rgba(255,255,255,0.34)",
  line: "rgba(255,255,255,0.16)",
  lineStrong: "rgba(255,255,255,0.28)",

  danger: "#FF5B5B"
} as const;

/** Escala de espaçamento em múltiplos de 4. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64
} as const;

export const radius = {
  md: 14,
  lg: 22,
  xl: 32,
  pill: 999
} as const;

/** Famílias carregadas em app/_layout.tsx. */
export const fonts = {
  regular: "Montserrat_400Regular",
  medium: "Montserrat_500Medium",
  semibold: "Montserrat_600SemiBold",
  bold: "Montserrat_700Bold",
  extrabold: "Montserrat_800ExtraBold"
} as const;

export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 40, lineHeight: 42, letterSpacing: -1.2 },
  h1: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 34, letterSpacing: -1 },
  h2: { fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 27, letterSpacing: -0.6 },
  h3: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 23, letterSpacing: -0.3 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 23 },
  label: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.8 },
  button: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 16, letterSpacing: 0.8 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 }
} as const;

/** Curvas equivalentes às usadas na web (--ease-out). */
export const easing = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.76, 0, 0.24, 1] as const
};
