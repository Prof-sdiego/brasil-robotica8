import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";
import { ITENS_CHECKLIST } from "./catalogo";
import type { Equipe, EquipeEditavel, ItemChecklist } from "./tipos";

type LinhaEquipe = {
  id: string;
  codigo_acesso: string;
  turma: string;
  nome_equipe: string;
  grupo_radio: number;
  sensibilidade: number;
  melhorias: unknown;
  melodia_abertura: string | null;
  coreografias: unknown;
  integrantes: unknown;
  checklist: unknown;
  justificativa: string;
  codigo_gerado: boolean;
  updated_at: string;
};

function lista<T>(valor: unknown): T[] {
  return Array.isArray(valor) ? (valor as T[]) : [];
}

export function checklistCompleto(itens: ItemChecklist[]): ItemChecklist[] {
  return ITENS_CHECKLIST.map((definicao) => {
    const existente = itens.find((item) => item.id === definicao.id);
    return (
      existente ?? {
        id: definicao.id,
        marcado: false,
        marcadoPor: "",
        marcadoEm: null,
        observacao: "",
      }
    );
  });
}

function paraEquipe(linha: LinhaEquipe): Equipe {
  return {
    id: linha.id,
    codigoAcesso: linha.codigo_acesso,
    turma: linha.turma,
    nomeEquipe: linha.nome_equipe,
    grupoRadio: linha.grupo_radio,
    sensibilidade: linha.sensibilidade,
    melhorias: lista<string>(linha.melhorias),
    melodiaAbertura: linha.melodia_abertura,
    coreografias: lista(linha.coreografias),
    integrantes: lista(linha.integrantes),
    checklist: checklistCompleto(lista<ItemChecklist>(linha.checklist)),
    justificativa: linha.justificativa ?? "",
    codigoGerado: linha.codigo_gerado,
    atualizadoEm: linha.updated_at,
  };
}

function paraLinha(dados: EquipeEditavel) {
  return {
    ...(dados.sensibilidade !== undefined ? { sensibilidade: dados.sensibilidade } : {}),
    ...(dados.melhorias !== undefined ? { melhorias: dados.melhorias } : {}),
    ...(dados.melodiaAbertura !== undefined ? { melodia_abertura: dados.melodiaAbertura } : {}),
    ...(dados.coreografias !== undefined
      ? { coreografias: dados.coreografias as unknown as never }
      : {}),
    ...(dados.integrantes !== undefined
      ? { integrantes: dados.integrantes as unknown as never }
      : {}),
    ...(dados.checklist !== undefined ? { checklist: dados.checklist as unknown as never } : {}),
    ...(dados.justificativa !== undefined ? { justificativa: dados.justificativa } : {}),
    ...(dados.codigoGerado !== undefined ? { codigo_gerado: dados.codigoGerado } : {}),
  };
}

const CAMPOS =
  "id, codigo_acesso, turma, nome_equipe, grupo_radio, sensibilidade, melhorias, melodia_abertura, coreografias, integrantes, checklist, justificativa, codigo_gerado, updated_at";

export async function buscarEquipePorCodigo(codigo: string): Promise<Equipe | null> {
  const { data, error } = await supabase
    .from("equipes")
    .select(CAMPOS)
    .eq("codigo_acesso", codigo.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data ? paraEquipe(data as LinhaEquipe) : null;
}

export async function listarEquipes(): Promise<Equipe[]> {
  const { data, error } = await supabase
    .from("equipes")
    .select(CAMPOS)
    .order("turma")
    .order("nome_equipe");
  if (error) throw error;
  return (data as LinhaEquipe[]).map(paraEquipe);
}

export function useEquipe(codigo: string | null) {
  return useQuery({
    queryKey: ["equipe", codigo],
    queryFn: () => buscarEquipePorCodigo(codigo as string),
    enabled: Boolean(codigo),
    staleTime: 10_000,
  });
}

export function useEquipes() {
  return useQuery({ queryKey: ["equipes"], queryFn: listarEquipes });
}

/** Salvamento automático: aplica na hora na tela e grava no banco com atraso curto. */
export function useSalvarEquipe(codigo: string | null) {
  const queryClient = useQueryClient();
  const pendente = useRef<EquipeEditavel>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: async (dados: EquipeEditavel) => {
      if (!codigo) return;
      const { error } = await supabase
        .from("equipes")
        .update(paraLinha(dados))
        .eq("codigo_acesso", codigo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipes"] });
    },
  });

  const enviar = useCallback(() => {
    const dados = pendente.current;
    pendente.current = {};
    if (Object.keys(dados).length > 0) mutation.mutate(dados);
  }, [mutation]);

  const salvar = useCallback(
    (dados: EquipeEditavel) => {
      if (!codigo) return;
      queryClient.setQueryData(["equipe", codigo], (atual: Equipe | undefined) =>
        atual ? { ...atual, ...dados, atualizadoEm: new Date().toISOString() } : atual,
      );
      pendente.current = { ...pendente.current, ...dados };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(enviar, 600);
    },
    [codigo, enviar, queryClient],
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { salvar, salvando: mutation.isPending };
}

/** Gravação imediata (sem espera), para quando a tela vai trocar em seguida. */
export async function salvarEquipeAgora(codigo: string, dados: EquipeEditavel) {
  const { error } = await supabase
    .from("equipes")
    .update(paraLinha(dados))
    .eq("codigo_acesso", codigo.trim().toUpperCase());
  if (error) throw error;
}

export function gerarCodigoAcesso(nome: string): string {
  const base =
    (nome || "EQUIPE")
      .normalize("NFD")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 5) || "EQUIPE";
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let sufixo = "";
  for (let i = 0; i < 4; i += 1) {
    sufixo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `${base}-${sufixo}`;
}

export async function criarEquipes(
  equipes: { turma: string; nomeEquipe: string; grupoRadio: number; codigoAcesso: string }[],
) {
  const { error } = await supabase.from("equipes").insert(
    equipes.map((e) => ({
      turma: e.turma,
      nome_equipe: e.nomeEquipe,
      grupo_radio: e.grupoRadio,
      codigo_acesso: e.codigoAcesso.toUpperCase(),
    })),
  );
  if (error) throw error;
}

export async function atualizarCadastro(
  id: string,
  dados: { turma: string; nomeEquipe: string; grupoRadio: number; codigoAcesso: string },
) {
  const { error } = await supabase
    .from("equipes")
    .update({
      turma: dados.turma,
      nome_equipe: dados.nomeEquipe,
      grupo_radio: dados.grupoRadio,
      codigo_acesso: dados.codigoAcesso.toUpperCase(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function removerEquipe(id: string) {
  const { error } = await supabase.from("equipes").delete().eq("id", id);
  if (error) throw error;
}
