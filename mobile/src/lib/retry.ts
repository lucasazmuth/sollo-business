/**
 * Retentativa para falhas transitórias de rede.
 *
 * O iOS derruba conexões keep-alive reaproveitadas e o fetch estoura
 * "The network connection was lost" (NSURLErrorNetworkConnectionLost).
 * Acontece em rede móvel oscilante — exatamente o cenário de quem usa
 * o app correndo entre uma montagem e outra. Sem isso, o usuário perde
 * o que digitou por causa de um erro que some sozinho na tentativa seguinte.
 */

const TRANSITORIOS = [
  "network connection was lost",
  "network request failed",
  "fetch failed",
  "timeout",
  "timed out",
  "connection reset",
  "software caused connection abort"
];

function ehTransitorio(erro: unknown): boolean {
  const msg = (erro instanceof Error ? erro.message : String(erro)).toLowerCase();
  return TRANSITORIOS.some((t) => msg.includes(t));
}

export async function comRetry<T>(
  operacao: () => Promise<T>,
  opcoes: { tentativas?: number; esperaMs?: number } = {}
): Promise<T> {
  const tentativas = opcoes.tentativas ?? 3;
  const espera = opcoes.esperaMs ?? 400;

  let ultimo: unknown;

  for (let i = 0; i < tentativas; i++) {
    try {
      return await operacao();
    } catch (erro) {
      ultimo = erro;

      // Erro de regra de negócio não melhora repetindo.
      if (!ehTransitorio(erro) || i === tentativas - 1) throw erro;

      await new Promise((r) => setTimeout(r, espera * (i + 1)));
    }
  }

  throw ultimo;
}
