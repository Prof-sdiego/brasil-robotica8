// ARQUIVO GERADO A PARTIR DOS MODELOS ENVIADOS PELO PROFESSOR.
// Texto copiado palavra por palavra de 01_codigo_base.md e controle_teclado_microbit.js.
// Nada aqui é escrito por IA: são só os modelos com os marcadores {{...}}.

export const MODELO_CONTROLE = `// ═══════════════════════════════════════════
//   CONTROLE — Equipe {{NOME_EQUIPE}}
//   Grupo de rádio: {{GRUPO}}
// ═══════════════════════════════════════════

let GRUPO: number = {{GRUPO}}
let SENSIBILIDADE: number = {{SENSIBILIDADE}}
let GIRO: number = {{GIRO}}
let ZONA_FRENTE: number = {{ZONA_FRENTE}}
let ZONA_CURVA: number = {{ZONA_CURVA}}

// ───────────────────────────────────────────

let MAXFRENTE: number = 450 - SENSIBILIDADE * 30
let MAXCURVA: number = MAXFRENTE * 2

let zeroY: number = 0
let zeroX: number = 0
let ocupado: boolean = false
let inicioAcao: number = 0
let ultimaSeta: number = -1
let ultimoEnvio: number = -1

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

function cancelar() {
    ocupado = false
    radio.sendNumber(900000)
    music.playTone(330, 200)
    ultimaSeta = -1
    ultimoEnvio = -1
    basic.showIcon(IconNames.SmallSquare)
}

// o controle não sabe o que o botão faz: só avisa que apertaram
function apertou(codigo: number, letra: string) {
    if (ocupado) {
        cancelar()
        return
    }
    ocupado = true
    inicioAcao = input.runningTime()
    radio.sendNumber(codigo)
    music.playTone(659, 120)
    radio.sendNumber(codigo)
    ultimaSeta = -1
    ultimoEnvio = -1
    basic.showString(letra)
}

input.onButtonPressed(Button.A, function () { apertou(900001, "A") })
input.onButtonPressed(Button.B, function () { apertou(900002, "B") })
input.onButtonPressed(Button.AB, function () { apertou(900003, "C") })

// o robô avisa quando a ação terminou
radio.onReceivedNumber(function (n: number) {
    if (n == 900009 && ocupado) {
        ocupado = false
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
    if (ocupado) {
        // trava de segurança: nunca fica preso mais de 40 s
        if (input.runningTime() - inicioAcao > 40000) {
            ocupado = false
            music.playTone(494, 200)
            ultimaSeta = -1
            basic.showIcon(IconNames.SmallSquare)
        }
        basic.pause(35)
        return
    }

    let y: number = (input.acceleration(Dimension.Y) - zeroY) * -1
    let x: number = (input.acceleration(Dimension.X) - zeroX) * -1

    // zona morta subtrativa: o lado tem faixa maior, para a inclinação
    // lateral acidental não virar curva quando você só quer ir reto
    if (Math.abs(y) < ZONA_FRENTE) {
        y = 0
    } else if (y > 0) {
        y = y - ZONA_FRENTE
    } else {
        y = y + ZONA_FRENTE
    }

    if (Math.abs(x) < ZONA_CURVA) {
        x = 0
    } else if (x > 0) {
        x = x - ZONA_CURVA
    } else {
        x = x + ZONA_CURVA
    }

    if (y > MAXFRENTE) { y = MAXFRENTE }
    if (y < -MAXFRENTE) { y = -MAXFRENTE }
    if (x > MAXCURVA) { x = MAXCURVA }
    if (x < -MAXCURVA) { x = -MAXCURVA }

    // manda sempre na escala cheia: quem regula a velocidade é o robô
    let frente: number = Math.map(y, -MAXFRENTE, MAXFRENTE, -255, 255)
    let curva: number = Math.map(x, -MAXCURVA, MAXCURVA, -GIRO, GIRO)

    // andando forte para frente, a curva perde força: prioriza o reto
    if (frente != 0) {
        let peso: number = 100 - Math.idiv(Math.abs(frente) * 45, 255)
        curva = Math.idiv(curva * peso, 100)
    }

    let esq: number = Math.round(frente + curva)
    let dir: number = Math.round(frente - curva)

    // passou do teto? reduz os DOIS proporcionalmente em vez de cortar um só
    let maior: number = Math.max(Math.abs(esq), Math.abs(dir))
    if (maior > 255) {
        esq = Math.idiv(esq * 255, maior)
        dir = Math.idiv(dir * 255, maior)
    }

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

    basic.pause({{RITMO}})
})`;

