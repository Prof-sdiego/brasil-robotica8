// Os três botões do controle: A, B e A+B.
// O controle não decide nada — ele só avisa qual botão foi apertado.
// Cada melhoria "de botão" ocupa um deles; o que sobrar vira coreografia.

import { MELHORIAS } from "./catalogo";
import type { Botao, Equipe } from "./tipos";

export const BOTOES: Botao[] = ["A", "B", "AB"];

export const NOME_BOTAO: Record<Botao, string> = {
  A: "Botão A",
  B: "Botão B",
  AB: "Botão A+B",
};

/** Melhorias que ocupam um botão. */
export const MELHORIAS_DE_BOTAO = ["turbo", "marcha_lenta"];

export const VALOR_COREOGRAFIA = "coreografia";

/** Quantas coreografias a equipe monta, conforme as melhorias de botão escolhidas. */
export function quantasCoreografias(melhorias: string[]): number {
  return 3 - MELHORIAS_DE_BOTAO.filter((id) => melhorias.includes(id)).length;
}

/**
 * Atribuição normalizada dos três botões.
 * Respeita o que a equipe arrumou e completa o resto com as coreografias.
 */
export function atribuicaoEfetiva(equipe: {
  melhorias: string[];
  atribuicaoBotoes: Partial<Record<Botao, string>>;
}): Record<Botao, string> {
  const escolhidas = MELHORIAS_DE_BOTAO.filter((id) => equipe.melhorias.includes(id));
  const saida: Record<Botao, string> = { A: "", B: "", AB: "" };
  const jaColocadas: string[] = [];

  for (const botao of BOTOES) {
    const valor = equipe.atribuicaoBotoes?.[botao];
    if (valor && escolhidas.includes(valor) && !jaColocadas.includes(valor)) {
      saida[botao] = valor;
      jaColocadas.push(valor);
    }
  }

  for (const melhoria of escolhidas) {
    if (jaColocadas.includes(melhoria)) continue;
    const livre = BOTOES.find((b) => saida[b] === "");
    if (!livre) break;
    saida[livre] = melhoria;
    jaColocadas.push(melhoria);
  }

  for (const botao of BOTOES) {
    if (saida[botao] === "") saida[botao] = VALOR_COREOGRAFIA;
  }
  return saida;
}

export type AcaoDoBotao = {
  botao: Botao;
  valor: string;
  titulo: string;
  descricao: string;
  icone: string;
  /** Número da coreografia (1, 2 ou 3), quando o botão é de coreografia. */
  numeroCoreografia: number | null;
};

/** O que cada botão faz nesta equipe — é isso que vira o manual dos botões. */
export function acoesDosBotoes(equipe: {
  melhorias: string[];
  atribuicaoBotoes: Partial<Record<Botao, string>>;
}): AcaoDoBotao[] {
  const atribuicao = atribuicaoEfetiva(equipe);
  let contador = 0;
  return BOTOES.map((botao) => {
    const valor = atribuicao[botao] ?? "";
    if (valor === VALOR_COREOGRAFIA) {
      contador += 1;
      return {
        botao,
        valor,
        titulo: `Coreografia ${contador}`,
        descricao: "A sequência que vocês montaram.",
        icone: "🪄",
        numeroCoreografia: contador,
      };
    }
    const melhoria = MELHORIAS.find((m) => m.id === valor);
    return {
      botao,
      valor,
      titulo: melhoria?.nome ?? "Sem uso",
      descricao: melhoria?.frase ?? "Este botão não foi usado por esta equipe.",
      icone: melhoria?.icone ?? "⬜",
      numeroCoreografia: null,
    };
  });
}

/** Botões que ficaram para coreografia, na ordem A, B, A+B. */
export function gatilhosDeCoreografia(equipe: {
  melhorias: string[];
  atribuicaoBotoes: Partial<Record<Botao, string>>;
}): Botao[] {
  const atribuicao = atribuicaoEfetiva(equipe);
  return BOTOES.filter((b) => atribuicao[b] === VALOR_COREOGRAFIA);
}

/** Rótulos curtos para os endereços dos painéis de pilotagem (ba, bb, bab). */
export function rotulosDosBotoes(equipe: Equipe): { ba: string; bb: string; bab: string } {
  const acoes = acoesDosBotoes(equipe);
  const pegar = (botao: Botao) => acoes.find((a) => a.botao === botao)?.titulo ?? "";
  return { ba: pegar("A"), bb: pegar("B"), bab: pegar("AB") };
}
