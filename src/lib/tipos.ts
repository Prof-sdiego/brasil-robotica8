// Tipos do modelo de dados da Oficina de Robótica.

export type Papel =
  | "Piloto"
  | "Copiloto"
  | "Engenheiro"
  | "Programador"
  | "Ajudante"
  | "Designer";

export type Botao = "A" | "B" | "AB";

/** Especialidade do Ajudante, escolhida pelo programador. */
export type Especialidade = "programacao" | "engenharia" | "design";

export type Integrante = {
  id: string;
  nome: string;
  papel: Papel;
  /** Código pessoal de 4 caracteres. Vazio = o site usa o código derivado do id. */
  codigo?: string;
  /** Só para Ajudante: o que ele vê e edita. */
  especialidade?: Especialidade;
};

export type MovimentoNaSequencia = {
  id: string;
  movimentoId: string;
  params: number[];
};

export type Coreografia = {
  gatilho: Botao;
  movimentos: MovimentoNaSequencia[];
};

export type ItemChecklist = {
  id: string;
  marcado: boolean;
  marcadoPor: string;
  marcadoEm: string | null;
  observacao: string;
};

export type Equipe = {
  id: string;
  codigoAcesso: string;
  turma: string;
  nomeEquipe: string;
  grupoRadio: number;
  sensibilidade: number;
  modoPilotagem: string;
  senhaRobo: string;
  nomeMicrobit: string;
  atribuicaoBotoes: Partial<Record<Botao, string>>;
  ajustes: Record<string, number | boolean>;
  ajustesMelhorias: Record<string, Record<string, number | boolean>>;
  ajustesAtualizadosEm: string | null;
  codigoCopiadoEm: string | null;
  avisoCatalogo: boolean;
  melhorias: string[];
  melodiaAbertura: string | null;
  coreografias: Coreografia[];
  integrantes: Integrante[];
  checklist: ItemChecklist[];
  justificativa: string;
  codigoGerado: boolean;
  atualizadoEm: string;
};

export type EquipeEditavel = Partial<
  Pick<
    Equipe,
    | "sensibilidade"
    | "modoPilotagem"
    | "nomeMicrobit"
    | "atribuicaoBotoes"
    | "ajustes"
    | "ajustesMelhorias"
    | "ajustesAtualizadosEm"
    | "codigoCopiadoEm"
    | "avisoCatalogo"
    | "melhorias"
    | "melodiaAbertura"
    | "coreografias"
    | "integrantes"
    | "checklist"
    | "justificativa"
    | "codigoGerado"
  >
>;
