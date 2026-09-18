// Todos os números que o programa usa. O aluno nunca edita o código: muda aqui e gera de novo.
// Listas fixas, escritas à mão (nada gerado por IA em tempo de execução).

export type CampoDeslizante = {
  tipo: "deslizante";
  id: string;
  nome: string;
  ajuda: string;
  min: number;
  max: number;
  padrao: number;
  passo?: number;
  unidade?: string;
};

export type CampoSimNao = {
  tipo: "sim_nao";
  id: string;
  nome: string;
  ajuda: string;
  padrao: boolean;
};

export type CampoAjuste = CampoDeslizante | CampoSimNao;

export type SecaoAjustes = {
  id: string;
  titulo: string;
  icone: string;
  avancada?: boolean;
  aviso?: string;
  campos: CampoAjuste[];
};

export const SECOES_AJUSTES: SecaoAjustes[] = [
  {
    id: "pilotagem",
    titulo: "Pilotagem",
    icone: "🎮",
    campos: [
      {
        tipo: "deslizante",
        id: "sensibilidade",
        nome: "Sensibilidade da inclinação",
        ajuda:
          "Baixo: precisa inclinar bastante, mais fácil de controlar. Alto: uma inclinadinha já dá tudo.",
        min: 1,
        max: 10,
        padrao: 6,
      },
      {
        tipo: "deslizante",
        id: "velocidade_maxima",
        nome: "Velocidade normal",
        ajuda: "A velocidade do dia a dia do robô.",
        min: 120,
        max: 200,
        padrao: 200,
      },
      {
        tipo: "deslizante",
        id: "forca_giro",
        nome: "Força do giro",
        ajuda: "Quanto ele vira ao inclinar para o lado. Menor = curvas mais suaves.",
        min: 120,
        max: 200,
        padrao: 140,
      },
    ],
  },
  {
    id: "robo",
    titulo: "Robô",
    icone: "🤖",
    campos: [
      {
        tipo: "deslizante",
        id: "giro360",
        nome: "Tempo de uma volta completa",
        ajuda:
          "Quanto tempo o robô leva para girar 360°. A estrela e o quadrado dependem disso.",
        min: 800,
        max: 1600,
        padrao: 1100,
        passo: 10,
        unidade: "ms",
      },
      {
        tipo: "deslizante",
        id: "velocidade_coreografia",
        nome: "Velocidade das coreografias",
        ajuda: "A velocidade usada nas sequências dos botões.",
        min: 150,
        max: 200,
        padrao: 200,
      },
      {
        tipo: "sim_nao",
        id: "inverter_motor_esquerdo",
        nome: "Inverter motor esquerdo",
        ajuda: "Marque se o robô girar em vez de andar reto.",
        padrao: false,
      },
      {
        tipo: "sim_nao",
        id: "inverter_motor_direito",
        nome: "Inverter motor direito",
        ajuda: "Marque se o robô andar ao contrário.",
        padrao: false,
      },
      {
        tipo: "deslizante",
        id: "forca_motor_esquerdo",
        nome: "Força do motor esquerdo",
        ajuda: "Se o robô puxa para a direita, baixe este número.",
        min: 70,
        max: 100,
        padrao: 100,
      },
      {
        tipo: "deslizante",
        id: "forca_motor_direito",
        nome: "Força do motor direito",
        ajuda: "Se o robô puxa para a esquerda, baixe este número.",
        min: 70,
        max: 100,
        padrao: 100,
      },
    ],
  },
  {
    id: "avancados",
    titulo: "Ajustes avançados",
    icone: "🛠️",
    avancada: true,
    aviso: "Estes já vêm bem ajustados. Mexa só se souber o que está procurando.",
    campos: [
      {
        tipo: "deslizante",
        id: "zona_frente",
        nome: "Zona morta para frente e trás",
        ajuda: "Inclinação pequena que o controle ignora. Se o robô anda sozinho, aumente.",
        min: 40,
        max: 150,
        padrao: 80,
        passo: 5,
      },
      {
        tipo: "deslizante",
        id: "zona_curva",
        nome: "Zona morta para os lados",
        ajuda:
          "Precisa ser bem maior que a de frente. Se o robô puxa para um lado quando você quer ir reto, aumente este.",
        min: 100,
        max: 350,
        padrao: 180,
        passo: 5,
      },
      {
        tipo: "deslizante",
        id: "ritmo_envio",
        nome: "Ritmo de envio",
        ajuda:
          "Tempo entre dois comandos. Menor = resposta mais rápida, mas abaixo de 10 o rádio congestiona.",
        min: 10,
        max: 40,
        padrao: 15,
        unidade: "ms",
      },
      {
        tipo: "deslizante",
        id: "parada_perda_sinal",
        nome: "Parada por perda de sinal",
        ajuda: "Quanto tempo sem sinal até o robô parar sozinho.",
        min: 200,
        max: 800,
        padrao: 300,
        passo: 10,
        unidade: "ms",
      },
    ],
  },
];

