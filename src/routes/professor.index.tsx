import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpDown, Radio } from "lucide-react";
import { useMemo, useState } from "react";

import { BarraProgresso } from "@/components/BarraProgresso";
import { Etiqueta } from "@/components/Etiqueta";
import { MELHORIAS, PAPEIS_OBRIGATORIOS } from "@/lib/catalogo";
import { useEquipes } from "@/lib/equipes";
import { MODOS, modoDe } from "@/lib/modos";
import type { Equipe } from "@/lib/tipos";

export const Route = createFileRoute("/professor/")({
  head: () => ({
    meta: [
      { title: "Visão geral das equipes — Oficina de Robótica" },
      {
        name: "description",
        content: "Progresso, integrantes e melhorias de todas as equipes da oficina de robótica.",
      },
      { property: "og:title", content: "Visão geral das equipes — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Acompanhe o andamento de todos os grupos da oficina em uma tela.",
      },
    ],
  }),
  component: VisaoGeral,
});

function papeisVagos(equipe: Equipe) {
  return PAPEIS_OBRIGATORIOS.filter(
    (papel) => !equipe.integrantes.some((i) => i.papel === papel),
  );
}

function paradaHaUmaSemana(equipe: Equipe) {
  const umaSemana = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(equipe.atualizadoEm).getTime() > umaSemana;
}

