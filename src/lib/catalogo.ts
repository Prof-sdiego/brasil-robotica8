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

export type Intensidade = "muito" | "medio" | "pouco" | "nada";

export type Melhoria = {
  id: string;
  nome: string;
  icone: string;
  frase: string;
  batalha: Intensidade;
  demonstracao: Intensidade;
  /** Melhorias de botão ocupam um dos três botões: A, B ou A+B. */
  ocupaBotao?: boolean;
  aviso?: string;
};

export const MELHORIAS: Melhoria[] = [
  {
    id: "turbo",
    nome: "Turbo",
    icone: "🚀",
    frase:
      "Aperta o botão e o robô ganha alguns segundos de velocidade máxima. Depois precisa recarregar.",
    batalha: "muito",
    demonstracao: "pouco",
    ocupaBotao: true,
  },
  {
    id: "marcha_lenta",
    nome: "Marcha Lenta",
    icone: "🐢",
    frase:
      "Passa para velocidade reduzida, para manobrar com precisão perto do balão. Aperta de novo e volta ao normal.",
    batalha: "muito",
    demonstracao: "medio",
    ocupaBotao: true,
  },
  {
    id: "empinada",
    nome: "Empinada",
    icone: "🛹",
    frase: "Ré curta e arranque seco. A ré joga o peso para trás e o robô levanta a frente.",
    batalha: "pouco",
    demonstracao: "muito",
    ocupaBotao: true,
    aviso:
      "Para empinar, precisa de peso atrás do eixo traseiro. Peso em cima das rodas não adianta.",
  },
  {
    id: "contra_ataque",
    nome: "Contra-ataque automático",
    icone: "💥",
    frase:
      "O robô sente quando leva uma batida e reage sozinho: recua e gira, tirando o balão da linha de frente.",
    batalha: "muito",
    demonstracao: "medio",
  },
  {
    id: "arranque_suave",
    nome: "Arranque suave",
    icone: "🎚️",
    frase:
      "Em vez de sair de uma vez na velocidade máxima, acelera aos poucos. Acaba o coice da largada.",
    batalha: "muito",
    demonstracao: "pouco",
  },
  {
    id: "som_abertura",
    nome: "Som de abertura",
    icone: "🎵",
    frase: "Uma melodia curta quando o robô liga.",
    batalha: "nada",
    demonstracao: "muito",
  },
  {
    id: "bipe_re",
    nome: "Bipe de ré",
    icone: "📢",
    frase: "Apita como caminhão quando anda para trás.",
    batalha: "nada",
    demonstracao: "medio",
  },
];

export const MAXIMO_MELHORIAS = 3;

/** Melhorias que saíram do catálogo: se a equipe tinha uma delas, precisa escolher de novo. */
export const MELHORIAS_REMOVIDAS = ["farol", "contador_tempo"];