export const MODELO_CONTROLE_TECLADO = `// ═══════════════════════════════════════════
//   CONTROLE POR TECLADO — Equipe {{NOME_EQUIPE}}
//   Substitui o programa normal do CONTROLE.
//   O robô NÃO muda: continua com o programa dele.
// ═══════════════════════════════════════════

let GRUPO: number = {{GRUPO}}      // MESMO número do robô

// ───────────────────────────────────────────

let VEL: number = 255
let GIRO: number = 140
let ultimaSeta: number = -1
let recebidoEm: number = 0

radio.setGroup(GRUPO)
radio.setTransmitPower(7)
radio.setTransmitSerialNumber(false)
serial.redirectToUSB()

basic.showIcon(IconNames.Square)
basic.pause(400)
basic.showIcon(IconNames.SmallSquare)

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

function enviar(esq: number, dir: number) {
    if (esq > 255) { esq = 255 }
    if (esq < -255) { esq = -255 }
    if (dir > 255) { dir = 255 }
    if (dir < -255) { dir = -255 }
    radio.sendNumber((esq + 255) * 1000 + (dir + 255))

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

// O computador manda UM caractere por linha.
// Direções no formato do teclado numérico:
//   7 8 9        7 = frente-esquerda   8 = frente    9 = frente-direita
//   4 5 6        4 = girar esquerda    5 = parado    6 = girar direita
//   O giro puro (4 e 6) usa a força do giro, igual nos dois motores.
//   1 2 3        1 = ré-esquerda       2 = ré        3 = ré-direita
// Botões:    a = botão A   b = botão B   d = botão A+B   z = cancelar
// Ajustes:   vNNN = velocidade   gNNN = força do giro
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let linha: string = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    if (linha.length < 1) { return }

    let c: string = linha.charAt(0)
    recebidoEm = input.runningTime()

    if (c == "v") {
        VEL = parseInt(linha.substr(1))
        return
    }
    if (c == "g") {
        GIRO = parseInt(linha.substr(1))
        return
    }
    // os três botões: quem decide o que fazem é o ROBÔ
    if (c == "a") {
        radio.sendNumber(900001)
        radio.sendNumber(900001)
        ultimaSeta = -1
        basic.showString("A")
        return
    }
    if (c == "b") {
        radio.sendNumber(900002)
        radio.sendNumber(900002)
        ultimaSeta = -1
        basic.showString("B")
        return
    }
    if (c == "d") {
        radio.sendNumber(900003)
        radio.sendNumber(900003)
        ultimaSeta = -1
        basic.showString("C")
        return
    }
    if (c == "z") {
        radio.sendNumber(900000)
        ultimaSeta = -1
        basic.showIcon(IconNames.SmallSquare)
        return
    }


    let frente: number = 0
    let curva: number = 0

    // giro no lugar: mesma força nos dois motores, regulada pelo slider
    if (c == "4") {
        enviar(-GIRO, GIRO)
        return
    }
    if (c == "6") {
        enviar(GIRO, -GIRO)
        return
    }

    if (c == "8" || c == "7" || c == "9") { frente = VEL }
    if (c == "2" || c == "1" || c == "3") { frente = -VEL }
    if (c == "7" || c == "1") { curva = -GIRO }
    if (c == "9" || c == "3") { curva = GIRO }

    enviar(frente + curva, frente - curva)
})

// o robô avisa que terminou a coreografia
radio.onReceivedNumber(function (n: number) {
    if (n == 900009) {
        serial.writeLine("FIM")
        ultimaSeta = -1
        basic.showIcon(IconNames.Yes)
        basic.pause(300)
        ultimaSeta = -1
        basic.showIcon(IconNames.SmallSquare)
    }
})

// se o computador parar de falar, manda o robô parar
basic.forever(function () {
    // se o computador parar de falar, manda o robô parar
    if (recebidoEm > 0 && input.runningTime() - recebidoEm > 600) {
        recebidoEm = 0
        enviar(0, 0)
    }
    basic.pause(100)
})`;

