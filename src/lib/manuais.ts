// Manual de Engenharia e Manual de Design.
// ATENÇÃO: textos iniciais, escritos para o site não ficar vazio.
// O professor vai mandar as versões definitivas para substituir aqui.

export type PerguntaManual = { pergunta: string; resposta: string; icone: string };

export const MANUAL_ENGENHARIA: PerguntaManual[] = [
  {
    icone: "🛞",
    pergunta: "Meu carrinho não dá tração. O que pode ser?",
    resposta:
      "Falta peso em cima das rodas que puxam. Rodas girando no ar não empurram nada. Aproxime a bateria do eixo de tração e confira se a roda não está roçando no chassi.",
  },
  {
    icone: "↩️",
    pergunta: "O robô puxa para um lado quando deveria ir reto.",
    resposta:
      "Um motor gira mais rápido que o outro. Na tela Ajustes, baixe a força do motor mais rápido. Se não resolver, aumente a zona morta para os lados: sua mão inclina de lado sem perceber.",
  },
  {
    icone: "🔌",
    pergunta: "Um motor não gira de jeito nenhum.",
    resposta:
      "Confira os dois fios daquele motor na placa: motor esquerdo nos contatos A, motor direito nos contatos B, do lado M1. Fio solto ou espetado no pino errado não gira.",
  },
  {
    icone: "🔋",
    pergunta: "O robô ficou lento no meio da aula.",
    resposta:
      "Bateria fraca. Troque e calibre a volta completa de novo: com bateria caindo, o robô gira mais devagar e a estrela sai torta.",
  },
  {
    icone: "🎈",
    pergunta: "O balão atrapalha o robô.",
    resposta:
      "Suporte alto e leve. Balão pesado ou muito na frente levanta as rodas de tração e o robô perde força para andar.",
  },
];

export type RegraDesign = { titulo: string; texto: string; icone: string };

export const MANUAL_DESIGN: RegraDesign[] = [
  {
    icone: "📏",
    titulo: "Medidas",
    texto:
      "A decoração não pode passar das bordas do chassi nem tapar as rodas. Nada solto para fora: engancha no robô adversário.",
  },
  {
    icone: "⚖️",
    titulo: "Peso",
    texto:
      "Papel, EVA e fita são leves e podem. Papelão grosso, madeira e massinha pesam e derrubam a velocidade. Pese o robô antes e depois de decorar.",
  },
  {
    icone: "🚫",
    titulo: "Não tapar",
    texto:
      "Deixe livres: a tela do micro:bit, o botão A e o botão B, a entrada do cabo e o alto-falante.",
  },
  {
    icone: "🎈",
    titulo: "Balão",
    texto: "A decoração não pode encostar no balão nem no suporte dele.",
  },
];
