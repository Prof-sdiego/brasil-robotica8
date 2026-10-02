// Avaliação do professor: observações, ocorrências e a avaliação do grupo a cada 2 semanas.
// Tudo passa por funções do banco protegidas pela senha do professor.

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type TipoRegistro = "observacao" | "ocorrencia" | "avaliacao";

export type Registro = {
  id: string;
  tipo: TipoRegistro;
  equipe_id: string;
  turma: string;
  integrante_id: string | null;
  integrante_nome: string;
  ciclo: number | null;
  dados: Record<string, unknown>;
  texto: string;
  created_at: string;
};

export type RegistroNovo = Omit<Registro, "id" | "created_at">;

/** Ordem das aulas da semana. */
export const ORDEM_TURMAS = ["8A", "8C", "8B"];

export function ordenarTurmas(turmas: string[]): string[] {
  return [...turmas].sort((a, b) => {
    const ia = ORDEM_TURMAS.indexOf(a);
    const ib = ORDEM_TURMAS.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
}

export const CRITERIOS_GRUPO = [
  { id: "comportamento", nome: "Comportamento" },
  { id: "comprometimento", nome: "Comprometimento" },
  { id: "avanco", nome: "Avanço real do grupo" },
  { id: "equipe", nome: "Trabalho em equipe" },
] as const;

export const OCORRENCIAS = [
  "Conversar fora de hora",
  "Gritar",
  "Andar pela sala",
  "Não ajudar no grupo",
  "Usar o celular sem permissão",
  "Desrespeitar um colega",
  "Mexer no material de outro grupo",
  "Brincadeira que atrapalha a aula",
  "Não trouxe o material",
];

/** Quanto cada ocorrência tira da nota (planilha à parte). */
export const DESCONTO_POR_OCORRENCIA = 0.5;

// Ciclos de 2 semanas a partir de segunda, 28/09/2026.
const INICIO = new Date("2026-09-28T00:00:00-03:00").getTime();
const DUAS_SEMANAS = 14 * 24 * 60 * 60 * 1000;

export function cicloAtual(agora = Date.now()): number {
  return Math.max(0, Math.floor((agora - INICIO) / DUAS_SEMANAS));
}

export function datasDoCiclo(ciclo: number): string {
  const ini = new Date(INICIO + ciclo * DUAS_SEMANAS);
  const fim = new Date(INICIO + (ciclo + 1) * DUAS_SEMANAS - 24 * 60 * 60 * 1000);
  const f = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${f(ini)} a ${f(fim)}`;
}

/** Ciclos (até o atual) em que a equipe ainda não foi avaliada. */
export function ciclosPendentes(equipeId: string, registros: Registro[], atual = cicloAtual()): number[] {
  const feitos = new Set(
    registros.filter((r) => r.tipo === "avaliacao" && r.equipe_id === equipeId).map((r) => r.ciclo),
  );
  const saida: number[] = [];
  for (let c = 0; c <= atual; c++) if (!feitos.has(c)) saida.push(c);
  return saida;
}

export function notaDoGrupo(r: Registro): number | null {
  const valores = CRITERIOS_GRUPO.map((c) => r.dados[c.id]).filter(
    (v): v is number => typeof v === "number",
  );
  if (valores.length === 0) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function useRegistros(senha: string | null) {
  return useQuery({
    queryKey: ["professor-registros"],
    queryFn: async (): Promise<Registro[]> => {
      const { data, error } = await supabase.rpc("professor_listar_registros", { _senha: senha ?? "" });
      if (error) throw new Error("Não foi possível ler os registros.");
      return (data ?? []) as unknown as Registro[];
    },
    enabled: !!senha,
  });
}

export function useRecarregarRegistros() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["professor-registros"] });
}

export async function salvarRegistros(senha: string, linhas: RegistroNovo[]) {
  if (linhas.length === 0) return;
  const { error } = await supabase.rpc("professor_salvar_registros", {
    _senha: senha,
    _linhas: linhas as never,
  });
  if (error) throw new Error("Não foi possível guardar.");
}

export async function apagarRegistro(senha: string, id: string) {
  const { error } = await supabase.rpc("professor_apagar_registro", { _senha: senha, _id: id });
  if (error) throw new Error("Não foi possível apagar.");
}
