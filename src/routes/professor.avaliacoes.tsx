import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Download, KeyRound, Lock, Plus, Trash2, Unlock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { nomeComPapel } from "@/lib/acessos";
import {
  apagarRodada,
  baixarCsv,
  criarRodada,
  csvDasAvaliacoes,
  lerListaDeAlunos,
  media,
  mediaEntreCheckpoints,
  mudarRodada,
  salvarAlunos,
  sugerirCodigo,
  useAlunos,
  useAvaliacoes,
  useFaltas,
  useLiberacoes,
  useRecarregarAvaliacoes,
  useRodadas,
  type TipoRodada,
} from "@/lib/avaliacao";
import { useEquipes } from "@/lib/equipes";

export const Route = createFileRoute("/professor/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações entre colegas — Oficina de Robótica" },
      {
        name: "description",
        content: "Crie, abra, feche e baixe as avaliações da equipe, bimestrais e de checkpoint.",
      },
      { property: "og:title", content: "Avaliações entre colegas — Oficina de Robótica" },
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
  const { data: rodadas } = useRodadas();
  const { data: avaliacoes } = useAvaliacoes();
  const { data: faltas } = useFaltas();
  const { data: liberacoes } = useLiberacoes();
  const { data: alunos, refetch: recarregarAlunos } = useAlunos();
  const recarregar = useRecarregarAvaliacoes();

  const [texto, setTexto] = useState("");
  const [recado, setRecado] = useState("");
  const [turma, setTurma] = useState("todas");
  const [rodadaId, setRodadaId] = useState("");

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoRodada>("bimestral");
  const [bimestre, setBimestre] = useState(4);
  const [codigo, setCodigo] = useState(sugerirCodigo());

  const lista = (rodadas ?? []).slice().reverse();
  const rodada = lista.find((r) => r.id === rodadaId) ?? lista[0] ?? null;

  useEffect(() => {
    if (rodada && rodadaId === "") setRodadaId(rodada.id);
  }, [rodada, rodadaId]);

  const turmas = useMemo(
    () => Array.from(new Set((equipes ?? []).map((e) => e.turma))).sort(),
    [equipes],
  );
  const checkpoints = useMemo(
    () => (rodadas ?? []).filter((r) => r.tipo === "checkpoint"),
    [rodadas],
  );

  const equipesFiltradas = (equipes ?? []).filter((e) => turma === "todas" || e.turma === turma);
  const todas = avaliacoes ?? [];
  const daRodada = rodada ? todas.filter((a) => a.rodadaId === rodada.id) : [];

  async function criar() {
    if (!nome.trim() || !codigo.trim()) return;
    await criarRodada({ nome: nome.trim(), tipo, bimestre, codigo, aberta: true });
    recarregar();
    setNome("");
    setCodigo(sugerirCodigo());
    setRecado("Avaliação criada e aberta. Dite o código para os programadores.");
  }

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

  function nomeDaEquipe(id: string): string {
    const equipe = (equipes ?? []).find((e) => e.id === id);
    return equipe ? `${equipe.turma} · ${equipe.nomeEquipe}` : id;
  }

  function baixar(soDaRodada: boolean) {
    const dados = soDaRodada && rodada ? daRodada : todas;
    const nomeArquivo =
      soDaRodada && rodada
        ? `avaliacao-${rodada.nome.replace(/\s+/g, "-").toLowerCase()}.csv`
        : "avaliacoes-todas.csv";
    baixarCsv(nomeArquivo, csvDasAvaliacoes(dados, rodadas ?? [], nomeDaEquipe));
  }

  if (isLoading) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 pb-16">
      <h1 className="flex items-center gap-2 text-2xl">
        <ClipboardList className="size-7 text-secondary" /> Avaliações entre colegas
      </h1>
      <p className="mt-1 font-semibold text-muted-foreground">
        As bimestrais valem por si. As de checkpoint entram numa média entre elas.
      </p>

      {recado && <p className="mt-3 font-bold text-primary">{recado}</p>}

      <section className="cartao-toque mt-5 p-4">
        <h2 className="flex items-center gap-2 text-xl">
          <Plus className="size-5 text-primary" /> Criar uma avaliação
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="font-bold">
            Nome
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Checkpoint 1 · aula 3"
              className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-3 font-bold outline-none focus:border-ring"
            />
          </label>
          <label className="font-bold">
            Tipo
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoRodada)}
              className="mt-1 w-full rounded-xl border-2 border-input bg-card px-4 py-3 font-bold"
            >
              <option value="bimestral">Bimestral (vale sozinha)</option>
              <option value="checkpoint">Checkpoint (entra na média)</option>
            </select>
          </label>
          <label className="font-bold">
            Bimestre
            <select
              value={bimestre}
              onChange={(e) => setBimestre(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border-2 border-input bg-card px-4 py-3 font-bold"
            >
              {[1, 2, 3, 4].map((b) => (
                <option key={b} value={b}>
                  {b}º bimestre
                </option>
              ))}
            </select>
          </label>
          <label className="font-bold">
            Código de liberação
            <div className="mt-1 flex gap-2">
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-center text-xl font-extrabold tracking-widest outline-none focus:border-ring"
              />
              <button
                onClick={() => setCodigo(sugerirCodigo())}
                className="rounded-xl bg-muted px-3 font-bold text-muted-foreground"
              >
                Sortear
              </button>
            </div>
          </label>
        </div>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          O código é pedido uma vez por equipe, ao programador, antes da primeira pessoa avaliar.
        </p>
        <button
          onClick={criar}
          disabled={!nome.trim() || !codigo.trim()}
          className="mt-3 rounded-2xl bg-primary px-5 py-3 font-extrabold text-primary-foreground disabled:opacity-50"
        >
          Criar e abrir
        </button>
      </section>

      <section className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl">Avaliações criadas</h2>
          <button
            onClick={() => baixar(false)}
            className="ml-auto flex items-center gap-2 rounded-xl bg-muted px-4 py-2 font-bold text-muted-foreground"
          >
            <Download className="size-4" /> Baixar tudo
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {lista.length === 0 && (
            <p className="font-bold text-muted-foreground">Nenhuma avaliação criada ainda.</p>
          )}
          {lista.map((r) => {
            const quantas = todas.filter((a) => a.rodadaId === r.id).length;
            const equipesLiberadas = (liberacoes ?? []).filter((l) => l.rodadaId === r.id).length;
            return (
              <div
                key={r.id}
                className={`cartao-toque flex flex-wrap items-center gap-3 px-4 py-3 ${
                  r.id === rodada?.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <button
                  onClick={() => setRodadaId(r.id)}
                  className="text-left font-extrabold"
                >
                  {r.nome}
                  <span className="block text-xs font-bold text-muted-foreground">
                    {r.tipo === "checkpoint" ? "Checkpoint" : "Bimestral"} · {r.bimestre}º bimestre ·{" "}
                    {quantas} notas · {equipesLiberadas} equipe(s) começaram
                  </span>
                </button>
                <span className="flex items-center gap-1 font-mono text-lg font-extrabold">
                  <KeyRound className="size-4 text-primary" /> {r.codigo}
                </span>
                <span
                  className={`rounded-lg px-2 py-1 text-xs font-extrabold ${
                    r.aberta
                      ? "bg-sucesso text-sucesso-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.aberta ? "aberta" : "fechada"}
                </span>
                <div className="ml-auto flex flex-wrap gap-2">
                  <button
                    onClick={async () => {
                      await mudarRodada(r.id, { aberta: !r.aberta });
                      recarregar();
                    }}
                    className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground"
                  >
                    {r.aberta ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                    {r.aberta ? "Fechar" : "Abrir"}
                  </button>
                  <button
                    onClick={() => {
                      setRodadaId(r.id);
                      baixarCsv(
                        `avaliacao-${r.nome.replace(/\s+/g, "-").toLowerCase()}.csv`,
                        csvDasAvaliacoes(
                          todas.filter((a) => a.rodadaId === r.id),
                          rodadas ?? [],
                          nomeDaEquipe,
                        ),
                      );
                    }}
                    className="flex items-center gap-1 rounded-xl bg-muted px-3 py-2 text-sm font-bold text-muted-foreground"
                  >
                    <Download className="size-4" /> Baixar
                  </button>
                  <button
                    onClick={async () => {
                      const certeza = window.confirm(
                        `Excluir "${r.nome}"? As ${quantas} notas dela vão embora.`,
                      );
                      if (!certeza) return;
                      await apagarRodada(r.id);
                      setRodadaId("");
                      recarregar();
                      setRecado(`"${r.nome}" foi excluída.`);
                    }}
                    className="flex items-center gap-1 rounded-xl bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground"
                  >
                    <Trash2 className="size-4" /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
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
          {alunos?.length ?? 0} alunos na lista da escola · {todas.length} notas guardadas
        </span>
      </div>

      {rodada && (
        <h2 className="mt-5 text-xl">
          Resultado de {rodada.nome}
          <span className="block text-sm font-bold text-muted-foreground">
            A média de cada aluno é a média das notas que os colegas deram a ele nos três critérios.
            {checkpoints.length > 1 &&
              " A última coluna é a média entre todos os checkpoints criados."}
          </span>
        </h2>
      )}

      <div className="mt-3 space-y-4">
        {equipesFiltradas.map((equipe) => {
          const daEquipe = daRodada.filter((a) => a.equipeId === equipe.id);
          const faltaramAqui = new Set(
            (faltas ?? [])
              .filter((f) => f.equipeId === equipe.id && f.rodadaId === rodada?.id)
              .map((f) => f.integranteId),
          );
          const responderam = new Set(daEquipe.map((a) => a.avaliadorId));
          return (
            <section key={equipe.id} className="cartao-toque p-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-xl font-bold">
                  {equipe.turma} · {equipe.nomeEquipe}
                </h3>
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
                      {checkpoints.length > 1 && <th className="py-1">Checkpoints</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {equipe.integrantes.map((pessoa) => {
                      const recebidas = daEquipe.filter((a) => a.avaliadoId === pessoa.id);
                      const entre = mediaEntreCheckpoints(todas, pessoa.id, checkpoints);
                      const soma = (campo: "participacao" | "organizacao" | "colaboracao") =>
                        recebidas.reduce((total, a) => total + (a[campo] ?? 0), 0);
                      const quantas = (campo: "participacao" | "organizacao" | "colaboracao") =>
                        recebidas.filter((a) => typeof a[campo] === "number").length;
                      const medias = recebidas
                        .map(media)
                        .filter((m): m is number => m !== null);
                      const coluna = (
                        campo: "participacao" | "organizacao" | "colaboracao",
                      ): string => {
                        const n = quantas(campo);
                        return n === 0 ? "—" : umaCasa(soma(campo) / n);
                      };
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
                          {recebidas.length === 0 ? (
                            <td colSpan={4} className="py-2 font-bold text-muted-foreground">
                              sem notas ainda
                            </td>
                          ) : medias.length === 0 ? (
                            <td colSpan={4} className="py-2 font-bold text-muted-foreground">
                              ninguém se sentiu capaz de avaliar
                            </td>
                          ) : (
                            <>
                              <td className="py-2 font-bold">{coluna("participacao")}</td>
                              <td className="py-2 font-bold">{coluna("organizacao")}</td>
                              <td className="py-2 font-bold">{coluna("colaboracao")}</td>
                              <td className="py-2 font-extrabold text-primary">
                                {umaCasa(
                                  medias.reduce((total, valor) => total + valor, 0) / medias.length,
                                )}
                              </td>
                            </>
                          )}
                          {checkpoints.length > 1 && (
                            <td className="py-2 font-extrabold text-secondary">
                              {entre.media === null
                                ? "—"
                                : `${umaCasa(entre.media)} (${entre.quantasRodadas})`}
                            </td>
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
      </section>
    </main>
  );
}
