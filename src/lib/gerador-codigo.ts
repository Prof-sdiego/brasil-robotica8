// =====================================================================
// MONTAGEM DO CÓDIGO — 100% DETERMINÍSTICA
// ---------------------------------------------------------------------
// Nada aqui é gerado por IA em tempo de execução. A montagem apenas:
//   1. escolhe os trechos de texto fixos correspondentes às escolhas da equipe
//   2. junta os trechos na ordem definida em ORDEM_MODULOS
//   3. substitui os marcadores {{NOME}} dos modelos pelos textos resultantes
//
// COMO PREENCHER DEPOIS (é aqui que entram os textos que você vai enviar):
//   - MODELO_CONTROLE / MODELO_ROBO: cole o código base, com os marcadores.
//   - MARCADORES: liste os nomes dos marcadores usados nos modelos.
//   - TRECHOS_MELHORIAS: para cada melhoria, o texto exato que ela insere
//     em cada marcador (do controle e do robô).
//   - LINHAS_MOVIMENTOS: a linha de código que cada movimento gera.
// Nenhuma tela precisa ser alterada quando esses textos mudarem.
// =====================================================================

import { MOVIMENTOS } from "./catalogo";
import type { Coreografia, Equipe, MovimentoNaSequencia } from "./tipos";

/** Nomes dos marcadores aceitos nos modelos. */
export const MARCADORES = [
  "GRUPO_RADIO",
  "SENSIBILIDADE",
  "NOME_EQUIPE",
  "TURMA",
  "VARIAVEIS",
  "AO_INICIAR",
  "BOTOES",
  "LOOP_PRINCIPAL",
  "FUNCOES",
  "COREOGRAFIA_A",
  "COREOGRAFIA_B",
  "COREOGRAFIA_AB",
  "MELODIA_ABERTURA",
] as const;

export type Marcador = (typeof MARCADORES)[number];

/** Ordem de encaixe quando mais de um módulo escreve no mesmo marcador. */
export const ORDEM_MODULOS: string[] = [
  "som_abertura",
  "farol",
  "placar",
  "turbo",
  "marcha_lenta",
  "antibloqueio",
];

type TrechosPorMarcador = Partial<Record<Marcador, string>>;

/** Texto que cada melhoria insere em cada marcador (controle e robô). */
export const TRECHOS_MELHORIAS: Record<
  string,
  { controle?: TrechosPorMarcador; robo?: TrechosPorMarcador }
> = {
  turbo: {},
  marcha_lenta: {},
  som_abertura: {},
  farol: {},
  antibloqueio: {},
  placar: {},
};

/** Linha de código que cada movimento de coreografia gera. */
export const LINHAS_MOVIMENTOS: Record<string, (params: number[]) => string> = {};

/** Trecho da melodia de abertura escolhida. */
export const TRECHOS_MELODIAS: Record<string, string> = {};

// ---------------------------------------------------------------------
// Modelos base. Substitua pelo código real quando ele chegar.
// ---------------------------------------------------------------------

export const MODELO_CONTROLE = `// CONTROLE — Equipe {{NOME_EQUIPE}} ({{TURMA}})
// Grupo de radio: {{GRUPO_RADIO}}  |  Sensibilidade: {{SENSIBILIDADE}}
radio.setGroup({{GRUPO_RADIO}})
{{VARIAVEIS}}
{{AO_INICIAR}}
{{BOTOES}}
basic.forever(function () {
{{LOOP_PRINCIPAL}}
})
{{FUNCOES}}
`;

export const MODELO_ROBO = `// ROBO — Equipe {{NOME_EQUIPE}} ({{TURMA}})
// Grupo de radio: {{GRUPO_RADIO}}
radio.setGroup({{GRUPO_RADIO}})
{{VARIAVEIS}}
{{AO_INICIAR}}
{{MELODIA_ABERTURA}}
function coreografiaA() {
{{COREOGRAFIA_A}}
}
function coreografiaB() {
{{COREOGRAFIA_B}}
}
function coreografiaAB() {
{{COREOGRAFIA_AB}}
}
{{FUNCOES}}
`;

// ---------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------