export const MODELO_ROBO = `// ═══════════════════════════════════════════
//   ROBÔ — Equipe {{NOME_EQUIPE}}
// ═══════════════════════════════════════════

let GRUPO: number = {{GRUPO}}

// Tempo em milissegundos para o robô dar UMA VOLTA COMPLETA (360°).
let GIRO360: number = {{GIRO360}}

// Velocidade normal da pilotagem (0 a 255).
let VEL_NORMAL: number = {{VEL_NORMAL}}

// Velocidade usada nas coreografias (0 a 255).
let VEL_COREO: number = {{VEL_COREO}}

// Sentido dos motores: 1 = normal, -1 = invertido
let INV_ESQ: number = {{INV_ESQ}}
let INV_DIR: number = {{INV_DIR}}

// Compensação: 100 = força total. Baixe o lado que for mais rápido.
let TRIM_ESQ: number = {{TRIM_ESQ}}
let TRIM_DIR: number = {{TRIM_DIR}}

// Depois de quantos ms sem sinal o robô para sozinho
let DEADMAN: number = {{DEADMAN}}

// ───────────────────────────────────────────

let VEL_ATUAL: number = VEL_NORMAL
let ultimo: number = 0
let ocupado: boolean = false
let setaAtual: number = -1
{{ROBO_VARS}}

pins.analogSetPitchPin(AnalogPin.P0)
basic.showIcon(IconNames.SmallSquare)
{{ROBO_SETUP}}

function mover(esq: number, dir: number) {
    robotbit.MotorRun(robotbit.Motors.M1A, Math.idiv(esq * TRIM_ESQ, 100) * INV_ESQ)
    robotbit.MotorRun(robotbit.Motors.M1B, Math.idiv(dir * TRIM_DIR, 100) * INV_DIR)
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

// pilotagem: o controle manda a direção na escala cheia,
// e aqui a velocidade escolhida pela equipe é aplicada
function pilotar(esq: number, dir: number) {
{{CORPO_PILOTAR}}
}

function espera(ms: number) {
    let fim: number = input.runningTime() + ms
    while (input.runningTime() < fim) {
        if (!ocupado) { return }
        basic.pause(5)
    }
}

function graus(g: number): number {
    return Math.idiv(GIRO360 * g, 360)
}

// ═══════════════════════════════════════════
//   MOVIMENTOS DAS COREOGRAFIAS
// ═══════════════════════════════════════════

function andarFrente(t: number) {
    if (!ocupado) { return }
    seta(1); mover(VEL_COREO, VEL_COREO); espera(t); parar(); basic.pause(70)
}

function andarTras(t: number) {
    if (!ocupado) { return }
    seta(2); mover(-VEL_COREO, -VEL_COREO); espera(t); parar(); basic.pause(70)
}

function girarDireita(t: number) {
    if (!ocupado) { return }
    seta(4); mover(VEL_COREO, -VEL_COREO); espera(t); parar(); basic.pause(70)
}

function girarEsquerda(t: number) {
    if (!ocupado) { return }
    seta(3); mover(-VEL_COREO, VEL_COREO); espera(t); parar(); basic.pause(70)
}

function pausar(t: number) {
    if (!ocupado) { return }
    seta(0); parar(); espera(t)
}

function curvaDireita(t: number) {
    if (!ocupado) { return }
    seta(4); mover(VEL_COREO, Math.idiv(VEL_COREO * 43, 100)); espera(t); parar(); basic.pause(70)
}

function curvaEsquerda(t: number) {
    if (!ocupado) { return }
    seta(3); mover(Math.idiv(VEL_COREO * 43, 100), VEL_COREO); espera(t); parar(); basic.pause(70)
}

function estrela(tamanho: number) {
    for (let i = 0; i < 5; i++) {
        if (!ocupado) { return }
        andarFrente(tamanho)
        girarDireita(graus(144))
    }
}

function quadrado(tamanho: number) {
    for (let i = 0; i < 4; i++) {
        if (!ocupado) { return }
        andarFrente(tamanho)
        girarDireita(graus(90))
    }
}

function piao(voltas: number) {
    if (!ocupado) { return }
    setaAtual = -1
    basic.showIcon(IconNames.Diamond)
    mover(VEL_COREO, -VEL_COREO)
    espera(GIRO360 * voltas)
    parar(); basic.pause(70)
}

function tremida(vezes: number) {
    for (let i = 0; i < vezes; i++) {
        if (!ocupado) { return }
        mover(VEL_COREO, VEL_COREO); espera(120)
        mover(-VEL_COREO, -VEL_COREO); espera(120)
    }
    parar(); basic.pause(70)
}

function ziguezagueFrente(vezes: number, tempo: number) {
    for (let i = 0; i < vezes; i++) {
        if (!ocupado) { return }
        seta(1)
        mover(VEL_COREO, Math.idiv(VEL_COREO * 45, 100))
        espera(tempo)
        if (!ocupado) { return }
        mover(Math.idiv(VEL_COREO * 45, 100), VEL_COREO)
        espera(tempo)
    }
    parar(); basic.pause(70)
}

function ziguezagueTras(vezes: number, tempo: number) {
    for (let i = 0; i < vezes; i++) {
        if (!ocupado) { return }
        seta(2)
        mover(-VEL_COREO, Math.idiv(-VEL_COREO * 45, 100))
        espera(tempo)
        if (!ocupado) { return }
        mover(Math.idiv(-VEL_COREO * 45, 100), -VEL_COREO)
        espera(tempo)
    }
    parar(); basic.pause(70)
}

function ziguezague(vezes: number, tamanho: number) {
    for (let i = 0; i < vezes; i++) {
        if (!ocupado) { return }
        curvaDireita(tamanho)
        if (!ocupado) { return }
        curvaEsquerda(tamanho)
    }
}

function apitar(altura: number, tempo: number) {
    if (!ocupado) { return }
    music.playTone(altura, tempo)
}

{{ROBO_FUNCS}}

// ═══════════════════════════════════════════
//   O QUE CADA BOTÃO FAZ
// ═══════════════════════════════════════════

function BOTAO_A() {
{{BOTAO_A}}
}

function BOTAO_B() {
{{BOTAO_B}}
}

function BOTAO_AB() {
{{BOTAO_AB}}
}

// ───────────────────────────────────────────

function terminou() {
    parar()
    ocupado = false
    ultimo = input.runningTime()
    avisarFim()
    setaAtual = -1
    seta(0)
}

function acionar(qual: number) {
    if (ocupado) { return }
    ocupado = true
    control.inBackground(function () {
        if (qual == 1) {
            BOTAO_A()
        } else if (qual == 2) {
            BOTAO_B()
        } else {
            BOTAO_AB()
        }
        terminou()
    })
}

function cancelar() {
    ocupado = false
    parar()
    setaAtual = -1
    seta(0)
}

{{COMUNICACAO}}

// Botão A do robô = parada de emergência
input.onButtonPressed(Button.A, function () {
    ocupado = false
    parar()
})

// Botão B do robô = cronometrar o GIRO360
// Aperte, tire a mão e espere a contagem. Ele dá uma volta com o tempo
// programado. Parou exatamente onde começou? O número está certo.
// Girou demais? Diminua. De menos? Aumente.
input.onButtonPressed(Button.B, function () {
    if (ocupado) { return }
    ocupado = true
    setaAtual = -1
    basic.showNumber(2)
    music.playTone(523, 80)
    basic.pause(1000)
    basic.showNumber(1)
    music.playTone(523, 80)
    basic.pause(1000)
    music.playTone(784, 120)
    basic.showIcon(IconNames.Diamond)
    mover(VEL_COREO, -VEL_COREO)
    basic.pause(GIRO360)
    parar()
    ocupado = false
    setaAtual = -1
    seta(0)
    ultimo = input.runningTime()
})

basic.forever(function () {
    if (!ocupado && input.runningTime() - ultimo > DEADMAN) {
        parar()
        seta(0)
    }
    basic.pause(20)
})
{{ROBO_LOOPS}}`;

