// Todas as equipes pilotam pelo celular, por Bluetooth. Não existe mais escolha de modo.

import { rotulosDosBotoes } from "./botoes";
import type { Equipe } from "./tipos";

/** Endereço do painel de pilotagem, com senha, nome do micro:bit e rótulos dos botões. */
export function enderecoDoPainel(equipe: Equipe): string {
  const { ba, bb, bab } = rotulosDosBotoes(equipe);
  const partes = [
    `senha=${encodeURIComponent(equipe.senhaRobo)}`,
    `nome=${encodeURIComponent(equipe.nomeMicrobit)}`,
    `ba=${encodeURIComponent(ba)}`,
    `bb=${encodeURIComponent(bb)}`,
    `bab=${encodeURIComponent(bab)}`,
  ];
  return `/pilotar-celular.html?${partes.join("&")}`;
}

/** Os três passos de instalação. O passo 2 é o mais esquecido. */
export const PASSOS_CELULAR = [
  { texto: "No MakeCode, instale as extensões robotbit e bluetooth", destaque: false },
  {
    texto:
      'Em Configurações do Projeto, marque "No Pairing Required: Anyone can connect via Bluetooth"',
    destaque: true,
  },
  {
    texto: "Instale no micro:bit do robô e abra o painel de pilotagem no Chrome do Android",
    destaque: false,
  },
];

export const AVISO_PASSO_DOIS = "Sem isso, o celular não vai achar o robô.";

export const AVISO_ANDROID =
  "Precisa ser um celular Android com Chrome. iPhone não funciona: o navegador dele não fala Bluetooth com o robô.";

export const AVISO_MODO_MUDOU =
  "Agora todas as equipes pilotam pelo celular. Instalem o código novo no micro:bit do robô.";