function identar(linhas: string[], espacos = 4): string {
  const prefixo = " ".repeat(espacos);
  return linhas.map((linha) => prefixo + linha).join("\n");
}

/** Converte uma sequência de movimentos em linhas de código, na ordem montada. */
export function montarSequencia(movimentos: MovimentoNaSequencia[]): string {
  const linhas = movimentos.map((item) => {
    const gerar = LINHAS_MOVIMENTOS[item.movimentoId];
    if (gerar) return gerar(item.params);
    const movimento = MOVIMENTOS.find((m) => m.id === item.movimentoId);
    const nome = movimento ? movimento.nome : item.movimentoId;
    const args = item.params.join(", ");
    return `// ${nome}(${args})`;
  });
  return identar(linhas);
}

function juntarTrechos(
  melhorias: string[],
  lado: "controle" | "robo",
  marcador: Marcador,
): string {
  const escolhidasEmOrdem = ORDEM_MODULOS.filter((id) => melhorias.includes(id));
  const trechos = escolhidasEmOrdem
    .map((id) => TRECHOS_MELHORIAS[id]?.[lado]?.[marcador])
    .filter((trecho): trecho is string => Boolean(trecho && trecho.trim()));
  return trechos.join("\n");
}

function aplicarMarcadores(modelo: string, valores: Partial<Record<Marcador, string>>): string {
  return modelo.replace(/\{\{([A-Z_0-9]+)\}\}/g, (_original, nome: string) => {
    const valor = valores[nome as Marcador];
    return valor === undefined ? "" : valor;
  });
}

function coreografiaPorGatilho(coreografias: Coreografia[], gatilho: Coreografia["gatilho"]) {
  const encontrada = coreografias.find((c) => c.gatilho === gatilho);
  return encontrada ? montarSequencia(encontrada.movimentos) : "";
}

export type CodigoGerado = { controle: string; robo: string };

/** Monta os dois códigos da equipe colando trechos fixos nos marcadores. */
export function montarCodigo(equipe: Equipe): CodigoGerado {
  const base: Partial<Record<Marcador, string>> = {
    GRUPO_RADIO: String(equipe.grupoRadio),
    SENSIBILIDADE: String(equipe.sensibilidade),
    NOME_EQUIPE: equipe.nomeEquipe,
    TURMA: equipe.turma,
  };

  const marcadoresDinamicos: Marcador[] = [
    "VARIAVEIS",
    "AO_INICIAR",
    "BOTOES",
    "LOOP_PRINCIPAL",
    "FUNCOES",
  ];

  const controle: Partial<Record<Marcador, string>> = { ...base };
  const robo: Partial<Record<Marcador, string>> = { ...base };

  for (const marcador of marcadoresDinamicos) {
    controle[marcador] = juntarTrechos(equipe.melhorias, "controle", marcador);
    robo[marcador] = juntarTrechos(equipe.melhorias, "robo", marcador);
  }

  robo.COREOGRAFIA_A = coreografiaPorGatilho(equipe.coreografias, "A");
  robo.COREOGRAFIA_B = coreografiaPorGatilho(equipe.coreografias, "B");
  robo.COREOGRAFIA_AB = coreografiaPorGatilho(equipe.coreografias, "AB");

  const melodia = equipe.melhorias.includes("som_abertura") ? equipe.melodiaAbertura : null;
  robo.MELODIA_ABERTURA = melodia
    ? (TRECHOS_MELODIAS[melodia] ?? `// melodia de abertura: ${melodia}`)
    : "";

  return {
    controle: aplicarMarcadores(MODELO_CONTROLE, controle),
    robo: aplicarMarcadores(MODELO_ROBO, robo),
  };
}

/** Duração estimada de uma coreografia, em segundos. */
export function duracaoEstimada(movimentos: MovimentoNaSequencia[]): number {
  let total = 0;
  for (const item of movimentos) {
    const movimento = MOVIMENTOS.find((m) => m.id === item.movimentoId);
    if (!movimento) continue;
    if (movimento.paramDuracaoIndex !== undefined) {
      const ms = item.params[movimento.paramDuracaoIndex] ?? 0;
      total += ms / 1000;
    } else {
      total += movimento.duracaoBase;
    }
  }
  return Math.round(total * 10) / 10;
}
