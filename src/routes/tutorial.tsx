import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

import { equipeCompleta } from "@/lib/equipeStatus";
import { marcarTutorialVisto } from "@/lib/sessao";
import { TELAS_TUTORIAL } from "@/lib/tutorial";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Como funciona — Oficina de Robótica" },
      {
        name: "description",
        content: "Cinco telas rápidas explicando como a equipe monta o código dos micro:bit.",
      },
      { property: "og:title", content: "Como funciona — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Entenda em cinco telas como o site monta o programa do controle e do robô.",
      },
    ],
  }),
  component: TelaTutorial,
});

function TelaTutorial() {
  const navigate = useNavigate();
  const { equipe, carregando, codigo } = useAluno({ pularConferencias: true });
  const [passo, setPasso] = useState(0);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const completa = equipeCompleta(equipe.integrantes);
  const tela = TELAS_TUTORIAL[passo]!;
  const ultimo = passo === TELAS_TUTORIAL.length - 1;

  function sair() {
    if (completa && codigo) marcarTutorialVisto(codigo);
    navigate({ to: completa ? "/painel" : "/equipe" });
  }

  return (
    <main className="flex min-h-screen flex-col px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {TELAS_TUTORIAL.map((t, indice) => (
              <span
                key={t.titulo}
                className={`h-2 rounded-full transition-all ${
                  indice === passo ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
                aria-hidden
              />
            ))}
          </div>
          <button onClick={sair} className="text-base font-bold text-secondary underline">
            Pular
          </button>
        </div>

        <div
          key={passo}
          className="cartao-toque mt-6 flex flex-1 animate-in flex-col items-center justify-center gap-5 p-6 text-center duration-300 slide-in-from-right-8 fade-in"
        >
          <span className="text-7xl" aria-hidden>
            {tela.icone}
          </span>
          <h1 className="text-3xl leading-tight">{tela.titulo}</h1>
          <p className="text-lg font-semibold text-muted-foreground">{tela.texto}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setPasso((p) => Math.max(0, p - 1))}
            disabled={passo === 0}
            aria-label="Tela anterior"
            className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground disabled:opacity-40"
          >
            <ArrowLeft className="size-7" />
          </button>
          <button
            onClick={() => (ultimo ? sair() : setPasso((p) => p + 1))}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-5 text-xl font-extrabold text-primary-foreground shadow-cartao active:cartao-toque-ativo"
          >
            {ultimo ? (completa ? "Começar" : "Cadastrar a equipe") : "Próxima"}
            <ArrowRight className="size-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
