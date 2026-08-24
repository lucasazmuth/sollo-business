/**
 * Link externo do perfil.
 *
 * Quase ninguém digita "https://". As pessoas escrevem `instagram.com/fulano`,
 * `www.meusite.com.br` ou colam com espaço no fim — e um `Linking.openURL`
 * sem esquema simplesmente não abre nada, sem erro nenhum. Daí normalizar
 * na gravação e guardar sempre com esquema.
 */

/** Devolve a URL pronta para gravar, ou null se não der para salvar nada. */
export function normalizarUrl(bruto: string): string | null {
  const limpo = bruto.trim();
  if (!limpo) return null;

  // Sem esquema, assume https. http:// digitado à mão é respeitado: pode ser
  // um servidor interno que de fato não tem TLS.
  const comEsquema = /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`;

  try {
    const u = new URL(comEsquema);
    // Precisa ter ponto no host: "meusite" sozinho não resolve em lugar nenhum,
    // e o construtor aceita numa boa.
    if (!u.hostname.includes(".") || u.hostname.endsWith(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** true se o texto vira uma URL utilizável. Vazio conta como válido: o campo é opcional. */
export function urlValida(bruto: string): boolean {
  return !bruto.trim() || normalizarUrl(bruto) !== null;
}

/** Como mostrar na tela: sem esquema e sem barra final, que é ruído visual. */
export function urlLegivel(url: string): string {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}
