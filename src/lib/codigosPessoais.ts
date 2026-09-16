// Código pessoal de 4 caracteres. Como o código da equipe já veio antes,
// ele só precisa ser único dentro da equipe.

import type { Integrante } from "./tipos";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Sempre o mesmo código para o mesmo id: ninguém perde o código ao recarregar a página. */
function derivar(semente: string): string {
  let hash = 2166136261;
  for (let i = 0; i < semente.length; i += 1) {
    hash ^= semente.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  let saida = "";
  for (let i = 0; i < 4; i += 1) {
    saida += ALFABETO[hash % ALFABETO.length];
    hash = Math.floor(hash / ALFABETO.length) + 7919 * (i + 1);
  }
  return saida;
}

/** Códigos de todos os integrantes, já sem repetição dentro da equipe. */
export function codigosDaEquipe(integrantes: Integrante[]): Record<string, string> {
  const usados = new Set<string>();
  const saida: Record<string, string> = {};
  for (const integrante of integrantes) {
    let codigo = (integrante.codigo || derivar(integrante.id)).toUpperCase();
    let tentativa = 1;
    while (usados.has(codigo)) {
      codigo = derivar(`${integrante.id}-${tentativa}`);
      tentativa += 1;
    }
    usados.add(codigo);
    saida[integrante.id] = codigo;
  }
  return saida;
}

export function codigoDoIntegrante(integrantes: Integrante[], id: string): string {
  return codigosDaEquipe(integrantes)[id] ?? "";
}

export function acharPorCodigoPessoal(
  integrantes: Integrante[],
  digitado: string,
): Integrante | null {
  const alvo = digitado.trim().toUpperCase();
  const codigos = codigosDaEquipe(integrantes);
  return integrantes.find((i) => codigos[i.id] === alvo) ?? null;
}

/** Código novo, para quando o antigo circulou para quem não devia. */
export function novoCodigoPessoal(integrantes: Integrante[]): string {
  const usados = new Set(Object.values(codigosDaEquipe(integrantes)));
  for (let tentativa = 0; tentativa < 500; tentativa += 1) {
    let codigo = "";
    for (let i = 0; i < 4; i += 1) {
      codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
    }
    if (!usados.has(codigo)) return codigo;
  }
  return derivar(crypto.randomUUID());
}
