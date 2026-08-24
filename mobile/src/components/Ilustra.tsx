import { StyleSheet, View, type ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/src/theme/tokens";

export const ILUSTRA = {
  sino: require("@/assets/ilustra/sino.png") as ImageSourcePropType,
  camera: require("@/assets/ilustra/camera.png") as ImageSourcePropType,
  cameraIso: require("@/assets/ilustra/camera-iso.png") as ImageSourcePropType,
  microfone: require("@/assets/ilustra/microfone.png") as ImageSourcePropType,
  check: require("@/assets/ilustra/check.png") as ImageSourcePropType,
  checkIso: require("@/assets/ilustra/check-iso.png") as ImageSourcePropType
};

type Props = {
  fonte: ImageSourcePropType;
  /** Diâmetro do disco de fundo. */
  tamanho: number;
  /** Cor do disco. Lima na abertura, magenta no sucesso. */
  tom?: string;
  /** Discos vazados que sangram para fora, como na referência. */
  satelites?: boolean;
};

/**
 * Objeto 3D sobre disco colorido, com discos vazados sangrando para fora.
 *
 * É a composição da tela de onboarding da referência: um círculo grande e
 * chapado servindo de palco, e círculos menores saindo do quadro para dar
 * profundidade sem foto nenhuma.
 *
 * As peças 3D vieram em SVG de 1 a 2 MB cada, mas eram PNG embutido em
 * base64 — só o invólucro era vetor. Foram extraídas e reduzidas a 512px:
 * os sete arquivos caíram de 10 MB para pouco mais de 500 KB, o que numa
 * tela de abertura é a diferença entre abrir na hora e piscar em branco.
 */
export function Ilustra({ fonte, tamanho, tom = colors.lime, satelites = true }: Props) {
  return (
    <View style={[styles.palco, { width: tamanho, height: tamanho }]}>
      {satelites && (
        <>
          <View
            style={[
              styles.satelite,
              {
                width: tamanho * 0.52,
                height: tamanho * 0.52,
                borderRadius: tamanho * 0.26,
                top: -tamanho * 0.14,
                right: -tamanho * 0.3
              }
            ]}
          />
          <View
            style={[
              styles.satelite,
              {
                width: tamanho * 0.34,
                height: tamanho * 0.34,
                borderRadius: tamanho * 0.17,
                bottom: tamanho * 0.02,
                right: -tamanho * 0.24
              }
            ]}
          />
        </>
      )}

      <View
        style={[
          styles.disco,
          { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: tom }
        ]}
      />

      {/* A peça vem com margem generosa no PNG; 116% cobre essa folga sem
          esbarrar na borda do disco. */}
      <Image
        source={fonte}
        style={{ width: tamanho * 1.16, height: tamanho * 1.16 }}
        contentFit="contain"
        transition={260}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  palco: { alignItems: "center", justifyContent: "center" },
  disco: { position: "absolute" },
  satelite: {
    position: "absolute",
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface2
  }
});
