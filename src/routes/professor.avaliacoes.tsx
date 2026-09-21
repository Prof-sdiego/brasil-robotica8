import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";

import { nomeComPapel } from "@/lib/acessos";
import {
  lerListaDeAlunos,
  media,
  salvarAlunos,
  useAlunos,
  useAvaliacoes,
  useFaltas,
} from "@/lib/avaliacao";
import { useEquipes } from "@/lib/equipes";

export const Route = createFileRoute("/professor/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliação entre colegas — Oficina de Robótica" },
      {
        name: "description",
        content: "Quem já respondeu a avaliação do 3º bimestre e a média de cada aluno.",
      },
      { property: "og:title", content: "Avaliação entre colegas — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Médias de participação, organização e colaboração por equipe.",
      },
    ],
  }),
  component: Avaliacoes,
});

function umaCasa(valor: number): string {
  return valor.toFixed(1).replace(".", ",");
}

function Avaliacoes() {
  const { data: equipes, isLoading } = useEquipes();
  const { data: avaliacoes } = useAvaliacoes();
  const { data: faltas } = useFaltas();
  const { data: alunos, refetch: recarregarAlunos } = useAlunos();
  const [texto, setTexto] = useState("");
  const [recado, setRecado] = useState("");
  const [turma, setTurma] = useState("todas");

  const turmas = useMemo(
    () => Array.from(new Set((equipes ?? []).map((e) => e.turma))).sort(),
    [equipes],
  );

  const lista = (equipes ?? []).filter((e) => turma === "todas" || e.turma === turma);

  async function importar() {
    const { linhas, ignoradas } = lerListaDeAlunos(texto);
    if (linhas.length === 0) {
      setRecado("Não achei nenhuma linha com RA e nome. Cole uma pessoa por linha.");
      return;
    }
    await salvarAlunos(linhas);
    await recarregarAlunos();
    setTexto("");
    setRecado(
      `${linhas.length} aluno(s) na lista${ignoradas > 0 ? `, ${ignoradas} linha(s) ignorada(s)` : ""}.`,
    );
  }

  if (isLoading) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const todas = avaliacoes ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 pb-16">
      <h1 className="flex items-center gap-2 text-2xl">
        <ClipboardList className="size-7 text-secondary" /> Avaliação entre colegas · 3º bimestre
      </h1>
      <p className="mt-1 font-semibold text-muted-foreground">
        A média de cada aluno é a média das notas que os colegas deram a ele nos três critérios.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={turma}
          onChange={(e) => setTurma(e.target.value)}
          className="rounded-xl border-2 border-input bg-card px-4 py-3 font-bold"
          aria-label="Filtrar por turma"
        >
          <option value="todas">Todas as turmas</option>
          {turmas.map((t) => (
            <option key={t} value={t}>
              Turma {t}
            </option>
          ))}
        </select>
        <span className="font-bold text-muted-foreground">
          {alunos?.length ?? 0} alunos na lista da escola · {todas.length} avaliações recebidas
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {lista.map((equipe) => {
          const daEquipe = todas.filter((a) => a.equipeId === equipe.id);
          const faltaramAqui = new Set(
            (faltas ?? []).filter((f) => f.equipeId === equipe.id).map((f) => f.integranteId),
          );
          const responderam = new Set(daEquipe.map((a) => a.avaliadorId));
          return (
            <section key={equipe.id} className="cartao-toque p-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl font-bold">
                  {equipe.turma} · {equipe.nomeEquipe}
                </h2>
                <span className="ml-auto text-sm font-bold text-muted-foreground">
                  {responderam.size} de {equipe.integrantes.length} responderam
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="font-bold text-muted-foreground">
                    <tr>
                      <th className="py-1">Aluno</th>
                      <th className="py-1">Respondeu?</th>
                      <th className="py-1">Participação</th>
                      <th className="py-1">Organização</th>
                      <th className="py-1">Colaboração</th>
                      <th className="py-1">Média</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipe.integrantes.map((pessoa) => {
                      const recebidas = daEquipe.filter((a) => a.avaliadoId === pessoa.id);
                      const n = recebidas.length;
                      const soma = (campo: "participacao" | "organizacao" | "colaboracao") =>
                        recebidas.reduce((total, a) => total + a[campo], 0);
                      return (
                        <tr key={pessoa.id} className="border-t border-border">
                          <td className="py-2 font-bold">
                            {pessoa.nome}
                            <span className="block text-xs font-semibold text-muted-foreground">
                              {nomeComPapel(pessoa)}
                            </span>
                          </td>
                          <td className="py-2 font-bold">
                            {responderam.has(pessoa.id)
                              ? "sim"
                              : faltaramAqui.has(pessoa.id)
                                ? "faltou"
                                : "não"}
                          </td>
                          {n === 0 ? (
                            <td colSpan={4} className="py-2 font-bold text-muted-foreground">
                              sem notas ainda
                            </td>
                          ) : (
                            <>
                              <td className="py-2 font-bold">{umaCasa(soma("participacao") / n)}</td>
                              <td className="py-2 font-bold">{umaCasa(soma("organizacao") / n)}</td>
                              <td className="py-2 font-bold">{umaCasa(soma("colaboracao") / n)}</td>
                              <td className="py-2 font-extrabold text-primary">
                                {umaCasa(
                                  recebidas.reduce((total, a) => total + media(a), 0) / n,
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      <section className="cartao-toque mt-6 p-4">
        <h2 className="text-xl">Lista da escola (RA e data de nascimento)</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Serve para confirmar quem está avaliando. Uma pessoa por linha: nome, RA e data de
          nascimento, separados por tabulação, ponto e vírgula ou vírgula. Quem já está na lista é
          atualizado.
        </p>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
          placeholder="ANA CLARA BORGES FERREIRA	000113410904	02/06/2012"
          className="mt-3 w-full rounded-xl border-2 border-input bg-background px-4 py-3 font-mono text-sm outline-none focus:border-ring"
        />
        <button
          onClick={importar}
          disabled={!texto.trim()}
          className="mt-3 rounded-2xl bg-secondary px-5 py-3 font-extrabold text-secondary-foreground disabled:opacity-50"
        >
          Adicionar à lista
        </button>
        {recado && <p className="mt-3 font-bold text-primary">{recado}</p>}
      </section>
    </main>
  );
}
