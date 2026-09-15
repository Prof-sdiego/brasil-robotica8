// =====================================================================
// MONTAGEM DO CÓDIGO — 100% DETERMINÍSTICA
// ---------------------------------------------------------------------
// Nada aqui é gerado por IA em tempo de execução. A montagem apenas:
//   1. escolhe os trechos de texto fixos correspondentes às escolhas da equipe
//   2. junta os trechos na ordem definida em ORDEM_MODULOS
//   3. substitui os marcadores {{NOME}} dos modelos pelos textos resultantes
//
// O QUE AINDA FALTA PREENCHER (texto que o professor vai enviar):
//   - LINHAS_MOVIMENTOS: a linha de código que cada movimento gera.
// Nenhuma tela precisa ser alterada quando esses textos mudarem.
// =====================================================================

import { MOVIMENTOS } from "./catalogo";
import type { Coreografia, Equipe, MovimentoNaSequencia } from "./tipos";

/** Nomes dos marcadores aceitos nos modelos. */
export const MARCADORES = [
  "NOME_EQUIPE",
  "GRUPO",
  "SENSIBILIDADE",
  "VEL_NORMAL",
  "CTRL_VARS",
  "CTRL_BOTAO_B",
  "CTRL_BOTAO_AB",
  "CTRL_LOOP",
  "ROBO_VARS",
  "ROBO_SETUP",
  "ROBO_FUNCS",
  "SETA_EXTRA",
  "ROBO_LOOPS",
  "COREO_1",
  "COREO_2",
  "COREO_3",
] as const;

export type Marcador = (typeof MARCADORES)[number];

/** Ordem de encaixe quando mais de um módulo escreve no mesmo marcador. */
export const ORDEM_MODULOS: string[] = [
  "farol",
  "bipe_re",
  "contador_tempo",
  "som_abertura",
  "turbo",
  "marcha_lenta",
];

/** Módulos que ocupam o botão B do controle (deixam a equipe com 2 coreografias). */
export const MODULOS_QUE_OCUPAM_BOTAO_B = ["turbo", "marcha_lenta"];

type TrechosPorMarcador = Partial<Record<Marcador, string>>;

/** Texto que cada melhoria insere em cada marcador (controle e robô). */
export const TRECHOS_MELHORIAS: Record<
  string,
  { controle?: TrechosPorMarcador; robo?: TrechosPorMarcador }
> = {
  farol: {
    robo: {
      ROBO_VARS: `let faixa: neopixel.Strip = null`,
      ROBO_SETUP: `faixa = robotbit.rgb()
faixa.setBrightness(60)
faixa.showColor(neopixel.colors(NeoPixelColors.White))`,
      SETA_EXTRA: `    if (estado == 0) {
        faixa.showColor(neopixel.colors(NeoPixelColors.White))
    } else if (estado == 1) {
        faixa.showColor(neopixel.colors(NeoPixelColors.Green))
    } else if (estado == 2) {
        faixa.showColor(neopixel.colors(NeoPixelColors.Red))
    } else {
        faixa.showColor(neopixel.colors(NeoPixelColors.Blue))
    }`,
    },
  },
  turbo: {
    controle: {
      CTRL_VARS: `let turboAte: number = 0
let recargaAte: number = 0`,
      CTRL_BOTAO_B: `    if (coreoAtiva) {
        cancela()
    } else if (input.runningTime() > recargaAte) {
        VEL = 255
        turboAte = input.runningTime() + 2000
        recargaAte = turboAte + 5000
        music.playTone(988, 100)
        ultimaSeta = -1
        basic.showIcon(IconNames.Yes)
    } else {
        music.playTone(262, 150)
    }`,
      CTRL_LOOP: `    if (turboAte > 0 && input.runningTime() > turboAte) {
        turboAte = 0
        VEL = VEL_NORMAL
        music.playTone(523, 80)
        ultimaSeta = -1
    }`,
    },
  },
  marcha_lenta: {
    controle: {
      CTRL_VARS: `let lenta: boolean = false`,
      CTRL_BOTAO_B: `    if (coreoAtiva) {
        cancela()
    } else if (lenta) {
        lenta = false
        VEL = VEL_NORMAL
        music.playTone(784, 100)
        ultimaSeta = -1
    } else {
        lenta = true
        VEL = 110
        music.playTone(392, 100)
        ultimaSeta = -1
    }`,
    },
  },
  som_abertura: {},
  bipe_re: {
    robo: {
      ROBO_VARS: `let daRe: boolean = false`,
      SETA_EXTRA: `    daRe = (estado == 2)`,
      ROBO_LOOPS: `
basic.forever(function () {
    if (daRe) {
        music.playTone(880, 90)
        basic.pause(230)
    } else {
        basic.pause(100)
    }
})`,
    },
  },
  contador_tempo: {
    robo: {
      ROBO_VARS: `let tempoMov: number = 0
let marcaMov: number = 0
let mostrouAgora: number = 0`,
      SETA_EXTRA: `    if (marcaMov > 0) {
        tempoMov += input.runningTime() - marcaMov
        marcaMov = 0
    }
    if (estado != 0) { marcaMov = input.runningTime() }`,
      ROBO_FUNCS: `// A+B no robô: mostra os segundos em movimento.
// Apertando duas vezes seguidas, zera o contador.
input.onButtonPressed(Button.AB, function () {
    if (coreo) { return }
    if (input.runningTime() - mostrouAgora < 3000) {
        tempoMov = 0
        marcaMov = 0
        basic.showIcon(IconNames.No)
        music.playTone(330, 200)
        basic.pause(500)
    } else {
        basic.showNumber(Math.idiv(tempoMov, 1000))
    }
    mostrouAgora = input.runningTime()
    setaAtual = -1
    seta(0)
})`,
    },
  },
};

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
// Modelos base — código real da oficina, com os marcadores {{...}}.
// ---------------------------------------------------------------------

