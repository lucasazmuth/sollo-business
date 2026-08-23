import { useWindowDimensions } from "react-native";

/**
 * A partir daqui a tela deixa de ser um celular grande e vira desktop:
 * a navegação sai da barra inferior e vai para um rail lateral fixo, e o
 * conteúdo passa a ter largura máxima em vez de sangrar de ponta a ponta.
 *
 * 900 é onde o rail (260) mais uma coluna de conteúdo confortável (~640)
 * passam a caber lado a lado. Abaixo disso o celular continua mandando.
 */
export const LARGURA_DESKTOP = 900;

/** Largura do rail lateral. */
export const LARGURA_RAIL = 260;

/**
 * Teto de largura do conteúdo. Linha de texto acima de ~70 caracteres fica
 * cansativa de ler, e um botão de 1200px não parece clicável.
 */
export const LARGURA_CONTEUDO = 980;

export function useEhDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= LARGURA_DESKTOP;
}

/**
 * Grade de cards: quantas colunas cabem e que largura cada uma tem.
 *
 * A largura vem em pixels, não em `flexBasis: "33%"`: no flexbox do React
 * Native a base percentual é da largura interna INTEIRA, então três cartões
 * de 33% mais dois gaps estouram a linha e o terceiro cai sozinho embaixo.
 */
export function useGradeCards(gap: number, padding: number) {
  const { width } = useWindowDimensions();

  if (width < LARGURA_DESKTOP) return { colunas: 1, larguraCard: undefined };

  const util = Math.min(width - LARGURA_RAIL, LARGURA_CONTEUDO) - padding * 2;
  const colunas = util >= 860 ? 3 : 2;

  return { colunas, larguraCard: (util - gap * (colunas - 1)) / colunas };
}
