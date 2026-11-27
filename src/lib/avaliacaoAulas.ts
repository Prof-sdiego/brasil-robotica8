// Avaliação das aulas e do professor feita pelos grupos.
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const EIXOS = [
  {
    nome: "Aulas de Ciências",
    perguntas: [
      { id: "c1", texto: "Entendemos as explicações do professor." },
      { id: "c2", texto: "As aulas de Ciências nos deixam com vontade de aprender mais." },
      { id: "c3", texto: "Conseguimos relacionar o que aprendemos com coisas do dia a dia." },
      { id: "c4", texto: "As atividades e experimentos ajudam a entender a matéria." },
    ],
  },
  {
    nome: "Aulas de Robótica",
    perguntas: [
      { id: "r1", texto: "Entendemos o que precisa ser feito nas aulas de robótica." },
      { id: "r2", texto: "Todos da equipe participam, cada um na sua função." },
    ],
  },
  {
    nome: "Sobre o professor",
    perguntas: [
      { id: "p1", texto: "O professor tira nossas dúvidas quando perguntamos." },
      { id: "p2", texto: "Nos sentimos à vontade para pedir ajuda ou dizer que não entendemos." },
      { id: "p3", texto: "O professor organiza bem a aula e explica o que vamos fazer." },
      { id: "p4", texto: "O professor é justo na hora de avaliar e corrigir." },
      { id: "p5", texto: "Recomendaríamos as aulas dele para um colega." },
    ],
  },
] as const;

export const ABERTAS = [
  { id: "gosta", texto: "O que o grupo mais gosta nas aulas?" },
  { id: "mudaria", texto: "O que o grupo mudaria nas aulas?" },
  { id: "recado", texto: "Deixem um recado ou sugestão para o professor." },
] as const;

export const ESCALA = [
  { valor: 1, nome: "Discordo totalmente", emoji: "😞" },
  { valor: 2, nome: "Discordo", emoji: "🙁" },
  { valor: 3, nome: "Mais ou menos", emoji: "😐" },
  { valor: 4, nome: "Concordo", emoji: "🙂" },
  { valor: 5, nome: "Concordo totalmente", emoji: "😄" },
] as const;

export const TODAS_PERGUNTAS: { id: string; texto: string }[] = EIXOS.flatMap((e) => [...e.perguntas]);

export type RespostaAulas = {
  equipe_id: string; turma: string; nome_equipe: string;
  notas: Record<string, number>; textos: Record<string, string>; created_at: string;
};

export function mediaPergunta(respostas: RespostaAulas[], id: string): number | null {
  const v = respostas.map((r) => r.notas[id]).filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export function mediaEixo(respostas: RespostaAulas[], ids: readonly string[]): number | null {
  const v = ids.map((id) => mediaPergunta(respostas, id)).filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

const rpc = supabase.rpc.bind(supabase) as unknown as (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;

export function useAvaliacaoAulasEnviada(codigo: string | null) {
  return useQuery({
    queryKey: ["avaliacao-aulas-enviada", codigo],
    enabled: !!codigo,
    queryFn: async () => (await rpc("aluno_avaliacao_aulas_enviada", { _codigo: codigo ?? "" })).data === true,
  });
}

export function useRecarregarAulasEnviada() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["avaliacao-aulas-enviada"] });
}

export async function enviarAvaliacaoAulas(codigo: string, notas: Record<string, number>, textos: Record<string, string>) {
  const { error } = await rpc("aluno_enviar_avaliacao_aulas", { _codigo: codigo, _notas: notas, _textos: textos });
  if (error) throw new Error("Não foi possível enviar. Talvez o grupo já tenha respondido.");
}

export function useRespostasAulas(senha: string | null) {
  return useQuery({
    queryKey: ["respostas-aulas"],
    enabled: !!senha,
    queryFn: async (): Promise<RespostaAulas[]> => {
      const { data, error } = await rpc("professor_listar_avaliacao_aulas", { _senha: senha ?? "" });
      if (error) throw new Error("Não foi possível ler as respostas.");
      return (data ?? []) as RespostaAulas[];
    },
  });
}
