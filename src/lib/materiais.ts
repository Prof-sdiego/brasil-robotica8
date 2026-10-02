// Pedidos de material: o professor cadastra os materiais, as equipes pedem.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

export type Material = {
  id: string;
  nome: string;
  quantidade_padrao: number;
  /** Quantos a equipe pode ter ao mesmo tempo (null = sem limite). */
  limite_ativo: number | null;
  uma_vez: boolean;
  precisa_devolver: boolean;
  cores: string[];
  ativo: boolean;
  created_at: string;
};

export type StatusPedido = "pendente" | "entregue" | "recusado" | "devolvido";

export type Pedido = {
  id: string;
  material_id: string;
  material_nome: string;
  equipe_id: string;
  turma: string;
  nome_equipe: string;
  pedido_por: string;
  quantidade: number;
  cor: string | null;
  status: StatusPedido;
  visto: boolean;
  created_at: string;
  /** Troca: pedido (cor) que a equipe vai devolver ao receber este. */
  devolve_pedido_id?: string | null;
  devolve_cor?: string | null;
};

export const NOME_STATUS: Record<StatusPedido, string> = {
  pendente: "Esperando o professor",
  entregue: "Entregue",
  recusado: "Recusado",
  devolvido: "Devolvido",
};

const db = supabase as unknown as { from: (t: string) => any; channel: typeof supabase.channel; removeChannel: typeof supabase.removeChannel };

export function useMateriais() {
  return useQuery({
    queryKey: ["materiais"],
    queryFn: async (): Promise<Material[]> => {
      const { data, error } = await db.from("materiais").select("*").order("created_at");
      if (error) throw error;
      return (data ?? []) as Material[];
    },
  });
}

export function usePedidos(equipeId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const canal = db
      .channel(`pedidos-${equipeId ?? "todos"}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos_material" }, () => {
        void qc.invalidateQueries({ queryKey: ["pedidos"] });
      })
      .subscribe();
    return () => {
      void db.removeChannel(canal);
    };
  }, [qc, equipeId]);
  return useQuery({
    queryKey: ["pedidos", equipeId ?? "todos"],
    queryFn: async (): Promise<Pedido[]> => {
      let q = db.from("pedidos_material").select("*").order("created_at", { ascending: false });
      if (equipeId) q = q.eq("equipe_id", equipeId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Pedido[];
    },
    refetchInterval: 15000,
  });
}

export function useRecarregarMateriais() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["materiais"] }),
      qc.invalidateQueries({ queryKey: ["pedidos"] }),
      qc.invalidateQueries({ queryKey: ["pedidos-bloqueados"] }),
    ]);
}

/** Pedidos que ainda contam (não recusados nem devolvidos). */
function ativos(pedidos: Pedido[], materialId: string) {
  return pedidos.filter(
    (p) => p.material_id === materialId && (p.status === "pendente" || p.status === "entregue"),
  );
}

/** Por que a equipe não pode pedir agora (ou null se pode). */
export function bloqueioDoPedido(material: Material, pedidos: Pedido[], quantas = 1): string | null {
  const daEquipe = pedidos.filter((p) => p.material_id === material.id);
  if (material.uma_vez && daEquipe.some((p) => p.status !== "recusado")) {
    return "Este material só pode ser pedido uma vez.";
  }
  if (material.limite_ativo !== null) {
    const emUso = ativos(pedidos, material.id).reduce((s, p) => s + (material.cores.length ? 1 : p.quantidade), 0);
    if (emUso + quantas > material.limite_ativo) {
      return material.precisa_devolver
        ? `Vocês já têm ${emUso} de ${material.limite_ativo}. Devolvam ao professor para pedir mais.`
        : `O limite é ${material.limite_ativo}.`;
    }
  }
  return null;
}

export function quantosEmUso(material: Material, pedidos: Pedido[]): number {
  return ativos(pedidos, material.id).reduce((s, p) => s + (material.cores.length ? 1 : p.quantidade), 0);
}

export async function fazerPedidos(linhas: Omit<Pedido, "id" | "status" | "visto" | "created_at">[]) {
  const { error } = await db.from("pedidos_material").insert(linhas);
  if (error) throw error;
}

export async function mudarPedido(id: string, dados: Partial<Pick<Pedido, "status" | "visto">>) {
  const { error } = await db.from("pedidos_material").update(dados).eq("id", id);
  if (error) throw error;
}

export async function marcarTodosVistos() {
  const { error } = await db.from("pedidos_material").update({ visto: true }).eq("visto", false);
  if (error) throw error;
}

export async function salvarMaterial(dados: Partial<Material> & { nome: string }) {
  const { id, created_at: _c, ...resto } = dados;
  const { error } = id
    ? await db.from("materiais").update(resto).eq("id", id)
    : await db.from("materiais").insert(resto);
  if (error) throw error;
}

export async function apagarMaterial(id: string) {
  const { error } = await db.from("materiais").delete().eq("id", id);
  if (error) throw error;
}

/** Cores já entregues à equipe que ainda não estão em troca pendente. */
export function coresParaDevolver(material: Material, pedidos: Pedido[]): Pedido[] {
  const emTroca = new Set(
    pedidos.filter((p) => p.status === "pendente" && p.devolve_pedido_id).map((p) => p.devolve_pedido_id),
  );
  return pedidos.filter((p) => p.material_id === material.id && p.status === "entregue" && p.cor && !emTroca.has(p.id));
}

/** Toca uma campainha alta (ding-dong) duas vezes. */
export function tocarCampainha() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const nota = (freq: number, inicio: number) => {
      for (const [mult, vol] of [[1, 1], [2, 0.4], [3, 0.2]] as const) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq * mult;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + inicio);
        g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + inicio + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + 1.2);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + inicio);
        o.stop(ctx.currentTime + inicio + 1.3);
      }
    };
    nota(880, 0); nota(698, 0.5); nota(880, 1.4); nota(698, 1.9);
    setTimeout(() => void ctx.close(), 3500);
  } catch {
    /* sem som disponível */
  }
}

/** Interruptor do professor: quando ligado, nenhuma equipe faz pedidos novos. */
export function usePedidosBloqueados() {
  const qc = useQueryClient();
  useEffect(() => {
    const canal = db
      .channel(`config-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "configuracoes" }, () => {
        void qc.invalidateQueries({ queryKey: ["pedidos-bloqueados"] });
      })
      .subscribe();
    return () => {
      void db.removeChannel(canal);
    };
  }, [qc]);
  return useQuery({
    queryKey: ["pedidos-bloqueados"],
    queryFn: async (): Promise<boolean> => {
      const { data } = await db.from("configuracoes").select("valor").eq("chave", "bloquear_pedidos").maybeSingle();
      return data?.valor === true;
    },
    refetchInterval: 15000,
  });
}

export async function definirPedidosBloqueados(valor: boolean) {
  const { error } = await db.from("configuracoes").upsert({ chave: "bloquear_pedidos", valor, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Materiais que não entram na lista "com as equipes" (gastam e não voltam). */
export function ficaForaDoHistorico(nome: string) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("papelao");
}
