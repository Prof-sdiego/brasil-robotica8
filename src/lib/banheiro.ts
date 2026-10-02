// Fila do banheiro e presença do dia.
// Regras: uma pessoa fora por vez (por turma), intercalando os grupos, e cada aluno vai uma vez por aula.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

export type StatusFila = "fila" | "fora" | "voltou" | "cancelado";

export type ItemFila = {
  id: string;
  equipe_id: string;
  turma: string;
  nome_equipe: string;
  integrante_id: string;
  nome: string;
  dia: string;
  status: StatusFila;
  saiu_em: string | null;
  voltou_em: string | null;
  created_at: string;
};

export type Presenca = {
  id: string;
  equipe_id: string;
  turma: string;
  integrante_id: string;
  nome: string;
  dia: string;
  presente: boolean;
  marcado_por: string;
};

const db = supabase as unknown as { from: (t: string) => any };

/** Data de hoje no horário de Brasília (AAAA-MM-DD). */
export function hoje(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function useTempoReal(tabela: string, chave: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const canal = supabase
      .channel(`${tabela}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: tabela }, () => {
        void qc.invalidateQueries({ queryKey: [chave] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(canal);
    };
  }, [qc, tabela, chave]);
}

/** Fila de hoje (todas as turmas). */
export function useFila() {
  useTempoReal("fila_banheiro", "fila-banheiro");
  return useQuery({
    queryKey: ["fila-banheiro", hoje()],
    queryFn: async (): Promise<ItemFila[]> => {
      const { data, error } = await db.from("fila_banheiro").select("*").eq("dia", hoje()).order("created_at");
      if (error) throw error;
      return (data ?? []) as ItemFila[];
    },
    refetchInterval: 15000,
  });
}

export function usePresencas(dia?: string) {
  useTempoReal("presencas", "presencas");
  const d = dia ?? hoje();
  return useQuery({
    queryKey: ["presencas", d],
    queryFn: async (): Promise<Presenca[]> => {
      const { data, error } = await db.from("presencas").select("*").eq("dia", d);
      if (error) throw error;
      return (data ?? []) as Presenca[];
    },
  });
}

export function useRecarregarFila() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["fila-banheiro"] }),
      qc.invalidateQueries({ queryKey: ["presencas"] }),
      qc.invalidateQueries({ queryKey: ["banheiro-bloqueado"] }),
    ]);
}

/** Interruptor do professor: quando ligado, ninguém entra na fila. */
export function useBanheiroBloqueado() {
  useTempoReal("configuracoes", "banheiro-bloqueado");
  return useQuery({
    queryKey: ["banheiro-bloqueado"],
    queryFn: async (): Promise<boolean> => {
      const { data } = await db.from("configuracoes").select("valor").eq("chave", "bloquear_banheiro").maybeSingle();
      return data?.valor === true;
    },
    refetchInterval: 15000,
  });
}

export async function definirBanheiroBloqueado(valor: boolean) {
  const { error } = await db.from("configuracoes").upsert({
    chave: "bloquear_banheiro",
    valor,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/**
 * Ordem da fila de uma turma, intercalando os grupos:
 * um de cada grupo por rodada; o grupo de quem acabou de ir fica por último.
 */
export function ordemDaFila(itens: ItemFila[], turma: string): ItemFila[] {
  const daTurma = itens.filter((i) => i.turma === turma);
  const esperando = daTurma.filter((i) => i.status === "fila");
  const ultimo = daTurma
    .filter((i) => i.status === "fora" || i.status === "voltou")
    .sort((a, b) => (b.saiu_em ?? "").localeCompare(a.saiu_em ?? ""))[0];

  const grupos = new Map<string, ItemFila[]>();
  for (const item of esperando) {
    grupos.set(item.equipe_id, [...(grupos.get(item.equipe_id) ?? []), item]);
  }
  const ordemGrupos = Array.from(grupos.keys()).sort((a, b) => {
    if (ultimo && a === ultimo.equipe_id) return 1;
    if (ultimo && b === ultimo.equipe_id) return -1;
    return grupos.get(a)![0]!.created_at.localeCompare(grupos.get(b)![0]!.created_at);
  });

  const saida: ItemFila[] = [];
  let rodada = 0;
  while (saida.length < esperando.length) {
    for (const g of ordemGrupos) {
      const item = grupos.get(g)![rodada];
      if (item) saida.push(item);
    }
    rodada++;
  }
  return saida;
}

export function quemEstaFora(itens: ItemFila[], turma: string): ItemFila | null {
  return itens.find((i) => i.turma === turma && i.status === "fora") ?? null;
}

/** Se ninguém da turma está fora, manda o próximo da fila. */
async function avancar(turma: string) {
  const { data } = await db.from("fila_banheiro").select("*").eq("dia", hoje()).eq("turma", turma);
  const itens = (data ?? []) as ItemFila[];
  if (quemEstaFora(itens, turma)) return;
  const proximo = ordemDaFila(itens, turma)[0];
  if (!proximo) return;
  await db
    .from("fila_banheiro")
    .update({ status: "fora", saiu_em: new Date().toISOString() })
    .eq("id", proximo.id)
    .eq("status", "fila");
}

export async function entrarNaFila(dados: Pick<ItemFila, "equipe_id" | "turma" | "nome_equipe" | "integrante_id" | "nome">) {
  const { data: config } = await db.from("configuracoes").select("valor").eq("chave", "bloquear_banheiro").maybeSingle();
  if (config?.valor === true) throw new Error("O professor pausou as idas ao banheiro.");
  const { error } = await db.from("fila_banheiro").insert({ ...dados, dia: hoje() });
  if (error) {
    if (String(error.code) === "23505") throw new Error("Essa pessoa já foi (ou está na fila) hoje.");
    throw new Error("Não deu para colocar na fila.");
  }
  await avancar(dados.turma);
}

export async function marcarVoltou(item: ItemFila) {
  await db.from("fila_banheiro").update({ status: "voltou", voltou_em: new Date().toISOString() }).eq("id", item.id);
  await avancar(item.turma);
}

export async function tirarDaFila(item: ItemFila) {
  await db.from("fila_banheiro").update({ status: "cancelado" }).eq("id", item.id);
  if (item.status === "fora") await avancar(item.turma);
}

/** Professor manda alguém agora (quem está fora volta para a fila de espera). */
export async function mandarAgora(item: ItemFila, itens: ItemFila[]) {
  const fora = quemEstaFora(itens, item.turma);
  if (fora) await db.from("fila_banheiro").update({ status: "fila", saiu_em: null }).eq("id", fora.id);
  await db.from("fila_banheiro").update({ status: "fora", saiu_em: new Date().toISOString() }).eq("id", item.id);
}

export async function marcarPresenca(
  dados: Pick<Presenca, "equipe_id" | "turma" | "integrante_id" | "nome" | "presente" | "marcado_por">,
) {
  const { error } = await db
    .from("presencas")
    .upsert({ ...dados, dia: hoje() }, { onConflict: "equipe_id,integrante_id,dia" });
  if (error) throw new Error("Não deu para marcar a presença.");
}
