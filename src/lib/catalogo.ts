// Catálogos fixos da oficina. Nada aqui é gerado por IA em tempo de execução:
// são listas fechadas, escritas à mão, usadas pelas telas e pelo gerador de código.

import type { Papel } from "./tipos";

export const PAPEIS: { papel: Papel; vagas: number; descricao: string; icone: string }[] = [
  { papel: "Piloto", vagas: 1, descricao: "Controla o robô durante a batalha", icone: "🎮" },
  {
    papel: "Copiloto",
    vagas: 1,
    descricao: "Orienta o piloto e assume se ele precisar sair",
    icone: "🧭",
  },
  {
    papel: "Engenheiro",
    vagas: 1,
    descricao: "Responsável pela estrutura física do robô",
    icone: "🔧",
  },
  {
    papel: "Programador",
    vagas: 1,
    descricao: "Responsável pelo código e por este site",
    icone: "💻",
  },
  { papel: "Staff", vagas: 3, descricao: "Apoio geral da equipe (até 3 pessoas)", icone: "🙌" },
];

export const PAPEIS_OBRIGATORIOS: Papel[] = ["Piloto", "Copiloto", "Engenheiro", "Programador"];
export const MAXIMO_INTEGRANTES = 7;

export type Intensidade = "muito" | "pouco" | "nada";

export type Melhoria = {
  id: string;
  nome: string;
  icone: string;
  frase: string;
  batalha: Intensidade;
  demonstracao: Intensidade;
};

export const MELHORIAS: Melhoria[] = [
  {
    id: "farol",
    nome: "Farol de LED",
    icone: "💡",
    frase: "As 4 luzes da placa mudam de cor conforme o robô se move.",
    batalha: "pouco",
    demonstracao: "muito",
  },
  {
    id: "turbo",
    nome: "Turbo",
    icone: "🚀",
    frase: "Aperta B e o robô ganha 2 segundos de velocidade máxima.",
    batalha: "muito",
    demonstracao: "pouco",
  },
  {
    id: "marcha_lenta",
    nome: "Marcha Lenta",
    icone: "🐢",
    frase: "Aperta B e o robô anda na metade da velocidade, para manobras de precisão.",
    batalha: "muito",
    demonstracao: "muito",
  },
  {
    id: "som_abertura",
    nome: "Som de abertura",
    icone: "🎵",
    frase: "O robô toca uma melodia curta ao ser ligado.",
    batalha: "nada",
    demonstracao: "muito",
  },
  {
    id: "bipe_re",
    nome: "Bipe de ré",
    icone: "📢",
    frase: "Quando o robô anda para trás, apita repetidamente como um caminhão.",
    batalha: "nada",
    demonstracao: "muito",
  },
  {
    id: "contador_tempo",
    nome: "Contador de tempo",
    icone: "⏱️",
    frase: "O robô soma quanto tempo ficou em movimento; A+B no robô mostra o total.",
    batalha: "pouco",
    demonstracao: "muito",
  },
];

export const MELHORIAS_EXCLUSIVAS = ["turbo", "marcha_lenta"];
export const MAXIMO_MELHORIAS = 3;

export const MELODIAS: { id: string; nome: string; icone: string }[] = [
  { id: "fanfarra", nome: "Fanfarra", icone: "🎺" },
  { id: "alerta_combate", nome: "Alerta de combate", icone: "🚨" },
  { id: "robozinho", nome: "Robozinho", icone: "🤖" },
  { id: "descida_grave", nome: "Descida grave", icone: "🎻" },
  { id: "sirene", nome: "Sirene", icone: "🚓" },
];

export type Movimento = {
  id: string;
  nome: string;
  icone: string;
  params: { nome: string; min: number; max: number; padrao: number; unidade: string }[];
  /** Duração estimada em segundos, a partir dos parâmetros escolhidos. */
  duracao: (params: number[]) => number;
};

// Tempo estimado de uma volta completa do robô (GIRO360, em ms).
const GIRO360 = 1100;
const PAUSA = 0.07; // pausa curta que cada movimento deixa no final

const tempo = (nome = "Tempo", min = 200, max = 2000, padrao = 700) => ({
  nome,
  min,
  max,
  padrao,
  unidade: "ms",
});