/** Campos de ajuste que cada melhoria abre quando é escolhida. */
export const AJUSTES_MELHORIAS: Record<string, CampoAjuste[]> = {
  esquiva: [
    {
      tipo: "deslizante",
      id: "forca_esquiva",
      nome: "Força da esquiva",
      ajuda: "O quanto ele desvia para os lados. Alto demais e ele quase não sai do lugar.",
      min: 20,
      max: 120,
      padrao: 60,
    },
    {
      tipo: "deslizante",
      id: "tempo_lado",
      nome: "Tempo de cada lado",
      ajuda: "Quanto tempo ele puxa para um lado antes de trocar. Menor = serpente mais nervosa.",
      min: 150,
      max: 600,
      padrao: 320,
      passo: 10,
      unidade: "ms",
    },
  ],
  turbo: [
    {
      tipo: "deslizante",
      id: "duracao_turbo",
      nome: "Duração do turbo",
      ajuda: "Quanto tempo dura o empurrão.",
      min: 1000,
      max: 5000,
      padrao: 2500,
      passo: 100,
      unidade: "ms",
    },
    {
      tipo: "deslizante",
      id: "recarga",
      nome: "Recarga",
      ajuda: "Quanto tempo até poder usar de novo.",
      min: 3000,
      max: 10000,
      padrao: 5000,
      passo: 500,
      unidade: "ms",
    },
  ],
  marcha_lenta: [
    {
      tipo: "deslizante",
      id: "velocidade_lenta",
      nome: "Velocidade lenta",
      ajuda: "Quanto mais baixo, mais preciso e mais devagar.",
      min: 60,
      max: 180,
      padrao: 110,
    },
  ],
  contra_ataque: [
    {
      tipo: "deslizante",
      id: "sensibilidade_impacto",
      nome: "Sensibilidade ao impacto",
      ajuda: "Quanto menor, mais fácil disparar. Baixo demais e ele dispara sozinho ao acelerar.",
      min: 1200,
      max: 2500,
      padrao: 1700,
      passo: 50,
    },
    {
      tipo: "deslizante",
      id: "tempo_recuo",
      nome: "Tempo de recuo",
      ajuda: "Quanto ele anda para trás.",
      min: 300,
      max: 1000,
      padrao: 600,
      passo: 50,
      unidade: "ms",
    },
    {
      tipo: "deslizante",
      id: "angulo_giro",
      nome: "Ângulo do giro",
      ajuda: "Quanto ele vira depois de recuar.",
      min: 45,
      max: 180,
      padrao: 120,
      passo: 5,
      unidade: "graus",
    },
    {
      tipo: "deslizante",
      id: "descanso",
      nome: "Descanso",
      ajuda: "Tempo mínimo entre dois contra-ataques.",
      min: 1500,
      max: 5000,
      padrao: 2500,
      passo: 100,
      unidade: "ms",
    },
  ],
  arranque_suave: [
    {
      tipo: "deslizante",
      id: "suavidade",
      nome: "Suavidade",
      ajuda:
        "Quanto a velocidade muda a cada instante. Número menor = arranque mais suave e mais lento.",
      min: 5,
      max: 60,
      padrao: 20,
    },
  ],
  som_abertura: [],
  bipe_re: [
    {
      tipo: "deslizante",
      id: "altura_bipe",
      nome: "Altura do bipe",
      ajuda: "Grave ou agudo.",
      min: 400,
      max: 1500,
      padrao: 880,
      passo: 10,
      unidade: "Hz",
    },
    {
      tipo: "deslizante",
      id: "intervalo_bipe",
      nome: "Intervalo",
      ajuda: "Tempo entre um bipe e outro.",
      min: 150,
      max: 500,
      padrao: 230,
      passo: 10,
      unidade: "ms",
    },
  ],
};

export type ValoresAjustes = Record<string, number | boolean>;
export type AjustesMelhorias = Record<string, ValoresAjustes>;

export const TODOS_OS_CAMPOS: CampoAjuste[] = SECOES_AJUSTES.flatMap((s) => s.campos);

function limita(campo: CampoDeslizante, valor: number) {
  return Math.min(campo.max, Math.max(campo.min, valor));
}

/** Valor atual de um campo, caindo no padrão quando não houver nada guardado. */
export function valorDe(campo: CampoAjuste, guardados: ValoresAjustes | undefined) {
  const bruto = guardados?.[campo.id];
  if (campo.tipo === "sim_nao") {
    return typeof bruto === "boolean" ? bruto : campo.padrao;
  }
  return typeof bruto === "number" && Number.isFinite(bruto) ? limita(campo, bruto) : campo.padrao;
}

/** Número de um ajuste global, pelo id do campo. */
export function numeroAjuste(guardados: ValoresAjustes | undefined, id: string): number {
  const campo = TODOS_OS_CAMPOS.find((c) => c.id === id);
  if (!campo || campo.tipo !== "deslizante") return 0;
  const valor = valorDe(campo, guardados);
  return typeof valor === "number" ? valor : campo.padrao;
}

/** Ligado/desligado de um ajuste global, pelo id do campo. */
export function ligadoAjuste(guardados: ValoresAjustes | undefined, id: string): boolean {
  const campo = TODOS_OS_CAMPOS.find((c) => c.id === id);
  if (!campo || campo.tipo !== "sim_nao") return false;
  return valorDe(campo, guardados) === true;
}

/** Número de um ajuste de melhoria. */
export function numeroAjusteMelhoria(
  ajustes: AjustesMelhorias | undefined,
  melhoriaId: string,
  campoId: string,
): number {
  const campo = (AJUSTES_MELHORIAS[melhoriaId] ?? []).find((c) => c.id === campoId);
  if (!campo || campo.tipo !== "deslizante") return 0;
  const valor = valorDe(campo, ajustes?.[melhoriaId]);
  return typeof valor === "number" ? valor : campo.padrao;
}
