// Tipos do modelo de dados da Oficina de Robótica.

export type Papel = "Piloto" | "Copiloto" | "Engenheiro" | "Programador" | "Staff";

export type Integrante = {
  id: string;
  nome: string;
  papel: Papel;
};

export type MovimentoNaSequencia = {
  id: string;
  movimentoId: string;
  params: number[];
};

export type Coreografia = {
  gatilho: "A" | "B" | "AB";
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
    | "melhorias"
    | "melodiaAbertura"
    | "coreografias"
    | "integrantes"
    | "checklist"
    | "justificativa"
    | "codigoGerado"
  >
>;
