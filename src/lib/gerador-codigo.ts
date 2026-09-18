// =====================================================================
// MONTAGEM DO CÓDIGO — 100% DETERMINÍSTICA
// ---------------------------------------------------------------------
// Nada aqui é gerado por IA em tempo de execução. A montagem apenas:
//   1. escolhe os trechos de texto fixos correspondentes às escolhas da equipe
//   2. junta os trechos na ordem definida em ORDEM_MODULOS
//   3. substitui os marcadores {{NOME}} dos modelos pelos textos resultantes
//
// O controle não decide nada: ele só avisa qual botão foi apertado. Quem
// decide o que cada botão faz é o robô — por isso as melhorias funcionam
// igual nos três modos de pilotagem.
// =====================================================================

import { ligadoAjuste, numeroAjuste, numeroAjusteMelhoria } from "./ajustes";
import { atribuicaoEfetiva, VALOR_COREOGRAFIA } from "./botoes";
import { MOVIMENTOS } from "./catalogo";
import {
  COMUNICACAO_BLUETOOTH,
  CORPO_PILOTAR_DIRETO,
  MODELO_ROBO,
} from "./modelos-codigo";
import type { AjustesMelhorias } from "./ajustes";
import type { Botao, Coreografia, Equipe, MovimentoNaSequencia } from "./tipos";

/** Nomes dos marcadores aceitos nos modelos. */
export const MARCADORES = [
  "NOME_EQUIPE",
  "GRUPO",
  "SENHA",
  "SENSIBILIDADE",
  "ZONA_FRENTE",
  "ZONA_CURVA",
  "GIRO",
  "RITMO",
  "VEL_NORMAL",
  "GIRO360",
  "VEL_COREO",
  "INV_ESQ",
  "INV_DIR",
  "TRIM_ESQ",
  "TRIM_DIR",
  "DEADMAN",
  "CORPO_PILOTAR",
  "ROBO_VARS",
  "ROBO_SETUP",
  "ROBO_FUNCS",
  "SETA_EXTRA",
  "ROBO_LOOPS",
  "BOTAO_A",
  "BOTAO_B",
  "BOTAO_AB",
  "COMUNICACAO",
] as const;

export type Marcador = (typeof MARCADORES)[number];

/** Ordem de encaixe quando mais de um módulo escreve no mesmo marcador. */
export const ORDEM_MODULOS: string[] = [
  "bipe_re",
  "arranque_suave",
  "contra_ataque",
  "som_abertura",
  "turbo",
  "marcha_lenta",
];

/**
 * Marcador de parâmetro dentro do texto do módulo → id do campo da tela Ajustes.
 * Nada é inventado: só troca de número.
 */
export const PARAMETROS_MELHORIAS: Record<string, Record<string, string>> = {
  turbo: { TURBO_DURACAO: "duracao_turbo", TURBO_RECARGA: "recarga" },
  marcha_lenta: { VEL_LENTA: "velocidade_lenta" },
  contra_ataque: {
    IMPACTO: "sensibilidade_impacto",
    CA_RECUO: "tempo_recuo",
    CA_GIRO: "angulo_giro",
    CA_DESCANSO: "descanso",
  },
  arranque_suave: { RAMPA: "suavidade" },
  bipe_re: { RE_ALTURA: "altura_bipe", RE_INTERVALO: "intervalo_bipe" },
  som_abertura: {},
};

type TrechosPorMarcador = Partial<Record<Marcador, string>>;

/** Texto que cada melhoria insere. Tudo vive no robô. */
export const TRECHOS_MELHORIAS: Record<
  string,
  { robo?: TrechosPorMarcador; corpoBotao?: string }
