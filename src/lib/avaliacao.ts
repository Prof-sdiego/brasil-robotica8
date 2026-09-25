// Avaliação entre colegas (3º bimestre). Feita pelo celular do programador:
// o site chama um integrante por vez, confere quem é pelo RA e por uma pergunta
// sobre a data de nascimento, e guarda as notas. As notas nunca voltam a aparecer.

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";


export const BIMESTRE = 3;

export type Criterio = { id: "participacao" | "organizacao" | "colaboracao"; nome: string; ajuda: string };

export const CRITERIOS: Criterio[] = [
  {
    id: "participacao",
    nome: "Participação",
    ajuda: "Apareceu, ajudou nas tarefas e deu ideias.",
  },
  {
    id: "organizacao",
    nome: "Organização",
    ajuda: "Trouxe o material, cuidou das peças e cumpriu prazos.",
  },
  {
    id: "colaboracao",
    nome: "Colaboração com a equipe",
    ajuda: "Ouviu, dividiu o trabalho e ajudou quem estava travado.",
  },
];

export type Aluno = {
  id: string;
  ra: string;
  nome: string;
  nascimento: string | null;
  turma: string;
};

export type Avaliacao = {
  id: string;
  rodadaId: string;
  equipeId: string;
  turma: string;
  avaliadorId: string;
  avaliadorNome: string;
  avaliadorRa: string;
  avaliadoId: string;
  avaliadoNome: string;
  participacao: number | null;
  organizacao: number | null;
  colaboracao: number | null;
};

export type Falta = { integranteId: string; nome: string };

/** Média dos critérios preenchidos. Se a pessoa não foi avaliada, devolve null. */
export function media(
  av: Pick<Avaliacao, "participacao" | "organizacao" | "colaboracao">,
): number | null {
  const notas = [av.participacao, av.organizacao, av.colaboracao].filter(
    (n): n is number => typeof n === "number",
  );
  if (notas.length === 0) return null;
  return notas.reduce((total, valor) => total + valor, 0) / notas.length;
}

// ---------- lista de alunos (RA, nome, nascimento) ----------

export function useAlunos(senhaProfessor: string | null) {
  return useQuery({
    queryKey: ["alunos"],
    queryFn: async (): Promise<Aluno[]> => {
      const { data, error } = await supabase.rpc("professor_listar_alunos", {
        _senha: senhaProfessor ?? "",
      });
      if (error) throw new Error("Não foi possível ler a lista.");
      return (data ?? []) as Aluno[];
    },
    enabled: !!senhaProfessor,
  });
}

/** Aceita o RA com ou sem os zeros da frente, e com ou sem o dígito do fim. */
export function acharAlunoPorRa(alunos: Aluno[], digitado: string): Aluno | null {
  const alvo = soDigitos(digitado).replace(/^0+/, "");
  if (alvo.length < 5) return null;
  return (
    alunos.find((aluno) => {
      const ra = aluno.ra.replace(/^0+/, "");
      return ra === alvo || alvo.startsWith(ra) || ra.startsWith(alvo);
    }) ?? null
  );
}

export function soDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export type LinhaImportada = { ra: string; nome: string; nascimento: string | null; turma: string };

/**
 * Lê a lista colada. Uma pessoa por linha, separada por tabulação, ponto e vírgula ou vírgula:
 * RA, nome, data de nascimento (dd/mm/aaaa) e turma (opcional).
 */
export function lerListaDeAlunos(texto: string): { linhas: LinhaImportada[]; ignoradas: number } {
  const linhas: LinhaImportada[] = [];
  let ignoradas = 0;
  for (const bruta of texto.split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha) continue;
    const partes = linha.split(/\t|;|,/).map((p) => p.trim());
    const ra = soDigitos(partes.find((p) => soDigitos(p).length >= 4) ?? "");
    const nome = partes.find((p) => /[A-Za-zÀ-ÿ]{3}/.test(p) && !/^\d/.test(p)) ?? "";
    const data = partes.find((p) => /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(p)) ?? "";
    const turma = partes.find((p) => /^\d[ºo]?\s*[A-Ca-c]$|^[8]?[A-Ca-c]$/.test(p)) ?? "";
    if (!ra || !nome) {
      ignoradas += 1;
      continue;
    }
    linhas.push({ ra, nome, nascimento: paraDataISO(data), turma: turma.toUpperCase() });
  }
  return { linhas, ignoradas };
}

