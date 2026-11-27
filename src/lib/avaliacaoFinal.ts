// Avaliação final do professor: regras de pontuação.
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const ITENS_DESENVOLVIMENTO = [
  { id: "medidas", nome: "O chassi respeita as medidas", pontos: 2 },
  { id: "pintado", nome: "O chassi está completamente pintado", pontos: 2 },
  { id: "apoio", nome: "Possui o apoio de suporte frontal", pontos: 2 },
  { id: "microbit", nome: "Há espaço para o micro:bit", pontos: 2 },
  { id: "palitos", nome: "Já está com os palitos", pontos: 2 },
  { id: "motores", nome: "Está com motores (ponto extra)", pontos: 1 },
] as const;

export const ITENS_ACABAMENTO = [
  {
    id: "pintura",
    nome: "Pintura",
    criterios: [
      "Cobre o chassi por igual, sem falhas nem borrões",
      "As cores combinam entre si e fazem sentido com a ideia do robô",
      "Detalhes e desenhos estão caprichados e bem delimitados",
    ],
  },
  {
    id: "acabamento",
    nome: "Acabamento",
    criterios: [
      "Cortes e bordas retos, sem rebarbas de papelão",
      "Colagem limpa, sem excesso ou fios de cola quente",
      "Peças firmes, nada solto ou torto",
    ],
  },
] as const;

export const ITENS_ENGENHARIA = [
  { id: "design", nome: "Construção de soluções para adequar o design" },
  { id: "protecao", nome: "Preocupação em proteger o micro:bit" },
  { id: "estabilizacao", nome: "Preocupação com estabilização" },
  { id: "suporte", nome: "Desenvolvimento eficiente no suporte frontal" },
] as const;

export const NIVEIS_ENGENHARIA = [
  { valor: 10, nome: "Atende plenamente" },
  { valor: 5, nome: "Atende parcialmente" },
  { valor: 0, nome: "Não atende" },
] as const;

export const ITEM_EQUIPE = "A equipe trabalhou de forma coesa e objetiva, sem desperdiçar tempo";

export const MEDIDAS = [
  { id: "altura", nome: "Altura" },
  { id: "largura_traseira", nome: "Largura traseira" },
  { id: "largura_meio", nome: "Largura do meio" },
  { id: "largura_dianteira", nome: "Largura dianteira" },
  { id: "comprimento", nome: "Comprimento" },
] as const;

export type DadosFinal = {
  medidas?: Record<string, string>;
  desenvolvimento: Record<string, boolean>;
  acabamento: Record<string, number | null>;
  engenharia: Record<string, number | null>;
  equipe: number | null;
};

export type NotasFinal = {
  desenvolvimento: number;
  acabamento: number | null;
  engenharia: number | null;
  equipe: number | null;
};

export const DADOS_VAZIOS: DadosFinal = { desenvolvimento: {}, acabamento: {}, engenharia: {}, equipe: null };

function media(valores: (number | null | undefined)[]): number | null {
  const v = valores.filter((x): x is number => typeof x === "number");
  return v.length === 0 ? null : v.reduce((a, b) => a + b, 0) / v.length;
}

export function calcularNotas(d: DadosFinal): NotasFinal {
  const desenvolvimento = ITENS_DESENVOLVIMENTO.reduce((s, i) => s + (d.desenvolvimento[i.id] ? i.pontos : 0), 0);
  return {
    desenvolvimento,
    acabamento: media(ITENS_ACABAMENTO.map((i) => d.acabamento[i.id])),
    engenharia: media(ITENS_ENGENHARIA.map((i) => d.engenharia[i.id])),
    equipe: d.equipe,
  };
}

/** Média geral dos 4 critérios (no máximo 10, mesmo com o ponto extra). */
export function mediaGeral(n: NotasFinal): number | null {
  const m = media([n.desenvolvimento, n.acabamento, n.engenharia, n.equipe]);
  return m === null ? null : Math.min(10, m);
}

/** Tudo preenchido para poder finalizar. */
export function completo(d: DadosFinal): boolean {
  return (
    ITENS_ACABAMENTO.every((i) => typeof d.acabamento[i.id] === "number") &&
    ITENS_ENGENHARIA.every((i) => typeof d.engenharia[i.id] === "number") &&
    typeof d.equipe === "number"
  );
}

export function formatar(n: number | null | undefined): string {
  return typeof n === "number" ? n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—";
}

export type LinhaFinal = { equipe_id: string; dados: DadosFinal; notas: NotasFinal; media: number | null; finalizada: boolean };

const rpc = supabase.rpc.bind(supabase) as unknown as (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;

export function useAvaliacoesFinais(senha: string | null) {
  return useQuery({
    queryKey: ["avaliacao-final"],
    enabled: !!senha,
    queryFn: async (): Promise<LinhaFinal[]> => {
      const { data, error } = await rpc("professor_listar_final", { _senha: senha ?? "" });
      if (error) throw new Error("Não foi possível ler as avaliações finais.");
      return ((data ?? []) as LinhaFinal[]).map((l) => ({ ...l, media: l.media === null ? null : Number(l.media) }));
    },
  });
}

export function useRecarregarFinais() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["avaliacao-final"] });
}

export async function salvarFinal(senha: string, equipeId: string, dados: DadosFinal, finalizada: boolean) {
  const notas = calcularNotas(dados);
  const { error } = await rpc("professor_salvar_final", {
    _senha: senha, _equipe_id: equipeId, _dados: dados, _notas: notas, _media: mediaGeral(notas), _finalizada: finalizada,
  });
  if (error) throw new Error("Não foi possível guardar a avaliação.");
}

export function useNotaFinalEquipe(codigo: string | null) {
  return useQuery({
    queryKey: ["nota-final", codigo],
    enabled: !!codigo,
    queryFn: async (): Promise<{ notas: NotasFinal; media: number | null } | null> => {
      const { data } = await rpc("aluno_nota_final", { _codigo: codigo ?? "" });
      const linha = (data as { notas: NotasFinal; media: number | null }[] | null)?.[0];
      return linha ? { notas: linha.notas, media: linha.media === null ? null : Number(linha.media) } : null;
    },
  });
}