export const MODELO_CONTROLE = `// ═══════════════════════════════════════════
//   CONTROLE — Equipe {{NOME_EQUIPE}}
//   Grupo de rádio: {{GRUPO}}
// ═══════════════════════════════════════════

let GRUPO: number = {{GRUPO}}
let SENSIBILIDADE: number = {{SENSIBILIDADE}}
let VEL_NORMAL: number = {{VEL_NORMAL}}

// ───────────────────────────────────────────

let VEL: number = VEL_NORMAL
let GIRO: number = 255
let ZONA: number = 80
let MAXFRENTE: number = 450 - SENSIBILIDADE * 30
let MAXCURVA: number = MAXFRENTE * 2

let zeroY: number = 0
let zeroX: number = 0
let coreoAtiva: boolean = false
let inicioCoreo: number = 0
let ultimaSeta: number = -1
let ultimoEnvio: number = -1
{{CTRL_VARS}}

radio.setGroup(GRUPO)
radio.setTransmitPower(7)
radio.setTransmitSerialNumber(false)
pins.analogSetPitchPin(AnalogPin.P0)

function calibrar() {
    basic.showIcon(IconNames.Asleep)
    basic.pause(800)
    let sy: number = 0
    let sx: number = 0
    for (let i = 0; i < 20; i++) {
        sy += input.acceleration(Dimension.Y)
        sx += input.acceleration(Dimension.X)
        basic.pause(25)
    }
    zeroY = Math.round(sy / 20)
    zeroX = Math.round(sx / 20)
    basic.showIcon(IconNames.Yes)
    music.playTone(784, 150)
    basic.pause(400)
    ultimaSeta = -1
    basic.showIcon(IconNames.SmallSquare)
}

calibrar()

function limita(v: number): number {
    if (v > 255) return 255
    if (v < -255) return -255
    return v
}

function mostrar(estado: number) {
    if (estado == ultimaSeta) { return }
    ultimaSeta = estado
    if (estado == 0) {
        basic.showIcon(IconNames.SmallSquare)
    } else if (estado == 1) {
        basic.showArrow(ArrowNames.North)
    } else if (estado == 2) {
        basic.showArrow(ArrowNames.South)
    } else if (estado == 3) {
        basic.showArrow(ArrowNames.West)
    } else {
        basic.showArrow(ArrowNames.East)
    }
}

function cancela() {
    coreoAtiva = false
    radio.sendNumber(900000)
    music.playTone(330, 200)
    ultimaSeta = -1
    ultimoEnvio = -1
    basic.showIcon(IconNames.SmallSquare)
}

function chamarCoreografia(codigo: number, letra: string) {
    coreoAtiva = true
    inicioCoreo = input.runningTime()
    radio.sendNumber(codigo)
    music.playTone(659, 120)
    radio.sendNumber(codigo)
    ultimaSeta = -1
    ultimoEnvio = -1
    basic.showString(letra)
}

// ─── BOTÃO A ───
input.onButtonPressed(Button.A, function () {
    if (coreoAtiva) {
        cancela()
    } else {
        chamarCoreografia(900001, "1")
    }
})

// ─── BOTÃO B ───
input.onButtonPressed(Button.B, function () {
{{CTRL_BOTAO_B}}
})

// ─── BOTÕES A + B ───
input.onButtonPressed(Button.AB, function () {
{{CTRL_BOTAO_AB}}
})

// o robô avisa que terminou a coreografia
radio.onReceivedNumber(function (n: number) {
    if (n == 900009 && coreoAtiva) {
        coreoAtiva = false
        ultimaSeta = -1
        basic.showIcon(IconNames.Yes)
        music.playTone(784, 150)
        music.playTone(988, 250)
        basic.pause(200)
        ultimaSeta = -1
        basic.showIcon(IconNames.SmallSquare)
    }
})

basic.forever(function () {
{{CTRL_LOOP}}
    if (coreoAtiva) {
        if (input.runningTime() - inicioCoreo > 40000) {
            coreoAtiva = false
            music.playTone(494, 200)
            ultimaSeta = -1
            basic.showIcon(IconNames.SmallSquare)
        }
        basic.pause(35)
        return
    }

    let y: number = (input.acceleration(Dimension.Y) - zeroY) * -1
    let x: number = input.acceleration(Dimension.X) - zeroX

    if (Math.abs(y) < ZONA) { y = 0 }
    if (Math.abs(x) < ZONA) { x = 0 }

    if (y > MAXFRENTE) { y = MAXFRENTE }
    if (y < -MAXFRENTE) { y = -MAXFRENTE }
    if (x > MAXCURVA) { x = MAXCURVA }
    if (x < -MAXCURVA) { x = -MAXCURVA }

    let frente: number = Math.map(y, -MAXFRENTE, MAXFRENTE, -VEL, VEL)
    let curva: number = Math.map(x, -MAXCURVA, MAXCURVA, -GIRO, GIRO)

    let esq: number = limita(Math.round(frente + curva))
    let dir: number = limita(Math.round(frente - curva))

    let pacote: number = (esq + 255) * 1000 + (dir + 255)
    radio.sendNumber(pacote)

    if (pacote != ultimoEnvio) {
        ultimoEnvio = pacote
        if (esq == 0 && dir == 0) {
            mostrar(0)
        } else if (esq > 0 && dir > 0) {
            mostrar(1)
        } else if (esq < 0 && dir < 0) {
            mostrar(2)
        } else if (esq < dir) {
            mostrar(3)
        } else {
            mostrar(4)
        }
    }

    basic.pause(15)
})
`;

