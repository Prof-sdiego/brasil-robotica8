// Dados pessoais (lista da escola com RA e nascimento, e as notas da avaliação)
// só passam pelo servidor: o navegador nunca lê essas tabelas direto.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  acharAlunoPorRa,
  conferirNascimento,
  mesmoNome,
  type Aluno,
  type Avaliacao,
} from "./avaliacao";

const SENHA_PADRAO = "robotica8";

function conferirProfessor(senha: string) {
  const esperada = process.env["SENHA_PROFESSOR"] || SENHA_PADRAO;
  if (senha.trim() !== esperada) throw new Error("Acesso negado");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function conferirEquipe(codigo: string, equipeId: string) {
  const db = await admin();
  const { data } = await db
    .from("equipes")
    .select("id, integrantes")
    .eq("id", equipeId)
    .eq("codigo_acesso", codigo.trim().toUpperCase())
    .maybeSingle();
  if (!data) throw new Error("Acesso negado");
  return data as { id: string; integrantes: { id: string; nome: string }[] };
}

type LinhaAvaliacao = {
  id: string;
  rodada_id: string | null;
  equipe_id: string;
  turma: string;
  avaliador_id: string;
  avaliador_nome: string;
  avaliador_ra: string;
  avaliado_id: string;
  avaliado_nome: string;
  participacao: number | null;
  organizacao: number | null;
  colaboracao: number | null;
};

function paraAvaliacao(l: LinhaAvaliacao, comNotas: boolean): Avaliacao {
  return {
    id: l.id,
    rodadaId: l.rodada_id ?? "",
    equipeId: l.equipe_id,
    turma: l.turma,
    avaliadorId: l.avaliador_id,
    avaliadorNome: l.avaliador_nome,
    avaliadorRa: comNotas ? l.avaliador_ra : "",
    avaliadoId: l.avaliado_id,
    avaliadoNome: l.avaliado_nome,
    participacao: comNotas ? l.participacao : null,
    organizacao: comNotas ? l.organizacao : null,
    colaboracao: comNotas ? l.colaboracao : null,
  };
}

// ---------- professor ----------

export const professorListarAlunos = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ senha: z.string().max(200) }).parse(d))
  .handler(async ({ data }): Promise<Aluno[]> => {
    conferirProfessor(data.senha);
    const db = await admin();
    const { data: linhas, error } = await db
      .from("alunos")
      .select("id, ra, nome, nascimento, turma")
      .order("nome");
    if (error) throw new Error("Não foi possível ler a lista.");
    return (linhas ?? []) as Aluno[];
  });

export const professorSalvarAlunos = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        senha: z.string().max(200),
        linhas: z
          .array(
            z.object({
              ra: z.string().regex(/^\d{4,20}$/),
              nome: z.string().trim().min(1).max(200),
              nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
              turma: z.string().max(10),
            }),
          )
          .max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    conferirProfessor(data.senha);
    if (data.linhas.length === 0) return { ok: true };
    const db = await admin();
    const { error } = await db.from("alunos").upsert(data.linhas, { onConflict: "ra" });
    if (error) throw new Error("Não foi possível guardar a lista.");
    return { ok: true };
  });

export const professorListarAvaliacoes = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ senha: z.string().max(200) }).parse(d))
  .handler(async ({ data }): Promise<Avaliacao[]> => {
    conferirProfessor(data.senha);
    const db = await admin();
    const { data: linhas, error } = await db.from("avaliacoes").select("*");
    if (error) throw new Error("Não foi possível ler as notas.");
    return ((linhas ?? []) as LinhaAvaliacao[]).map((l) => paraAvaliacao(l, true));
  });

// ---------- aluno (pelo celular do programador) ----------

/** Quem já avaliou nesta equipe — sem nenhuma nota. */
export const equipeListarAvaliacoes = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ codigo: z.string().min(1).max(40), equipeId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }): Promise<Avaliacao[]> => {
    await conferirEquipe(data.codigo, data.equipeId);
    const db = await admin();
    const { data: linhas, error } = await db
      .from("avaliacoes")
      .select("*")
      .eq("equipe_id", data.equipeId);
    if (error) throw new Error("Não foi possível ler.");
    return ((linhas ?? []) as LinhaAvaliacao[]).map((l) => paraAvaliacao(l, false));
  });

