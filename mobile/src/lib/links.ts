/**
 * Endereços externos do produto, em um lugar só.
 *
 * As páginas jurídicas moram na landing (Next.js), não no app: são as
 * mesmas que a Apple e o Google leem na ficha da loja, e duplicar o texto
 * dentro do app garantiria as duas versões divergirem na primeira revisão.
 */
export const LINKS = {
  termos: "https://www.sollo.business/termos",
  privacidade: "https://www.sollo.business/privacidade",
  suporteEmail: "contato@sollo.business",
  suporteMailto: "mailto:contato@sollo.business?subject=Suporte%20Sollo%20Business"
} as const;