function VisaoGeral() {
  const { data: equipes, isLoading } = useEquipes();
  const [turma, setTurma] = useState("todas");
  const [porProgresso, setPorProgresso] = useState(false);

  const turmas = useMemo(
    () => Array.from(new Set((equipes ?? []).map((e) => e.turma))).sort(),
    [equipes],
  );

  const radiosRepetidos = useMemo(() => {
    const contagem = new Map<number, number>();
    for (const equipe of equipes ?? []) {
      contagem.set(equipe.grupoRadio, (contagem.get(equipe.grupoRadio) ?? 0) + 1);
    }
    return new Set([...contagem.entries()].filter(([, n]) => n > 1).map(([radio]) => radio));
  }, [equipes]);

  const lista = useMemo(() => {
    let resultado = [...(equipes ?? [])];
    if (turma !== "todas") resultado = resultado.filter((e) => e.turma === turma);
    if (porProgresso) {
      resultado.sort(
        (a, b) =>
          a.checklist.filter((i) => i.marcado).length - b.checklist.filter((i) => i.marcado).length,
      );
    }
    return resultado;
  }, [equipes, turma, porProgresso]);

  const resumo = useMemo(() => {
    const todas = equipes ?? [];
    const contagemMelhorias = new Map<string, number>();
    for (const equipe of todas) {
      for (const melhoria of equipe.melhorias) {
        contagemMelhorias.set(melhoria, (contagemMelhorias.get(melhoria) ?? 0) + 1);
      }
    }
    return {
      total: todas.length,
      concluidas: todas.filter((e) => e.checklist.every((i) => i.marcado)).length,
      comCodigo: todas.filter((e) => e.codigoGerado).length,
      melhorias: [...contagemMelhorias.entries()].sort((a, b) => b[1] - a[1]),
      modos: MODOS.map((modo) => ({
        ...modo,
        quantidade: todas.filter((e) => (e.modoPilotagem || "inclinacao") === modo.id).length,
      })),
    };
  }, [equipes]);

  if (isLoading) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-5 pb-16">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { rotulo: "Equipes", valor: resumo.total },
          { rotulo: "Checklist completo", valor: resumo.concluidas },
          { rotulo: "Já geraram código", valor: resumo.comCodigo },
          {
            rotulo: "Melhoria mais escolhida",
            valor: resumo.melhorias[0]
              ? (MELHORIAS.find((m) => m.id === resumo.melhorias[0]![0])?.nome ?? "—")
              : "—",
          },
        ].map((cartao) => (
          <div key={cartao.rotulo} className="cartao-toque p-4">
            <p className="font-display text-3xl font-bold text-primary">{cartao.valor}</p>
            <p className="text-sm font-bold text-muted-foreground">{cartao.rotulo}</p>
          </div>
        ))}
      </section>

      <div className="cartao-toque mt-4 p-4">
        <p className="mb-2 font-bold">Modo de pilotagem das equipes</p>
        <div className="flex flex-wrap gap-2">
          {resumo.modos.map((modo) => (
            <Etiqueta key={modo.id} tom="info">
              {modo.icone} {modo.nome} · {modo.quantidade}
            </Etiqueta>
          ))}
        </div>
      </div>

      {resumo.melhorias.length > 0 && (
        <div className="cartao-toque mt-4 p-4">
          <p className="mb-2 font-bold">Melhorias mais escolhidas pela turma</p>
          <div className="flex flex-wrap gap-2">
            {resumo.melhorias.map(([id, quantidade]) => (
              <Etiqueta key={id} tom="neutra">
                {MELHORIAS.find((m) => m.id === id)?.icone} {MELHORIAS.find((m) => m.id === id)?.nome}{" "}
                · {quantidade}
              </Etiqueta>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
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
        <button
          onClick={() => setPorProgresso((valor) => !valor)}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 font-bold ${
            porProgresso ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <ArrowUpDown className="size-4" />
          {porProgresso ? "Ordenado: menor progresso" : "Ordenar por progresso"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {lista.map((equipe) => {
          const feitos = equipe.checklist.filter((i) => i.marcado).length;
          const vagos = papeisVagos(equipe);
          const parada = paradaHaUmaSemana(equipe);
          const radioRepetido = radiosRepetidos.has(equipe.grupoRadio);
          const problema = vagos.length > 0 || parada || radioRepetido;
          return (
            <Link
              key={equipe.id}
              to="/professor/equipe/$id"
              params={{ id: equipe.id }}
              className={`cartao-toque block p-4 active:cartao-toque-ativo ${
                problema ? "border-alerta bg-alerta/10" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-xl font-bold">
                  {equipe.turma} · {equipe.nomeEquipe}
                </span>
                <Etiqueta tom={radioRepetido ? "alerta" : "info"}>
                  <Radio className="size-3" /> rádio {equipe.grupoRadio}
                </Etiqueta>
                <Etiqueta tom="primaria">
                  {modoDe(equipe.modoPilotagem).icone} {modoDe(equipe.modoPilotagem).nome}
                </Etiqueta>
                <Etiqueta tom={equipe.codigoGerado ? "sucesso" : "neutra"}>
                  {equipe.codigoGerado ? "código gerado" : "sem código ainda"}
                </Etiqueta>
                <span className="ml-auto font-mono text-sm font-bold text-muted-foreground">
                  {equipe.codigoAcesso}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="min-w-40 flex-1">
                  <BarraProgresso feitos={feitos} total={equipe.checklist.length} compacta />
                </div>
                <span className="text-sm font-bold">
                  {feitos}/{equipe.checklist.length} checklist
                </span>
                <span className="text-sm font-bold">
                  {equipe.integrantes.length} de 8 integrantes
                </span>
                <Etiqueta tom={temDesigner ? "sucesso" : "neutra"}>
                  {temDesigner ? "🎨 com designer" : "sem designer"}
                </Etiqueta>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {PAPEIS.map((definicao) => {
                  const quantos = equipe.integrantes.filter(
                    (i) => i.papel === definicao.papel,
                  ).length;
                  const obrigatorioVago =
                    quantos === 0 && PAPEIS_OBRIGATORIOS.includes(definicao.papel);
                  return (
                    <Etiqueta
                      key={definicao.papel}
                      tom={obrigatorioVago ? "alerta" : quantos > 0 ? "info" : "neutra"}
                    >
                      {definicao.icone} {definicao.papel} · {quantos}
                    </Etiqueta>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {equipe.melhorias.map((id) => (
                  <Etiqueta key={id} tom="primaria">
                    {MELHORIAS.find((m) => m.id === id)?.nome ?? id}
                  </Etiqueta>
                ))}
                {vagos.length > 0 && (
                  <Etiqueta tom="alerta">
                    <AlertTriangle className="size-3" /> falta: {vagos.join(", ")}
                  </Etiqueta>
                )}
                {parada && (
                  <Etiqueta tom="alerta">
                    <AlertTriangle className="size-3" /> sem atualização há mais de uma semana
                  </Etiqueta>
                )}
                {radioRepetido && (
                  <Etiqueta tom="alerta">
                    <AlertTriangle className="size-3" /> grupo de rádio repetido
                  </Etiqueta>
                )}
              </div>

              <p className="mt-2 text-xs font-bold text-muted-foreground">
                Atualizado em{" "}
                {new Date(equipe.atualizadoEm).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
