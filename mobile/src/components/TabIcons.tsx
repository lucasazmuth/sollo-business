import Svg, { Circle, Path } from "react-native-svg";

type Props = { color: string; size?: number };

/** Ícones de traço único da tab bar — mesma família visual do IconMark, sem lib externa. */

export function IconInicio({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1v-9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconVagas({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V8.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" stroke={color} strokeWidth={1.7} />
      <Path d="M4 12.5h16" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function IconConversas({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6.8A1.8 1.8 0 0 1 5.8 5h12.4A1.8 1.8 0 0 1 20 6.8v8.4a1.8 1.8 0 0 1-1.8 1.8H9l-4 3.2v-3.2H5.8A1.8 1.8 0 0 1 4 15.2V6.8Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconPerfil({ color, size = 22 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.3} r={3.3} stroke={color} strokeWidth={1.7} />
      <Path
        d="M5 20c.7-3.4 3.4-5.5 7-5.5s6.3 2.1 7 5.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* Ícones das pílulas da Home — mesma família de traço único. */

export function IconEnviado({ color, size = 20 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconEstrela({ color, size = 20 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m12 3.6 2.6 5.3 5.9.85-4.25 4.14 1 5.86L12 17l-5.25 2.76 1-5.86L3.5 9.75l5.9-.85L12 3.6Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMapa({ color, size = 20 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10} r={2.6} stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function IconMais({ color, size = 20 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}