> = {
  turbo: {
    robo: {
      ROBO_VARS: `let TURBO_DURACAO: number = {{TURBO_DURACAO}}
let TURBO_RECARGA: number = {{TURBO_RECARGA}}
let turboAte: number = 0
let recargaAte: number = 0`,
      ROBO_LOOPS: `
basic.forever(function () {
    if (turboAte > 0 && input.runningTime() > turboAte) {
        turboAte = 0
        VEL_ATUAL = VEL_NORMAL
        music.playTone(523, 80)
        setaAtual = -1
        seta(0)
    }
    basic.pause(50)
})`,
    },
    corpoBotao: `    if (input.runningTime() > recargaAte) {
        VEL_ATUAL = 255
        turboAte = input.runningTime() + TURBO_DURACAO
        recargaAte = turboAte + TURBO_RECARGA
        music.playTone(988, 100)
        setaAtual = -1
        basic.showIcon(IconNames.Yes)
    } else {
        music.playTone(262, 150)
    }`,
  },
  marcha_lenta: {
    robo: {
      ROBO_VARS: `let VEL_LENTA: number = {{VEL_LENTA}}
let lenta: boolean = false`,
    },
    corpoBotao: `    if (lenta) {
        lenta = false
        VEL_ATUAL = VEL_NORMAL
        music.playTone(784, 100)
    } else {
        lenta = true
        VEL_ATUAL = VEL_LENTA
        music.playTone(392, 100)
    }
    setaAtual = -1
    seta(0)`,
  },
  contra_ataque: {
    robo: {
      ROBO_VARS: `let IMPACTO: number = {{IMPACTO}}
let CA_RECUO: number = {{CA_RECUO}}
let CA_GIRO: number = {{CA_GIRO}}
let CA_DESCANSO: number = {{CA_DESCANSO}}
let proximoCA: number = 0`,
      ROBO_LOOPS: `
basic.forever(function () {
    if (ocupado || input.runningTime() < proximoCA) {
        basic.pause(30)
        return
    }
    if (input.acceleration(Dimension.Strength) > IMPACTO) {
        proximoCA = input.runningTime() + CA_DESCANSO
        ocupado = true
        music.playTone(147, 200)
        setaAtual = -1
        basic.showIcon(IconNames.Angry)
        mover(-VEL_COREO, -VEL_COREO)
        basic.pause(CA_RECUO)
        mover(VEL_COREO, -VEL_COREO)
        basic.pause(graus(CA_GIRO))
        parar()
        ocupado = false
        ultimo = input.runningTime()
        setaAtual = -1
        seta(0)
    }
    basic.pause(30)
})`,
    },
  },
  arranque_suave: {
    robo: {
      ROBO_VARS: `let RAMPA: number = {{RAMPA}}
let alvoEsq: number = 0
let alvoDir: number = 0
let atualEsq: number = 0
let atualDir: number = 0`,
      ROBO_FUNCS: `function aproxima(atual: number, alvo: number): number {
    if (atual < alvo) {
        atual += RAMPA
        if (atual > alvo) { atual = alvo }
    } else if (atual > alvo) {
        atual -= RAMPA
        if (atual < alvo) { atual = alvo }
    }
    return atual
}`,
      ROBO_LOOPS: `
basic.forever(function () {
    if (ocupado) {
        atualEsq = 0
        atualDir = 0
        basic.pause(20)
        return
    }
    if (input.runningTime() - ultimo > DEADMAN) {
        alvoEsq = 0
        alvoDir = 0
    }
    if (atualEsq != alvoEsq || atualDir != alvoDir) {
        atualEsq = aproxima(atualEsq, alvoEsq)
        atualDir = aproxima(atualDir, alvoDir)
        mover(atualEsq, atualDir)
    }
    basic.pause(20)
})`,
    },
  },
  som_abertura: {},
  bipe_re: {
    robo: {
      ROBO_VARS: `let RE_ALTURA: number = {{RE_ALTURA}}
let RE_INTERVALO: number = {{RE_INTERVALO}}
let daRe: boolean = false`,
      SETA_EXTRA: `    daRe = (estado == 2)`,
      ROBO_LOOPS: `
basic.forever(function () {
    if (daRe && !ocupado) {
        music.playTone(RE_ALTURA, 90)
        basic.pause(RE_INTERVALO)
    } else {
        basic.pause(100)
    }
})`,
    },
  },
};

/** Com Arranque suave, a função pilotar guarda o alvo em vez de mover direto. */
export const CORPO_PILOTAR_SUAVE = `    alvoEsq = Math.idiv(esq * VEL_ATUAL, 255)
    alvoDir = Math.idiv(dir * VEL_ATUAL, 255)
    if (esq == 0 && dir == 0) { seta(0) }
    else if (esq > 0 && dir > 0) { seta(1) }
    else if (esq < 0 && dir < 0) { seta(2) }
    else if (esq < dir) { seta(3) }
    else { seta(4) }`;

