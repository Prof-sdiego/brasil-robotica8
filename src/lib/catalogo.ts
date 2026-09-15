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
  duracaoBase: number; // segundos, quando não depende de parâmetro
  params: { nome: string; min: number; max: number; padrao: number; unidade: string }[];
  /** Se informado, a duração vem deste parâmetro (em milissegundos). */
  paramDuracaoIndex?: number;
};

export const MOVIMENTOS: Movimento[] = [
  {
    id: "frente",
    nome: "Andar para frente",
    icone: "⬆️",
    duracaoBase: 1,
    params: [
      { nome: "Velocidade", min: 20, max: 100, padrao: 60, unidade: "%" },
      { nome: "Tempo", min: 200, max: 3000, padrao: 1000, unidade: "ms" },
    ],
    paramDuracaoIndex: 1,
  },
  {
    id: "tras",
    nome: "Andar para trás",
    icone: "⬇️",
    duracaoBase: 1,
    params: [
      { nome: "Velocidade", min: 20, max: 100, padrao: 60, unidade: "%" },
      { nome: "Tempo", min: 200, max: 3000, padrao: 1000, unidade: "ms" },
    ],
    paramDuracaoIndex: 1,
  },
  {
    id: "girar_esquerda",
    nome: "Girar à esquerda",
    icone: "↩️",
    duracaoBase: 0.8,
    params: [{ nome: "Graus", min: 15, max: 360, padrao: 90, unidade: "°" }],
  },
  {
    id: "girar_direita",
    nome: "Girar à direita",
    icone: "↪️",
    duracaoBase: 0.8,
    params: [{ nome: "Graus", min: 15, max: 360, padrao: 90, unidade: "°" }],
  },
  {
    id: "giro360",
    nome: "Giro completo (360°)",
    icone: "🌀",
    duracaoBase: 2,
    params: [{ nome: "Velocidade", min: 30, max: 100, padrao: 70, unidade: "%" }],
  },
  {
    id: "curva_esquerda",
    nome: "Curva para a esquerda",
    icone: "↖️",
    duracaoBase: 1,
    params: [
      { nome: "Velocidade", min: 20, max: 100, padrao: 50, unidade: "%" },
      { nome: "Tempo", min: 200, max: 3000, padrao: 800, unidade: "ms" },
    ],
    paramDuracaoIndex: 1,
  },
  {
    id: "curva_direita",
    nome: "Curva para a direita",
    icone: "↗️",
    duracaoBase: 1,
    params: [
      { nome: "Velocidade", min: 20, max: 100, padrao: 50, unidade: "%" },
      { nome: "Tempo", min: 200, max: 3000, padrao: 800, unidade: "ms" },
    ],
    paramDuracaoIndex: 1,
  },
  {
    id: "parar",
    nome: "Parar",
    icone: "🛑",
    duracaoBase: 0.5,
    params: [{ nome: "Pausa", min: 100, max: 3000, padrao: 500, unidade: "ms" }],
    paramDuracaoIndex: 0,
  },
  {
    id: "vibrar",
    nome: "Sacudir no lugar",
    icone: "〰️",
    duracaoBase: 1,
    params: [{ nome: "Repetições", min: 1, max: 8, padrao: 3, unidade: "x" }],
  },
  {
    id: "mostrar_icone",
    nome: "Mostrar ícone no display",
    icone: "😃",
    duracaoBase: 0.6,
    params: [{ nome: "Ícone", min: 1, max: 6, padrao: 1, unidade: "nº" }],
  },
  {
    id: "tocar_nota",
    nome: "Tocar uma nota",
    icone: "🎶",
    duracaoBase: 0.5,
    params: [
      { nome: "Nota", min: 1, max: 8, padrao: 3, unidade: "nº" },
      { nome: "Tempo", min: 100, max: 1500, padrao: 400, unidade: "ms" },
    ],
    paramDuracaoIndex: 1,
  },
  {
    id: "acender_leds",
    nome: "Acender as luzes",
    icone: "🔴",
    duracaoBase: 0.6,
    params: [
      { nome: "Cor", min: 1, max: 6, padrao: 1, unidade: "nº" },
      { nome: "Tempo", min: 100, max: 2000, padrao: 600, unidade: "ms" },
    ],
    paramDuracaoIndex: 1,
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