function paraDataISO(data: string): string | null {
  const partes = data.split(/[/-]/).map((p) => p.trim());
  if (partes.length !== 3) return null;
  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  let ano = Number(partes[2]);
  if (!dia || !mes || !ano) return null;
  if (ano < 100) ano += 2000;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export async function salvarAlunos(senhaProfessor: string, linhas: LinhaImportada[]) {
  if (linhas.length === 0) return;
  const { error } = await supabase.rpc("professor_salvar_alunos", {
    _senha: senhaProfessor,
    _linhas: linhas,
  });
  if (error) throw new Error("Não foi possível guardar a lista.");
}

async function listarTodasAvaliacoes(senha: string): Promise<Avaliacao[]> {
  const { data, error } = await supabase.rpc("professor_listar_avaliacoes", { _senha: senha });
  if (error) throw new Error("Não foi possível ler as notas.");
  return (data ?? []).map((l) => ({
    id: l.id,
    rodadaId: l.rodada_id ?? "",
    equipeId: l.equipe_id,
    turma: l.turma,
    avaliadorId: l.avaliador_id,
    avaliadorNome: l.avaliador_nome,
    avaliadorRa: l.avaliador_ra,
    avaliadoId: l.avaliado_id,
    avaliadoNome: l.avaliado_nome,
    participacao: l.participacao,
    organizacao: l.organizacao,
    colaboracao: l.colaboracao,
  }));
}

// ---------- conferência de identidade ----------

export type Pergunta = { tipo: "dia" | "mes" | "ano" | "completa"; texto: string };

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function sortearPergunta(): Pergunta {
  const tipos: Pergunta["tipo"][] = ["dia", "mes", "ano"];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)]!;
  if (tipo === "dia") return { tipo, texto: "Em que dia do mês você nasceu? (só o número)" };
  if (tipo === "mes") return { tipo, texto: "Em que mês você nasceu? (nome ou número)" };
  return { tipo, texto: "Em que ano você nasceu? (quatro números, ex.: 2012)" };
}