/** Linha de código que cada movimento de coreografia gera. */
export const LINHAS_MOVIMENTOS: Record<string, (params: number[]) => string> = {
  frente: (p) => `andarFrente(${p[0]})`,
  tras: (p) => `andarTras(${p[0]})`,
  girar_direita: (p) => `girarDireita(${p[0]})`,
  girar_esquerda: (p) => `girarEsquerda(${p[0]})`,
  parado: (p) => `pausar(${p[0]})`,
  curva_direita: (p) => `curvaDireita(${p[0]})`,
  curva_esquerda: (p) => `curvaEsquerda(${p[0]})`,
  estrela: (p) => `estrela(${p[0]})`,
  quadrado: (p) => `quadrado(${p[0]})`,
  piao: (p) => `piao(${p[0]})`,
  tremida: (p) => `tremida(${p[0]})`,
  apitar: (p) => `apitar(${p[0]}, ${p[1]})`,
};

/** Trecho da melodia de abertura escolhida. */
export const TRECHOS_MELODIAS: Record<string, string> = {
  fanfarra: `music.playTone(523, 150)
music.playTone(659, 150)
music.playTone(784, 150)
music.playTone(1047, 350)`,
  alerta_combate: `music.playTone(880, 120)
basic.pause(80)
music.playTone(880, 120)
basic.pause(80)
music.playTone(1175, 400)`,
  robozinho: `music.playTone(392, 100)
music.playTone(523, 100)
music.playTone(440, 100)
music.playTone(587, 100)
music.playTone(494, 250)`,
  descida_grave: `music.playTone(784, 130)
music.playTone(659, 130)
music.playTone(523, 130)
music.playTone(392, 400)`,
  sirene: `for (let i = 0; i < 2; i++) {
    music.playTone(659, 180)
    music.playTone(880, 180)
}`,
};

// ---------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------

function aplicarParametros(
  trecho: string,
  melhoriaId: string,
  ajustes: AjustesMelhorias | undefined,
): string {
  const mapa = PARAMETROS_MELHORIAS[melhoriaId] ?? {};
  return trecho.replace(/\{\{([A-Z_0-9]+)\}\}/g, (original, nome: string) => {
    const campoId = mapa[nome];
    if (!campoId) return original;
    return String(numeroAjusteMelhoria(ajustes, melhoriaId, campoId));
  });
}

function juntarTrechos(equipe: Equipe, marcador: Marcador): string {
  const escolhidasEmOrdem = ORDEM_MODULOS.filter((id) => equipe.melhorias.includes(id));
  const trechos = escolhidasEmOrdem
    .map((id) => {
      const trecho = TRECHOS_MELHORIAS[id]?.robo?.[marcador];
      if (!trecho || !trecho.trim()) return null;
      return aplicarParametros(trecho, id, equipe.ajustesMelhorias);
    })
    .filter((trecho): trecho is string => Boolean(trecho));
  // Linha em branco entre os módulos, conforme a ordem de encaixe do catálogo.
  return trechos.join("\n\n");
}

function montarSequencia(movimentos: MovimentoNaSequencia[]): string {
  return movimentos
    .map((item) => {
      const linha = LINHAS_MOVIMENTOS[item.movimentoId];
      return linha ? `    ${linha(item.params)}` : null;
    })
    .filter((linha): linha is string => Boolean(linha))
    .join("\n");
}

function corpoDeCoreografia(coreografias: Coreografia[], gatilho: Botao): string {
  const encontrada = coreografias.find((c) => c.gatilho === gatilho);
  const corpo = encontrada ? montarSequencia(encontrada.movimentos) : "";
  return corpo.trim() ? corpo : "    // esta coreografia ainda não foi montada";
}

function aplicarMarcadores(modelo: string, valores: Partial<Record<Marcador, string>>): string {
  return modelo.replace(/\{\{([A-Z_0-9]+)\}\}/g, (_original, nome: string) => {
    const valor = valores[nome as Marcador];
    return valor === undefined ? "" : valor;
  });
}

export type CodigoGerado = {
  robo: string;
  tituloRobo: string;
};

