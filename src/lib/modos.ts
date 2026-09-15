// Os três modos de pilotagem. Todas as melhorias funcionam nos três.

export type ModoPilotagem = "inclinacao" | "teclado" | "celular";

export type DescricaoModo = {
  id: ModoPilotagem;
  numero: number;
  nome: string;
  icone: string;
  frase: string;
  pontos: string[];
  cor: string;
};

export const MODOS: DescricaoModo[] = [
  {
    id: "inclinacao",
    numero: 1,
    nome: "Inclinando o micro:bit",
    icone: "🕹️",
    frase: "O piloto segura um micro:bit e inclina para dirigir, como um volante.",
    pontos: [
      "Precisa de: 2 micro:bit e 2 baterias",
      "Alcance: até uns 30 metros",
      "O piloto anda livre em volta da arena",
      "Melhor para a batalha",
    ],
    cor: "bg-primary text-primary-foreground",
  },
  {
    id: "teclado",
    numero: 2,
    nome: "Pelo teclado do computador",
    icone: "⌨️",
    frase:
      "O micro:bit de controle fica ligado ao computador por cabo, e o piloto dirige com W, A, S, D.",
    pontos: [
      "Precisa de: 2 micro:bit, um computador com Chrome e um cabo USB",
      "O piloto fica preso ao computador",
      "Resposta mais precisa",
      "Melhor para testar e calibrar",
    ],
    cor: "bg-secondary text-secondary-foreground",
  },
  {
    id: "celular",
    numero: 3,
    nome: "Pelo celular",
    icone: "📱",
    frase:
      "O celular conversa direto com o robô por Bluetooth. Não usa micro:bit de controle.",
    pontos: [
      "Precisa de: 1 micro:bit e um celular Android com Chrome",
      "Alcance: uns 10 metros",
      "Não funciona no iPhone",
      "Melhor para demonstração",
    ],
    cor: "bg-accent text-accent-foreground",
  },
];

export function modoDe(id: string | null | undefined): DescricaoModo {
  return MODOS.find((m) => m.id === id) ?? MODOS[0]!;
}

/** Passos que só o modo celular exige, na ordem. O passo 2 é o mais esquecido. */
export const PASSOS_CELULAR = [
  { texto: "Instale as extensões robotbit e bluetooth no MakeCode", destaque: false },
  {
    texto:
      'Em Configurações do Projeto, marque "No Pairing Required: Anyone can connect via Bluetooth"',
    destaque: true,
  },
  { texto: "Abra o painel no Chrome do Android", destaque: false },
];

export const AVISO_TECLADO = "Feche o MakeCode antes de conectar. Ele segura a porta USB.";
