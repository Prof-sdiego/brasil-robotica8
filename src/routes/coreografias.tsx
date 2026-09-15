import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Timer, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { MOVIMENTOS } from "@/lib/catalogo";
import { duracaoEstimada } from "@/lib/gerador-codigo";
import type { Coreografia, MovimentoNaSequencia } from "@/lib/tipos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/coreografias")({
  head: () => ({
    meta: [
      { title: "Coreografias — Oficina de Robótica" },
      {
        name: "description",
        content: "Montem as sequências de movimentos do robô e vejam a duração estimada na hora.",
      },
      { property: "og:title", content: "Coreografias — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Sequências de movimentos do robô para os botões A, B e A+B.",
      },
    ],
  }),
  component: TelaCoreografias,
});

const MAXIMO_MOVIMENTOS = 12;

const ROTULOS: Record<Coreografia["gatilho"], string> = {
  A: "Botão A",
  B: "Botão B",
  AB: "Botões A + B",
};

function TelaCoreografias() {
  const { equipe, carregando, salvar, salvando } = useAluno();
  const [aberta, setAberta] = useState<Coreografia["gatilho"]>("A");

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const temVelocidadeEspecial =
    equipe.melhorias.includes("turbo") || equipe.melhorias.includes("marcha_lenta");
  const gatilhos: Coreografia["gatilho"][] = temVelocidadeEspecial ? ["A", "AB"] : ["A", "B", "AB"];

  function sequencia(gatilho: Coreografia["gatilho"]): MovimentoNaSequencia[] {
    return equipe!.coreografias.find((c) => c.gatilho === gatilho)?.movimentos ?? [];
  }

  function gravar(gatilho: Coreografia["gatilho"], movimentos: MovimentoNaSequencia[]) {
    const outras = equipe!.coreografias.filter(
      (c) => c.gatilho !== gatilho && gatilhos.includes(c.gatilho),
    );
    salvar({ coreografias: [...outras, { gatilho, movimentos }] });
  }

  function adicionar(gatilho: Coreografia["gatilho"], movimentoId: string) {
    const atual = sequencia(gatilho);
    if (atual.length >= MAXIMO_MOVIMENTOS) return;
    const definicao = MOVIMENTOS.find((m) => m.id === movimentoId);
    if (!definicao) return;
    gravar(gatilho, [
      ...atual,
      {
        id: crypto.randomUUID(),
        movimentoId,
        params: definicao.params.map((p) => p.padrao),
      },
    ]);
  }

  function remover(gatilho: Coreografia["gatilho"], id: string) {
    gravar(
      gatilho,
      sequencia(gatilho).filter((m) => m.id !== id),
    );
  }

  function mover(gatilho: Coreografia["gatilho"], indice: number, direcao: -1 | 1) {
    const atual = [...sequencia(gatilho)];
    const destino = indice + direcao;
    if (destino < 0 || destino >= atual.length) return;
    const item = atual[indice]!;
    atual[indice] = atual[destino]!;
    atual[destino] = item;
    gravar(gatilho, atual);
  }

  function mudarParam(
    gatilho: Coreografia["gatilho"],
    id: string,
    indice: number,
    valor: number,
  ) {
    gravar(
      gatilho,
      sequencia(gatilho).map((item) =>
        item.id === id
          ? { ...item, params: item.params.map((p, i) => (i === indice ? valor : p)) }
          : item,
      ),
    );
  }

  const atual = sequencia(aberta);
  const duracao = duracaoEstimada(atual);
  const duracaoBoa = duracao >= 8 && duracao <= 20;

  return (
    <>
      <Cabecalho titulo="Coreografias" icone={<Wand2 className="size-6" />} salvando={salvando} />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        {temVelocidadeEspecial && (
          <p className="mb-4 rounded-2xl bg-info px-4 py-3 font-bold text-info-foreground">
            Como a equipe escolheu Turbo ou Marcha Lenta, o botão B fica com essa melhoria. Vocês
            montam 2 coreografias.
          </p>
        )}

        <div className="mb-4 flex gap-2">
          {gatilhos.map((gatilho) => (
            <button
              key={gatilho}
              onClick={() => setAberta(gatilho)}
              className={`flex-1 rounded-2xl px-3 py-4 text-base font-extrabold ${
                aberta === gatilho
                  ? "bg-primary text-primary-foreground shadow-cartao"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {ROTULOS[gatilho]}
            </button>
          ))}
        </div>

        <div
          className={`mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 font-bold ${
            duracaoBoa ? "bg-sucesso text-sucesso-foreground" : "bg-alerta text-alerta-foreground"
          }`}
        >
          <Timer className="size-5" />
          Duração estimada: {duracao.toFixed(1)}s — uma coreografia boa dura entre 8 e 20 segundos.
        </div>

        <div className="space-y-3">
          {atual.length === 0 && (
            <p className="rounded-2xl bg-muted p-5 text-center font-bold text-muted-foreground">
              Sequência vazia. Escolham o primeiro movimento na lista abaixo.
            </p>
          )}
          {atual.map((item, indice) => {
            const definicao = MOVIMENTOS.find((m) => m.id === item.movimentoId);
            if (!definicao) return null;
            return (
              <div key={item.id} className="cartao-toque p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-black text-secondary-foreground">
                    {indice + 1}
                  </span>
                  <span className="text-2xl" aria-hidden>
                    {definicao.icone}
                  </span>
                  <span className="flex-1 font-display text-lg font-bold">{definicao.nome}</span>
                  <button
                    onClick={() => mover(aberta, indice, -1)}
                    aria-label="Mover para cima"
                    className="flex size-10 items-center justify-center rounded-xl bg-muted active:scale-95"
                  >
                    <ArrowUp className="size-5" />
                  </button>
                  <button
                    onClick={() => mover(aberta, indice, 1)}
                    aria-label="Mover para baixo"
                    className="flex size-10 items-center justify-center rounded-xl bg-muted active:scale-95"
                  >
                    <ArrowDown className="size-5" />
                  </button>
                  <button
                    onClick={() => remover(aberta, item.id)}
                    aria-label="Remover movimento"
                    className="flex size-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground active:scale-95"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {definicao.params.map((parametro, i) => (
                    <label key={parametro.nome} className="block">
                      <span className="text-sm font-bold">
                        {parametro.nome}: {item.params[i]} {parametro.unidade}
                      </span>
                      <input
                        type="range"
                        min={parametro.min}
                        max={parametro.max}
                        value={item.params[i] ?? parametro.padrao}
                        onChange={(e) => mudarParam(aberta, item.id, i, Number(e.target.value))}
                        className="mt-1 h-8 w-full accent-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-xl">
            Movimentos ({atual.length} de {MAXIMO_MOVIMENTOS} usados)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MOVIMENTOS.map((movimento) => (
              <button
                key={movimento.id}
                onClick={() => adicionar(aberta, movimento.id)}
                disabled={atual.length >= MAXIMO_MOVIMENTOS}
                className="cartao-toque flex flex-col items-center gap-1 p-4 text-center active:cartao-toque-ativo disabled:opacity-40"
              >
                <span className="text-3xl" aria-hidden>
                  {movimento.icone}
                </span>
                <span className="text-sm font-bold leading-tight">{movimento.nome}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