/** Monta o código do robô colando trechos fixos nos marcadores. */
export function montarCodigo(equipe: Equipe): CodigoGerado {
  const ajustes = equipe.ajustes;
  const usaTurbo = equipe.melhorias.includes("turbo");
  const usaArranqueSuave = equipe.melhorias.includes("arranque_suave");

  const base: Partial<Record<Marcador, string>> = {
    NOME_EQUIPE: equipe.nomeEquipe,
    GRUPO: String(equipe.grupoRadio),
    SENHA: (equipe.senhaRobo || "").toUpperCase(),
    SENSIBILIDADE: String(numeroAjuste(ajustes, "sensibilidade")),
    ZONA_FRENTE: String(numeroAjuste(ajustes, "zona_frente")),
    ZONA_CURVA: String(numeroAjuste(ajustes, "zona_curva")),
    GIRO: String(numeroAjuste(ajustes, "forca_giro")),
    RITMO: String(numeroAjuste(ajustes, "ritmo_envio")),
    // Quem escolhe Turbo tem a velocidade normal reduzida: é o que o turbo dá a mais.
    VEL_NORMAL: String(
      usaTurbo
        ? numeroAjusteMelhoria(equipe.ajustesMelhorias, "turbo", "velocidade_normal")
        : numeroAjuste(ajustes, "velocidade_maxima"),
    ),
    GIRO360: String(numeroAjuste(ajustes, "giro360")),
    VEL_COREO: String(numeroAjuste(ajustes, "velocidade_coreografia")),
    INV_ESQ: ligadoAjuste(ajustes, "inverter_motor_esquerdo") ? "-1" : "1",
    INV_DIR: ligadoAjuste(ajustes, "inverter_motor_direito") ? "-1" : "1",
    TRIM_ESQ: String(numeroAjuste(ajustes, "forca_motor_esquerdo")),
    TRIM_DIR: String(numeroAjuste(ajustes, "forca_motor_direito")),
    DEADMAN: String(numeroAjuste(ajustes, "parada_perda_sinal")),
  };

  const robo: Partial<Record<Marcador, string>> = { ...base };
  for (const marcador of ["ROBO_VARS", "ROBO_SETUP", "ROBO_FUNCS", "SETA_EXTRA", "ROBO_LOOPS"] as Marcador[]) {
    robo[marcador] = juntarTrechos(equipe, marcador);
  }

  robo.CORPO_PILOTAR = usaArranqueSuave ? CORPO_PILOTAR_SUAVE : CORPO_PILOTAR_DIRETO;

  // A melodia de abertura entra no setup do robô.
  const melodia = equipe.melhorias.includes("som_abertura") ? equipe.melodiaAbertura : null;
  const trechoMelodia = melodia ? (TRECHOS_MELODIAS[melodia] ?? "") : "";
  if (trechoMelodia) {
    robo.ROBO_SETUP = [robo.ROBO_SETUP, trechoMelodia].filter(Boolean).join("\n");
  }

  // Cada botão recebe o corpo da melhoria escolhida ou da coreografia.
  const atribuicao = atribuicaoEfetiva(equipe);
  const marcadorDoBotao: Record<Botao, Marcador> = {
    A: "BOTAO_A",
    B: "BOTAO_B",
    AB: "BOTAO_AB",
  };
  for (const botao of ["A", "B", "AB"] as Botao[]) {
    const valor = atribuicao[botao];
    let corpo: string;
    if (valor === VALOR_COREOGRAFIA) {
      corpo = corpoDeCoreografia(equipe.coreografias, botao);
    } else {
      const trecho = TRECHOS_MELHORIAS[valor]?.corpoBotao;
      corpo = trecho
        ? aplicarParametros(trecho, valor, equipe.ajustesMelhorias)
        : "    // este botão não foi usado por esta equipe";
    }
    robo[marcadorDoBotao[botao]] = corpo;
  }

  // Só existe um jeito de pilotar: o celular falando por Bluetooth com o robô.
  robo.COMUNICACAO = COMUNICACAO_BLUETOOTH;

  return {
    // Duas passadas: os trechos colados (comunicação, melhorias) também têm marcadores.
    robo: aplicarMarcadores(aplicarMarcadores(MODELO_ROBO, robo), robo),
    tituloRobo: "ROBÔ POR BLUETOOTH",
  };
}

/** Duração estimada de uma coreografia, em segundos. */
export function duracaoEstimada(movimentos: MovimentoNaSequencia[]): number {
  let total = 0;
  for (const item of movimentos) {
    const movimento = MOVIMENTOS.find((m) => m.id === item.movimentoId);
    if (!movimento) continue;
    total += movimento.duracao(item.params);
  }
  return Math.round(total * 10) / 10;
}