export const MOVIMENTOS: Movimento[] = [
  {
    id: "frente",
    nome: "Andar para frente",
    icone: "⬆️",
    params: [tempo()],
    duracao: (p) => (p[0] ?? 0) / 1000 + PAUSA,
  },
  {
    id: "tras",
    nome: "Andar para trás",
    icone: "⬇️",
    params: [tempo()],
    duracao: (p) => (p[0] ?? 0) / 1000 + PAUSA,
  },
  {
    id: "girar_direita",
    nome: "Girar para a direita",
    icone: "↪️",
    params: [tempo("Tempo", 100, 2000, 400)],
    duracao: (p) => (p[0] ?? 0) / 1000 + PAUSA,
  },
  {
    id: "girar_esquerda",
    nome: "Girar para a esquerda",
    icone: "↩️",
    params: [tempo("Tempo", 100, 2000, 400)],
    duracao: (p) => (p[0] ?? 0) / 1000 + PAUSA,
  },
  {
    id: "parado",
    nome: "Ficar parado",
    icone: "🛑",
    params: [tempo("Tempo", 100, 2000, 500)],
    duracao: (p) => (p[0] ?? 0) / 1000,
  },
  {
    id: "curva_direita",
    nome: "Curva aberta à direita",
    icone: "↗️",
    params: [tempo()],
    duracao: (p) => (p[0] ?? 0) / 1000 + PAUSA,
  },
  {
    id: "curva_esquerda",
    nome: "Curva aberta à esquerda",
    icone: "↖️",
    params: [tempo()],
    duracao: (p) => (p[0] ?? 0) / 1000 + PAUSA,
  },
  {
    id: "estrela",
    nome: "Desenhar uma estrela",
    icone: "⭐",
    params: [{ nome: "Tamanho do lado", min: 300, max: 1200, padrao: 650, unidade: "ms" }],
    duracao: (p) => 5 * ((p[0] ?? 0) / 1000 + (GIRO360 * 144) / 360 / 1000 + 2 * PAUSA),
  },
  {
    id: "quadrado",
    nome: "Desenhar um quadrado",
    icone: "🔲",
    params: [{ nome: "Tamanho do lado", min: 300, max: 1200, padrao: 600, unidade: "ms" }],
    duracao: (p) => 4 * ((p[0] ?? 0) / 1000 + (GIRO360 * 90) / 360 / 1000 + 2 * PAUSA),
  },
  {
    id: "piao",
    nome: "Girar como pião",
    icone: "🌀",
    params: [{ nome: "Número de voltas", min: 1, max: 5, padrao: 2, unidade: "voltas" }],
    duracao: (p) => ((p[0] ?? 0) * GIRO360) / 1000 + PAUSA,
  },
  {
    id: "tremida",
    nome: "Tremida no lugar",
    icone: "〰️",
    params: [{ nome: "Número de vezes", min: 1, max: 8, padrao: 3, unidade: "vezes" }],
    duracao: (p) => (p[0] ?? 0) * 0.24 + PAUSA,
  },
  {
    id: "apitar",
    nome: "Apitar",
    icone: "🔔",
    params: [
      { nome: "Altura", min: 200, max: 1500, padrao: 880, unidade: "Hz" },
      { nome: "Tempo", min: 100, max: 600, padrao: 200, unidade: "ms" },
    ],
    duracao: (p) => (p[1] ?? 0) / 1000,
  },
];

export const ITENS_CHECKLIST: { id: string; texto: string }[] = [
  { id: "chassi", texto: "Chassi montado" },
  { id: "motores", texto: "Motores ligados na placa" },
  { id: "robotbit", texto: "Extensão robotbit instalada nos dois projetos" },
  { id: "codigo_instalado", texto: "Código instalado nos dois micro:bit" },
  { id: "anda_reto", texto: "Robô anda reto quando inclino o controle" },
  { id: "giro360", texto: "GIRO360 calibrado (o robô dá exatamente uma volta)" },
  { id: "melhorias", texto: "Melhorias escolhidas e justificadas" },
  { id: "coreografias", texto: "Coreografias montadas e testadas" },
  { id: "balao", texto: "Balão e suporte instalados" },
  { id: "ensaio", texto: "Ensaio feito com a turma" },
];

export const INSTRUCOES_INSTALACAO: string[] = [
  "Abra o site makecode.microbit.org em uma aba nova.",
  "Crie um projeto novo e dê o nome CONTROLE. Depois crie outro chamado ROBO.",
  "Nos dois projetos, clique em Extensões e instale a extensão robotbit.",
  "Clique no botão { } JavaScript no topo do editor.",
  "Apague tudo que estiver escrito e cole o código do CONTROLE no projeto CONTROLE.",
  "Ligue o micro:bit do controle no cabo USB e clique em Baixar.",
  "Repita: abra o projeto ROBO, cole o código do ROBÔ, ligue o micro:bit do robô e clique em Baixar.",
  "Ligue os dois micro:bit e teste: inclinando o controle, o robô deve andar.",
  "Se o robô não responder, confira se os dois códigos foram para os micro:bit certos.",
];