/** notas = pares [altura em Hz, duração em ms], só para ouvir aqui no site. */
export const MELODIAS: { id: string; nome: string; icone: string; notas: [number, number][] }[] = [
  {
    id: "fanfarra",
    nome: "Fanfarra",
    icone: "🎺",
    notas: [
      [523, 140],
      [659, 140],
      [784, 140],
      [1047, 320],
    ],
  },
  {
    id: "alerta_combate",
    nome: "Alerta de combate",
    icone: "🚨",
    notas: [
      [880, 160],
      [587, 160],
      [880, 160],
      [587, 260],
    ],
  },
  {
    id: "robozinho",
    nome: "Robozinho",
    icone: "🤖",
    notas: [
      [392, 90],
      [523, 90],
      [659, 90],
      [523, 90],
      [784, 200],
    ],
  },
  {
    id: "descida_grave",
    nome: "Descida grave",
    icone: "🎻",
    notas: [
      [440, 150],
      [349, 150],
      [294, 150],
      [220, 350],
    ],
  },
  {
    id: "sirene",
    nome: "Sirene",
    icone: "🚓",
    notas: [
      [700, 220],
      [1000, 220],
      [700, 220],
      [1000, 300],
    ],
  },
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

/** O item 4 muda de texto conforme o modo de pilotagem da equipe. */
export function itensChecklist(modo: string): { id: string; texto: string }[] {
  return ITENS_CHECKLIST.map((item) =>
    item.id === "codigo_instalado"
      ? {
          ...item,
          texto:
            modo === "celular"
              ? "Código instalado no micro:bit do robô"
              : "Código instalado nos dois micro:bit",
        }
      : item,
  );
}

export type ParteInstrucoes = { titulo: string; icone: string; passos: string[]; nota?: string };

export const INSTRUCOES_INSTALACAO: ParteInstrucoes[] = [
  {
    titulo: "Antes de tudo: vocês têm dois micro:bit",
    icone: "🎮",
    passos: [
      "Um fica na sua mão — é o CONTROLE. O outro fica encaixado no carrinho — é o ROBÔ.",
      "Cada um recebe um código diferente. Não troquem. Se colocarem o código do robô no controle, nada funciona.",
    ],
  },
  {
    titulo: "Parte 1 · Preparar o MakeCode",
    icone: "⚙️",
    passos: [
      "Abram o site makecode.microbit.org",
      "Cliquem em Novo Projeto. Deem um nome: CONTROLE (depois vocês vão repetir tudo isso com o nome ROBO).",
      "Cliquem na engrenagem ⚙️ no canto de cima, à direita.",
      "Escolham Extensões.",
      "Na caixa de busca, escrevam robotbit e apertem Enter.",
      "Cliquem no cartão que aparecer com o nome robotbit (da KittenBot).",
      "Esperem a página recarregar sozinha.",
    ],
    nota: "Por que isso é necessário? Na placa do robô, o micro:bit não liga direto nos motores. Existe um chip no meio do caminho, e essa extensão é o que ensina o MakeCode a conversar com ele. Sem ela, o código dá erro em várias linhas.",
  },
  {
    titulo: "Parte 2 · Colar o código",
    icone: "📋",
    passos: [
      "No alto da tela, no meio, tem dois botões: Blocos e JavaScript. Cliquem em JavaScript.",
      "Vai aparecer uma tela com texto. Apaguem tudo o que estiver lá: cliquem dentro, apertem Ctrl + A e depois Delete.",
      "Voltem aqui e cliquem em Copiar no código do CONTROLE.",
      "Voltem ao MakeCode e colem: Ctrl + V.",
      "Cliquem de novo em Blocos, lá no alto.",
    ],
    nota: "Pronto: o programa virou blocos coloridos. É o mesmo programa, escrito de outro jeito.",
  },
  {
    titulo: "Parte 3 · Mandar para o micro:bit",
    icone: "🔌",
    passos: [
      "Liguem o micro:bit no computador pelo cabo USB.",
      "Cliquem no botão roxo Baixar, no canto de baixo à esquerda.",
      "Se o computador perguntar onde salvar, escolham o MICROBIT que aparece na lista de dispositivos, como se fosse um pendrive.",
      "A luz de trás do micro:bit vai piscar. Quando parar, está pronto.",
    ],
  },
  {
    titulo: "Parte 4 · Repetir para o robô",
    icone: "🤖",
    passos: [
      "Voltem ao passo 2 e façam tudo de novo, agora com o código do ROBÔ, num projeto novo chamado ROBO.",
      "Não esqueçam de instalar a extensão robotbit nesse projeto também. Cada projeto do MakeCode é separado.",
    ],
  },
  {
    titulo: "Ligações no carrinho",
    icone: "🔧",
    passos: [
      "Motor esquerdo: os dois contatos A (A+ e A−) do lado M1.",
      "Motor direito: os dois contatos B (B+ e B−) do lado M1.",
      "O contato VM fica vazio. O lado M2 fica vazio.",
      "A cor do fio não importa. Se o motor girar para o lado errado, troquem os dois fios daquele motor de lugar.",
    ],
    nota: "⚠️ Nunca espetem fio de motor nas fileiras de pinos coloridos (S1, S2, S3…). Isso queima a placa.",
  },
  {
    titulo: "Testando",
    icone: "✅",
    passos: [
      "Liguem os dois micro:bit. Segurem o controle parado enquanto aparece o bonequinho dormindo — é nessa hora que ele aprende qual é a posição de parado. Quando aparecer o ✓, pode usar.",
      "Levantem o carrinho com as rodas no ar e inclinem o controle: para frente, as duas rodas giram para frente; para trás, as duas giram para trás; para o lado, uma gira para um lado e a outra para o outro.",
      "Se o robô gira quando deveria andar reto, os fios de um motor estão invertidos. Troquem os dois fios do par A de lugar.",
    ],
  },
  {
    titulo: "Ajustando a estrela e o quadrado",
    icone: "⭐",
    passos: [
      "O robô precisa saber quanto tempo leva para dar uma volta completa. Esse número está no código, na linha: let GIRO360 = 1100",
      "Coloquem o robô no chão e marquem para onde está apontando a frente dele.",
      "Apertem o botão B do próprio robô. Ele vai dar uma volta.",
      "Parou apontando exatamente para o mesmo lugar? Então está certo. Girou demais? Diminuam o número. Girou de menos? Aumentem.",
      "Testem de novo até fechar. Façam isso com a bateria cheia: bateria fraca gira mais devagar, e aí o número muda.",
    ],
    nota: "Enquanto o GIRO360 não estiver certo, a estrela sai torta e não fecha. Cada ponta da estrela exige um giro de exatamente 144 graus — e o robô calcula esse giro a partir do tempo de uma volta inteira.",
  },
  {
    titulo: "Os botões do controle",
    icone: "🕹️",
    passos: [
      "Depende das melhorias que a sua equipe escolheu. O gerador escreveu o mapa certo no comentário do topo do seu código — confiram lá.",
      "Botão A do robô (não do controle) é sempre parada de emergência.",
    ],
  },
  {
    titulo: "Se der erro",
    icone: "🆘",
    passos: [
      "\"Cannot find name 'robotbit'\" → a extensão não foi instalada nesse projeto. Voltem à Parte 1.",
      "O robô não responde ao controle → o número do grupo de rádio está diferente nos dois códigos. Confiram a primeira linha dos dois.",
      "O robô responde ao controle de outra equipe → duas equipes estão com o mesmo número de grupo. Chamem o professor.",
      "O robô anda sozinho sem ninguém mexer → o controle não foi calibrado numa posição parada. Desliguem e liguem o controle, segurando ele imóvel enquanto aparece o bonequinho dormindo.",
      "Não sai som nenhum → se o micro:bit for de modelo antigo (V1), ele não tem alto-falante. Precisa de um buzzer ligado nos pinos P0 e GND.",
    ],
  },
];