export function conferirNascimento(aluno: Aluno, pergunta: Pergunta, resposta: string): boolean {
  if (!aluno.nascimento) return false;
  const [ano, mes, dia] = aluno.nascimento.split("-").map((p) => Number(p));
  const limpo = resposta.trim().toLowerCase();
  if (pergunta.tipo === "dia") return Number(soDigitos(limpo)) === dia;
  if (pergunta.tipo === "ano") return Number(soDigitos(limpo)) === ano;
  if (pergunta.tipo === "mes") {
    const numero = Number(soDigitos(limpo));
    if (numero) return numero === mes;
    const indice = MESES.findIndex((m) => m.startsWith(limpo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 3)));
    const semAcento = MESES.map((m) => m.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const alvo = limpo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const direto = semAcento.findIndex((m) => m === alvo);
    return (direto >= 0 ? direto : indice) + 1 === mes;
  }
  const iso = paraDataISO(limpo);
  return iso === `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export async function conferirIdentidadeAluno(dados: {
  codigo: string;
  equipeId: string;
  integranteId: string;
  ra: string;
  tipo: Pergunta["tipo"];
  resposta: string;
}): Promise<{ ok: true; ra: string } | { ok: false; erro: string }> {
  const { data, error } = await supabase.rpc("aluno_conferir_identidade", {
    _codigo: dados.codigo,
    _equipe_id: dados.equipeId,
    _integrante_id: dados.integranteId,
    _ra: dados.ra,
    _tipo: dados.tipo,
    _resposta: dados.resposta,
  });
  if (error) throw error;
  const resultado = data?.[0];
  if (!resultado?.ok) {
    return { ok: false, erro: resultado?.erro ?? "Não deu para conferir agora." };
  }
  return { ok: true, ra: resultado.ra };
}

function simplificar(nome: string): string[] {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 2);
}

/** Confere, sem exigir nome idêntico, se o RA digitado é da pessoa chamada. */
export function mesmoNome(a: string, b: string): boolean {
  const um = simplificar(a);
  const dois = simplificar(b);
  if (um.length === 0 || dois.length === 0) return false;
  if (um[0] !== dois[0]) return false;
  // o nome cadastrado na equipe costuma ser mais curto: todas as partes dele
  // precisam aparecer no nome completo da lista da escola
  const curto = um.length <= dois.length ? um : dois;
  const longo = curto === um ? dois : um;
  return curto.every((parte) => longo.includes(parte));
}

// ---------- rodadas de avaliação ----------

export type TipoRodada = "bimestral" | "checkpoint";

export type Rodada = {
  id: string;
  nome: string;
  tipo: TipoRodada;
  bimestre: number;
  codigo: string;
  aberta: boolean;
  criadaEm: string;
};

type LinhaRodada = {
  id: string;
  nome: string;
  tipo: string;
  bimestre: number;
  codigo: string;
  aberta: boolean;
  created_at: string;
};

function paraRodada(l: LinhaRodada): Rodada {
  return {
    id: l.id,
    nome: l.nome,
    tipo: l.tipo === "checkpoint" ? "checkpoint" : "bimestral",
    bimestre: l.bimestre,
    codigo: l.codigo,
    aberta: l.aberta,
    criadaEm: l.created_at,
  };
}

export async function listarRodadas(): Promise<Rodada[]> {
  const { data, error } = await supabase
    .from("avaliacao_rodadas")
    .select("id, nome, tipo, bimestre, codigo, aberta, created_at")
    .order("created_at");
  if (error) throw error;
  return ((data ?? []) as LinhaRodada[]).map(paraRodada);
}

export function useRodadas() {
  return useQuery({ queryKey: ["avaliacao-rodadas"], queryFn: listarRodadas });
}

export async function criarRodada(dados: {
  nome: string;
  tipo: TipoRodada;
  bimestre: number;
  codigo: string;
  aberta: boolean;
}) {
  const { error } = await supabase.from("avaliacao_rodadas").insert({
    nome: dados.nome,
    tipo: dados.tipo,
    bimestre: dados.bimestre,
    codigo: dados.codigo.trim().toUpperCase(),
    aberta: dados.aberta,
  });
  if (error) throw error;
}

export async function mudarRodada(
  id: string,
  mudancas: Partial<{ nome: string; codigo: string; aberta: boolean }>,
) {
  const { error } = await supabase.from("avaliacao_rodadas").update(mudancas).eq("id", id);
  if (error) throw error;
}

export async function apagarRodada(id: string) {
  const { error } = await supabase.from("avaliacao_rodadas").delete().eq("id", id);
  if (error) throw error;
}

/** Código sugerido para uma avaliação nova: 4 letras e números fáceis de ditar. */
export function sugerirCodigo(): string {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let saida = "";
  for (let i = 0; i < 4; i += 1) {
    saida += letras[Math.floor(Math.random() * letras.length)];
  }
  return saida;
}

export function mesmoCodigo(digitado: string, codigo: string): boolean {
  const limpo = (v: string) => v.trim().toUpperCase().replace(/\s/g, "");
  return limpo(digitado) !== "" && limpo(digitado) === limpo(codigo);
}

// ---------- liberação da equipe (primeiro a avaliar) ----------

export type Liberacao = { rodadaId: string; equipeId: string; integranteId: string; nome: string };

export async function listarLiberacoes(rodadaId?: string): Promise<Liberacao[]> {
  let consulta = supabase
    .from("avaliacao_liberacoes")
    .select("rodada_id, equipe_id, integrante_id, nome");
  if (rodadaId) consulta = consulta.eq("rodada_id", rodadaId);
  const { data, error } = await consulta;
  if (error) throw error;
  return (
    (data ?? []) as { rodada_id: string; equipe_id: string; integrante_id: string; nome: string }[]
  ).map((l) => ({
    rodadaId: l.rodada_id,
    equipeId: l.equipe_id,
    integranteId: l.integrante_id,
    nome: l.nome,
  }));
}

export function useLiberacoes(rodadaId?: string) {
  return useQuery({
    queryKey: ["avaliacao-liberacoes", rodadaId ?? "todas"],
    queryFn: () => listarLiberacoes(rodadaId),
    enabled: true,
  });
}

export async function liberarEquipe(dados: {
  rodadaId: string;
  equipeId: string;
  integranteId: string;
  nome: string;
}) {
  const { error } = await supabase.from("avaliacao_liberacoes").insert({
    rodada_id: dados.rodadaId,
    equipe_id: dados.equipeId,
    integrante_id: dados.integranteId,
    nome: dados.nome,
  });
  if (error && !`${error.message}`.includes("duplicate")) throw error;
}

// ---------- avaliações ----------

export async function listarFaltas(
  equipeId?: string,
): Promise<(Falta & { equipeId: string; rodadaId: string })[]> {
  let consulta = supabase
    .from("avaliacao_faltas")
    .select("rodada_id, equipe_id, integrante_id, nome");
  if (equipeId) consulta = consulta.eq("equipe_id", equipeId);
  const { data, error } = await consulta;
  if (error) throw error;
  return (
    (data ?? []) as {
      rodada_id: string | null;
      equipe_id: string;
      integrante_id: string;
      nome: string;
    }[]
  ).map((l) => ({
    rodadaId: l.rodada_id ?? "",
    equipeId: l.equipe_id,
    integranteId: l.integrante_id,
    nome: l.nome,
  }));
}

/** Professor: todas as notas. Equipe: só quem já avaliou, sem notas. */
export function useAvaliacoes(
  acesso: { senhaProfessor: string | null } | { codigo: string | null; equipeId?: string | undefined },
) {
  const chave = "senhaProfessor" in acesso ? "todas" : (acesso.equipeId ?? "nenhuma");
  const pronto =
    "senhaProfessor" in acesso ? !!acesso.senhaProfessor : !!acesso.codigo && !!acesso.equipeId;
  return useQuery({
    queryKey: ["avaliacoes", chave],
    enabled: pronto,
    queryFn: () =>
      "senhaProfessor" in acesso
        ? listarTodasAvaliacoes(acesso.senhaProfessor ?? "")
        : listarAvaliacoesDaEquipe(acesso.codigo ?? "", acesso.equipeId ?? ""),
  });
}

async function listarAvaliacoesDaEquipe(codigo: string, equipeId: string): Promise<Avaliacao[]> {
  const { data, error } = await supabase.rpc("aluno_listar_avaliadores", {
    _codigo: codigo,
    _equipe_id: equipeId,
  });
  if (error) throw error;
  return (data ?? []).map((linha) => ({
    id: linha.id,
    rodadaId: linha.rodada_id ?? "",
    equipeId: linha.equipe_id,
    turma: "",
    avaliadorId: linha.avaliador_id,
    avaliadorNome: linha.avaliador_nome,
    avaliadorRa: "",
    avaliadoId: linha.avaliado_id,
    avaliadoNome: linha.avaliado_nome,
    participacao: null,
    organizacao: null,
    colaboracao: null,
  }));
}

export function useFaltas(equipeId?: string) {
  return useQuery({
    queryKey: ["avaliacao-faltas", equipeId ?? "todas"],
    queryFn: () => listarFaltas(equipeId),
  });
}

export type NotaNova = {
  avaliadoId: string;
  avaliadoNome: string;
  participacao: number | null;
  organizacao: number | null;
  colaboracao: number | null;
};

export async function salvarAvaliacoesDaEquipe(dados: {
  codigo: string;
  rodadaId: string;
  equipeId: string;
  avaliadorId: string;
  avaliadorRa: string;
  notas: NotaNova[];
}) {
  const { error } = await supabase.rpc("aluno_salvar_avaliacoes", {
    _codigo: dados.codigo,
    _rodada_id: dados.rodadaId,
    _equipe_id: dados.equipeId,
    _avaliador_id: dados.avaliadorId,
    _avaliador_ra: dados.avaliadorRa,
    _notas: dados.notas.map(({ avaliadoId, participacao, organizacao, colaboracao }) => ({
      avaliado_id: avaliadoId,
      participacao,
      organizacao,
      colaboracao,
    })),
  });
  if (error) throw error;
}

export async function marcarFalta(
  rodadaId: string,
  bimestre: number,
  equipeId: string,
  integranteId: string,
  nome: string,
) {
  const { error } = await supabase.from("avaliacao_faltas").upsert(
    { rodada_id: rodadaId, bimestre, equipe_id: equipeId, integrante_id: integranteId, nome },
    { onConflict: "rodada_id,equipe_id,integrante_id" },
  );
  if (error) throw error;
}

export async function desmarcarFalta(rodadaId: string, equipeId: string, integranteId: string) {
  const { error } = await supabase
    .from("avaliacao_faltas")
    .delete()
    .eq("rodada_id", rodadaId)
    .eq("equipe_id", equipeId)
    .eq("integrante_id", integranteId);
  if (error) throw error;
}

/** Invalida as listas depois de gravar. */
export function useRecarregarAvaliacoes(equipeId?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["avaliacoes", equipeId ?? "todas"] });
    queryClient.invalidateQueries({ queryKey: ["avaliacoes", "todas"] });
    queryClient.invalidateQueries({ queryKey: ["avaliacao-faltas", equipeId ?? "todas"] });
    queryClient.invalidateQueries({ queryKey: ["avaliacao-faltas", "todas"] });
    queryClient.invalidateQueries({ queryKey: ["avaliacao-liberacoes"] });
    queryClient.invalidateQueries({ queryKey: ["avaliacao-rodadas"] });
  };
}

/** Média recebida por pessoa (quanto os colegas deram a ela). Quem não foi avaliado fica de fora. */
export function mediasRecebidas(
  avaliacoes: Avaliacao[],
): Map<string, { media: number; quantas: number }> {
  const soma = new Map<string, { total: number; quantas: number }>();
  for (const av of avaliacoes) {
    const valor = media(av);
    if (valor === null) continue;
    const atual = soma.get(av.avaliadoId) ?? { total: 0, quantas: 0 };
    soma.set(av.avaliadoId, { total: atual.total + valor, quantas: atual.quantas + 1 });
  }
  const saida = new Map<string, { media: number; quantas: number }>();
  for (const [id, { total, quantas }] of soma) {
    saida.set(id, { media: total / quantas, quantas });
  }
  return saida;
}

/**
 * Média de uma pessoa em várias avaliações de checkpoint: primeiro a média de
 * cada checkpoint, depois a média entre os checkpoints.
 */
export function mediaEntreCheckpoints(
  avaliacoes: Avaliacao[],
  avaliadoId: string,
  rodadasCheckpoint: Rodada[],
): { media: number | null; quantasRodadas: number } {
  const medias: number[] = [];
  for (const rodada of rodadasCheckpoint) {
    const recebidas = avaliacoes
      .filter((a) => a.rodadaId === rodada.id && a.avaliadoId === avaliadoId)
      .map(media)
      .filter((m): m is number => m !== null);
    if (recebidas.length === 0) continue;
    medias.push(recebidas.reduce((total, valor) => total + valor, 0) / recebidas.length);
  }
  if (medias.length === 0) return { media: null, quantasRodadas: 0 };
  return {
    media: medias.reduce((t, v) => t + v, 0) / medias.length,
    quantasRodadas: medias.length,
  };
}

/** Planilha (CSV) com uma linha por nota dada, para baixar. */
export function csvDasAvaliacoes(
  avaliacoes: Avaliacao[],
  rodadas: Rodada[],
  nomeDaEquipe: (equipeId: string) => string,
): string {
  const cabecalho = [
    "avaliacao",
    "tipo",
    "bimestre",
    "turma",
    "equipe",
    "quem_avaliou",
    "ra_de_quem_avaliou",
    "avaliado",
    "participacao",
    "organizacao",
    "colaboracao",
    "media",
  ];
  const linhas = avaliacoes.map((a) => {
    const rodada = rodadas.find((r) => r.id === a.rodadaId);
    const valor = media(a);
    const nota = (n: number | null) => (n === null ? "" : String(n));
    return [
      rodada?.nome ?? "",
      rodada?.tipo ?? "",
      String(rodada?.bimestre ?? ""),
      a.turma,
      nomeDaEquipe(a.equipeId),
      a.avaliadorNome,
      a.avaliadorRa,
      a.avaliadoNome,
      nota(a.participacao),
      nota(a.organizacao),
      nota(a.colaboracao),
      valor === null ? "" : valor.toFixed(2),
    ];
  });
  return [cabecalho, ...linhas]
    .map((linha) => linha.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}

export function baixarCsv(nomeArquivo: string, conteudo: string) {
  const blob = new Blob([`\uFEFF${conteudo}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