export const MODELO_ROBO = `// ═══════════════════════════════════════════
//   ROBÔ — Equipe {{NOME_EQUIPE}}
//   Grupo de rádio: {{GRUPO}}
// ═══════════════════════════════════════════

let GRUPO: number = {{GRUPO}}

// Tempo em milissegundos para o robô dar UMA VOLTA COMPLETA (360°).
// CRONOMETRE O SEU ROBÔ e ajuste! A estrela e o quadrado dependem disso.
let GIRO360: number = 1100

// ───────────────────────────────────────────

let ultimo: number = 0
let coreo: boolean = false
let setaAtual: number = -1
{{ROBO_VARS}}

radio.setGroup(GRUPO)
radio.setTransmitPower(7)
radio.setTransmitSerialNumber(false)
pins.analogSetPitchPin(AnalogPin.P0)
basic.showIcon(IconNames.SmallSquare)
{{ROBO_SETUP}}

function mover(esq: number, dir: number) {
    robotbit.MotorRun(robotbit.Motors.M1A, -esq)
    robotbit.MotorRun(robotbit.Motors.M1B, dir)
}

function parar() {
    robotbit.MotorStopAll()
}

// desenha só quando muda — desenhar trava o programa
function seta(estado: number) {
    if (estado == setaAtual) { return }
    setaAtual = estado
{{SETA_EXTRA}}
    if (estado == 0) {
        basic.showIcon(IconNames.SmallSquare)
    } else if (estado == 1) {
        basic.showArrow(ArrowNames.North)
    } else if (estado == 2) {
        basic.showArrow(ArrowNames.South)
    } else if (estado == 3) {
        basic.showArrow(ArrowNames.West)
    } else {
        basic.showArrow(ArrowNames.East)
    }
}

function espera(ms: number) {
    let fim: number = input.runningTime() + ms
    while (input.runningTime() < fim) {
        if (!coreo) { return }
        basic.pause(5)
    }
}

// converte graus em tempo de giro
function graus(g: number): number {
    return Math.idiv(GIRO360 * g, 360)
}

// ═══════════════════════════════════════════
//   MOVIMENTOS DISPONÍVEIS
// ═══════════════════════════════════════════

function andarFrente(t: number) {
    if (!coreo) { return }
    seta(1)
    mover(255, 255)
    espera(t)
    parar()
    basic.pause(70)
}

function andarTras(t: number) {
    if (!coreo) { return }
    seta(2)
    mover(-255, -255)
    espera(t)
    parar()
    basic.pause(70)
}

function girarDireita(t: number) {
    if (!coreo) { return }
    seta(4)
    mover(255, -255)
    espera(t)
    parar()
    basic.pause(70)
}

function girarEsquerda(t: number) {
    if (!coreo) { return }
    seta(3)
    mover(-255, 255)
    espera(t)
    parar()
    basic.pause(70)
}

function pausar(t: number) {
    if (!coreo) { return }
    seta(0)
    parar()
    espera(t)
}

function curvaDireita(t: number) {
    if (!coreo) { return }
    seta(4)
    mover(255, 110)
    espera(t)
    parar()
    basic.pause(70)
}

function curvaEsquerda(t: number) {
    if (!coreo) { return }
    seta(3)
    mover(110, 255)
    espera(t)
    parar()
    basic.pause(70)
}

function estrela(tamanho: number) {
    for (let i = 0; i < 5; i++) {
        if (!coreo) { return }
        andarFrente(tamanho)
        girarDireita(graus(144))
    }
}

function quadrado(tamanho: number) {
    for (let i = 0; i < 4; i++) {
        if (!coreo) { return }
        andarFrente(tamanho)
        girarDireita(graus(90))
    }
}

function piao(voltas: number) {
    if (!coreo) { return }
    setaAtual = -1
    basic.showIcon(IconNames.Diamond)
    mover(255, -255)
    espera(GIRO360 * voltas)
    parar()
    basic.pause(70)
}

function tremida(vezes: number) {
    for (let i = 0; i < vezes; i++) {
        if (!coreo) { return }
        mover(255, 255)
        espera(120)
        mover(-255, -255)
        espera(120)
    }
    parar()
    basic.pause(70)
}

function apitar(altura: number, tempo: number) {
    if (!coreo) { return }
    music.playTone(altura, tempo)
}

{{ROBO_FUNCS}}

// ═══════════════════════════════════════════
//   AS COREOGRAFIAS DA EQUIPE
// ═══════════════════════════════════════════

function COREOGRAFIA_1() {
{{COREO_1}}
}

function COREOGRAFIA_2() {
{{COREO_2}}
}
{{COREO_3}}

// ───────────────────────────────────────────

function terminou() {
    parar()
    coreo = false
    ultimo = input.runningTime()
    radio.sendNumber(900009)
    basic.pause(25)
    radio.sendNumber(900009)
    setaAtual = -1
    seta(0)
}

radio.onReceivedNumber(function (n: number) {
    if (n >= 900000) {
        if (n == 900000) {
            coreo = false
            parar()
            setaAtual = -1
            seta(0)
        } else if (n == 900001 && !coreo) {
            coreo = true
            control.inBackground(function () {
                COREOGRAFIA_1()
                terminou()
            })
        } else if (n == 900002 && !coreo) {
            coreo = true
            control.inBackground(function () {
                COREOGRAFIA_2()
                terminou()
            })
        } else if (n == 900003 && !coreo) {
            coreo = true
            control.inBackground(function () {
                COREOGRAFIA_3()
                terminou()
            })
        }
        return
    }

    if (coreo) { return }

    ultimo = input.runningTime()
    let esq: number = Math.idiv(n, 1000) - 255
    let dir: number = n % 1000 - 255

    mover(esq, dir)

    if (esq == 0 && dir == 0) {
        seta(0)
    } else if (esq > 0 && dir > 0) {
        seta(1)
    } else if (esq < 0 && dir < 0) {
        seta(2)
    } else if (esq < dir) {
        seta(3)
    } else {
        seta(4)
    }
})

// Botão A do robô = parada de emergência
input.onButtonPressed(Button.A, function () {
    coreo = false
    parar()
})

// Botão B do robô = cronometrar o GIRO360
// Ele dá uma volta com o tempo programado. Se parar exatamente onde
// começou, o número está certo. Girou demais? Diminua. De menos? Aumente.
input.onButtonPressed(Button.B, function () {
    if (coreo) { return }
    coreo = true
    setaAtual = -1
    basic.showIcon(IconNames.Diamond)
    mover(255, -255)
    basic.pause(GIRO360)
    parar()
    coreo = false
    setaAtual = -1
    seta(0)
    ultimo = input.runningTime()
})

basic.forever(function () {
    if (!coreo && input.runningTime() - ultimo > 300) {
        parar()
        seta(0)
    }
    basic.pause(20)
})
{{ROBO_LOOPS}}
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
  // Linha em branco entre os módulos, conforme a ordem de encaixe do catálogo.
  return trechos.join("\n\n");
}

function coreografiaPorGatilho(coreografias: Coreografia[], gatilho: Coreografia["gatilho"]) {
  const encontrada = coreografias.find((c) => c.gatilho === gatilho);
  return encontrada ? montarSequencia(encontrada.movimentos) : "";
}

function aplicarMarcadores(modelo: string, valores: Partial<Record<Marcador, string>>): string {
  return modelo.replace(/\{\{([A-Z_0-9]+)\}\}/g, (_original, nome: string) => {
    const valor = valores[nome as Marcador];
    return valor === undefined ? "" : valor;
  });
}

export type CodigoGerado = { controle: string; robo: string };

/** Monta os dois códigos da equipe colando trechos fixos nos marcadores. */
export function montarCodigo(equipe: Equipe): CodigoGerado {
  // O botão B fica ocupado quando a equipe escolhe Turbo ou Marcha Lenta:
  // nesse caso ela tem duas coreografias (A e A+B) em vez de três.
  const botaoBOcupado = MODULOS_QUE_OCUPAM_BOTAO_B.some((id) => equipe.melhorias.includes(id));

  const base: Partial<Record<Marcador, string>> = {
    NOME_EQUIPE: equipe.nomeEquipe,
    GRUPO: String(equipe.grupoRadio),
    SENSIBILIDADE: String(equipe.sensibilidade),
    VEL_NORMAL: equipe.melhorias.includes("turbo") ? "180" : "255",
  };

  const marcadoresControle: Marcador[] = ["CTRL_VARS", "CTRL_BOTAO_B", "CTRL_LOOP"];
  const marcadoresRobo: Marcador[] = ["ROBO_VARS", "ROBO_SETUP", "ROBO_FUNCS", "SETA_EXTRA", "ROBO_LOOPS"];

  const controle: Partial<Record<Marcador, string>> = { ...base };
  const robo: Partial<Record<Marcador, string>> = { ...base };

  for (const marcador of marcadoresControle) {
    controle[marcador] = juntarTrechos(equipe.melhorias, "controle", marcador);
  }
  for (const marcador of marcadoresRobo) {
    robo[marcador] = juntarTrechos(equipe.melhorias, "robo", marcador);
  }

  // Se nenhum módulo ocupou o botão B, ele chama a segunda coreografia.
  if (!controle.CTRL_BOTAO_B?.trim()) {
    controle.CTRL_BOTAO_B = identar([
      "if (coreoAtiva) {",
      "    cancela()",
      "} else {",
      "    chamarCoreografia(900002, \"2\")",
      "}",
    ]);
  }

  // A+B chama a última coreografia da equipe.
  const codigoAB = botaoBOcupado ? 900002 : 900003;
  const letraAB = botaoBOcupado ? "2" : "3";
  const trechoAB = juntarTrechos(equipe.melhorias, "controle", "CTRL_BOTAO_AB");
  controle.CTRL_BOTAO_AB = trechoAB.trim()
    ? trechoAB
    : identar([
        "if (coreoAtiva) {",
        "    cancela()",
        "} else {",
        `    chamarCoreografia(${codigoAB}, "${letraAB}")`,
        "}",
      ]);

  // Coreografias: sem Turbo/Lenta são três (A, B, A+B); com um deles, duas (A, A+B).
  robo.COREO_1 = coreografiaPorGatilho(equipe.coreografias, "A");
  if (botaoBOcupado) {
    robo.COREO_2 = coreografiaPorGatilho(equipe.coreografias, "AB");
    robo.COREO_3 = [
      "",
      "function COREOGRAFIA_3() {",
      "    // esta equipe usa o botão B para Turbo ou Marcha Lenta",
      "}",
    ].join("\n");
  } else {
    robo.COREO_2 = coreografiaPorGatilho(equipe.coreografias, "B");
    robo.COREO_3 = [
      "",
      "function COREOGRAFIA_3() {",
      coreografiaPorGatilho(equipe.coreografias, "AB"),
      "}",
    ].join("\n");
  }

  // A melodia de abertura entra no setup do robô, junto com os outros módulos.
  const melodia = equipe.melhorias.includes("som_abertura") ? equipe.melodiaAbertura : null;
  const trechoMelodia = melodia
    ? (TRECHOS_MELODIAS[melodia] ?? `// melodia de abertura: ${melodia}`)
    : "";
  if (trechoMelodia) {
    robo.ROBO_SETUP = [robo.ROBO_SETUP, trechoMelodia].filter(Boolean).join("\n");
  }

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
    total += movimento.duracao(item.params);
  }
  return Math.round(total * 10) / 10;
}