/** Confere RA + nascimento no servidor. Devolve só se bateu e o RA. */
export const conferirIdentidade = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        codigo: z.string().min(1).max(40),
        equipeId: z.string().uuid(),
        integranteId: z.string().min(1).max(100),
        ra: z.string().max(30),
        tipo: z.enum(["dia", "mes", "ano", "completa"]),
        resposta: z.string().max(40),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let equipe: Awaited<ReturnType<typeof conferirEquipe>>;
    try {
      equipe = await conferirEquipe(data.codigo, data.equipeId);
    } catch {
      return { ok: false as const, erro: "Não achei esta equipe. Saiam e entrem de novo com o código da equipe." };
    }
    const pessoa = (equipe.integrantes ?? []).find((i) => i.id === data.integranteId);
    if (!pessoa) return { ok: false as const, erro: "Essa pessoa não é desta equipe." };
    const db = await admin();
    const { data: alunos } = await db.from("alunos").select("id, ra, nome, nascimento, turma");
    const aluno = acharAlunoPorRa((alunos ?? []) as Aluno[], data.ra);
    if (!aluno) {
      return { ok: false as const, erro: "Não achei esse RA na lista da escola. Confira os números." };
    }
    if (!mesmoNome(aluno.nome, pessoa.nome)) {
      return { ok: false as const, erro: "Esse RA é de outra pessoa. Digite o seu." };
    }
    if (!conferirNascimento(aluno, { tipo: data.tipo, texto: "" }, data.resposta)) {
      return { ok: false as const, erro: "A data de nascimento não bate. Tente de novo." };
    }
    return { ok: true as const, ra: aluno.ra };
  });

export const equipeSalvarAvaliacoes = createServerFn({ method: "POST" })
  .inputValidator((d) => {
    const nota = z.number().int().min(0).max(10).nullable();
    return z
      .object({
        codigo: z.string().min(1).max(40),
        rodadaId: z.string().uuid(),
        equipeId: z.string().uuid(),
        avaliadorId: z.string().min(1).max(100),
        avaliadorRa: z.string().max(30),
        notas: z
          .array(
            z.object({
              avaliadoId: z.string().min(1).max(100),
              participacao: nota,
              organizacao: nota,
              colaboracao: nota,
            }),
          )
          .max(20),
      })
      .parse(d);
  })
  .handler(async ({ data }) => {
    const equipe = await conferirEquipe(data.codigo, data.equipeId);
    const db = await admin();
    const { data: completa } = await db
      .from("equipes")
      .select("turma")
      .eq("id", data.equipeId)
      .single();
    const { data: rodada } = await db
      .from("avaliacao_rodadas")
      .select("id, bimestre, aberta")
      .eq("id", data.rodadaId)
      .maybeSingle();
    if (!rodada || !rodada.aberta) throw new Error("Avaliação fechada.");
    const pessoas = new Map((equipe.integrantes ?? []).map((i) => [i.id, i.nome]));
    const avaliador = pessoas.get(data.avaliadorId);
    if (!avaliador) throw new Error("Acesso negado");
    const linhas = data.notas
      .filter((n) => pessoas.has(n.avaliadoId))
      .map((n) => ({
        rodada_id: rodada.id,
        bimestre: rodada.bimestre,
        equipe_id: data.equipeId,
        turma: completa?.turma ?? "",
        avaliador_id: data.avaliadorId,
        avaliador_nome: avaliador,
        avaliador_ra: data.avaliadorRa,
        avaliado_id: n.avaliadoId,
        avaliado_nome: pessoas.get(n.avaliadoId) ?? "",
        participacao: n.participacao,
        organizacao: n.organizacao,
        colaboracao: n.colaboracao,
      }));
    const { error } = await db
      .from("avaliacoes")
      .upsert(linhas, { onConflict: "rodada_id,equipe_id,avaliador_id,avaliado_id" });
    if (error) throw new Error("Não foi possível guardar.");
    return { ok: true };
  });