export const COMUNICACAO_RADIO = `radio.setGroup(GRUPO)
radio.setTransmitPower(7)
radio.setTransmitSerialNumber(false)

function avisarFim() {
    radio.sendNumber(900009)
    basic.pause(25)
    radio.sendNumber(900009)
}

radio.onReceivedNumber(function (n: number) {
    if (n >= 900000) {
        if (n == 900000) { cancelar() }
        else if (n == 900001) { acionar(1) }
        else if (n == 900002) { acionar(2) }
        else if (n == 900003) { acionar(3) }
        return
    }
    if (ocupado) { return }
    ultimo = input.runningTime()
    pilotar(Math.idiv(n, 1000) - 255, n % 1000 - 255)
})`;

export const COMUNICACAO_BLUETOOTH = `// Senha da equipe: o robô só obedece a quem mandar esta senha
let SENHA: string = "{{SENHA}}"
let conectado: boolean = false
let autorizado: boolean = false

// mostra o nome deste micro:bit ao ligar — é o que a equipe
// cadastra no site para achar o robô certo na lista do celular
basic.showString(control.deviceName())

bluetooth.startUartService()

function avisarFim() {
    bluetooth.uartWriteLine("FIM")
}

bluetooth.onBluetoothConnected(function () {
    conectado = true
    autorizado = false
    setaAtual = -1
    basic.showIcon(IconNames.Confused)
    music.playTone(523, 120)
})

bluetooth.onBluetoothDisconnected(function () {
    conectado = false
    autorizado = false
    ocupado = false
    parar()
    setaAtual = -1
    basic.showIcon(IconNames.Asleep)
    music.playTone(392, 250)
})

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let linha: string = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (linha.length < 1) { return }
    let c: string = linha.charAt(0)
    ultimo = input.runningTime()

    if (c == "k") {
        if (linha.substr(1) == SENHA) {
            autorizado = true
            setaAtual = -1
            basic.showIcon(IconNames.Yes)
            music.playTone(659, 120)
            music.playTone(880, 180)
            bluetooth.uartWriteLine("OK")
            basic.pause(250)
            setaAtual = -1
            seta(0)
        } else {
            autorizado = false
            setaAtual = -1
            basic.showIcon(IconNames.No)
            music.playTone(196, 400)
            bluetooth.uartWriteLine("NAO")
        }
        return
    }

    if (!autorizado) { return }

    if (c == "z") { cancelar(); return }
    if (c == "a") { acionar(1); return }
    if (c == "b") { acionar(2); return }
    if (c == "d") { acionar(3); return }

    if (ocupado) { return }

    // direção no formato do teclado numérico
    let f: number = 0
    let g: number = 0
    if (c == "8" || c == "7" || c == "9") { f = 255 }
    if (c == "2" || c == "1" || c == "3") { f = -255 }
    if (c == "4") { pilotar(-180, 180); return }
    if (c == "6") { pilotar(180, -180); return }
    if (c == "7" || c == "1") { g = -140 }
    if (c == "9" || c == "3") { g = 140 }

    let e: number = f + g
    let d: number = f - g
    let maior: number = Math.max(Math.abs(e), Math.abs(d))
    if (maior > 255) {
        e = Math.idiv(e * 255, maior)
        d = Math.idiv(d * 255, maior)
    }
    pilotar(e, d)
})

// Botões A + B do robô = solta o celular conectado e libera para outro
input.onButtonPressed(Button.AB, function () {
    ocupado = false
    autorizado = false
    parar()
    basic.showIcon(IconNames.Skull)
    music.playTone(659, 100)
    music.playTone(523, 100)
    music.playTone(392, 250)
    basic.pause(300)
    control.reset()
})`;

/** Corpo original da função pilotar (move na hora). */
export const CORPO_PILOTAR_DIRETO = `    let e: number = Math.idiv(esq * VEL_ATUAL, 255)
    let d: number = Math.idiv(dir * VEL_ATUAL, 255)
    mover(e, d)

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
    }`;
