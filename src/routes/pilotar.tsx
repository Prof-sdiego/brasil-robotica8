import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Joystick, LogOut } from "lucide-react";

import { ManualBotoes } from "@/components/ManualBotoes";
import { AVISO_TECLADO, enderecoDoPainel, modoDe, PASSOS_CELULAR } from "@/lib/modos";
import { sairDaEquipe } from "@/lib/sessao";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/pilotar")({
  head: () => ({
    meta: [
      { title: "Pilotar o robô — Oficina de Robótica" },
      {
        name: "description",
        content: "Painel de pilotagem da equipe e o manual dos botões A, B e A+B.",
      },
      { property: "og:title", content: "Pilotar o robô — Oficina de Robótica" },
      {
        property: "og:description",
        content: "A tela do piloto e do copiloto: painel de pilotagem e manual dos botões.",
      },
    ],
  }),
  component: TelaPilotar,
});

function TelaPilotar() {
  const { equipe, integrante, carregando } = useAluno({ area: "pilotar" });

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const modo = modoDe(equipe.modoPilotagem);
  const painel = enderecoDoPainel(equipe);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16">
      <div className="faixa-topo -mx-4 flex items-start justify-between gap-3 px-5 pt-7 pb-8 text-primary-foreground">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest opacity-90">
            {equipe.turma} · {equipe.nomeEquipe}
          </p>
          <h1 className="flex items-center gap-2 text-3xl">
            <Joystick className="size-7" /> {integrante?.papel ?? "Piloto"}
          </h1>
          <p className="mt-1 text-lg font-bold">
            <span aria-hidden>{modo.icone}</span> {modo.nome}
          </p>
        </div>
        <button
          onClick={() => {
            sairDaEquipe();
            window.location.href = "/";
          }}
          className="flex shrink-0 items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold active:scale-95"
        >
          <LogOut className="size-4" /> Sair
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {painel ? (
          <a
            href={painel}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-6 text-2xl font-extrabold text-secondary-foreground active:scale-[0.99]"
          >
            <ExternalLink className="size-6" /> Abrir o painel de pilotagem
          </a>
        ) : (
          <p className="rounded-2xl bg-muted px-4 py-4 font-bold">
            Neste modo vocês pilotam inclinando o micro:bit que fica na sua mão. Não tem painel na
            tela: segure o controle parado ao ligar, até aparecer o ✓.
          </p>
        )}

        {modo.id === "teclado" && (
          <p className="rounded-2xl bg-alerta px-4 py-4 font-bold text-alerta-foreground">
            {AVISO_TECLADO}
          </p>
        )}

        {modo.id === "celular" && (
          <div className="cartao-toque p-5">
            <h2 className="text-xl">Para o celular conectar</h2>
            <ol className="mt-3 space-y-2">
              {PASSOS_CELULAR.map((passo, indice) => (
                <li
                  key={passo.texto}
                  className={`flex gap-3 rounded-xl p-3 font-bold ${
                    passo.destaque ? "bg-alerta text-alerta-foreground" : "bg-muted"
                  }`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-black text-primary-foreground">
                    {indice + 1}
                  </span>
                  <span>{passo.texto}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-xl bg-muted p-3 font-bold">
              Senha do robô: <span className="font-mono">{equipe.senhaRobo || "—"}</span> · Nome do
              micro:bit: <span className="font-mono">{equipe.nomeMicrobit || "—"}</span>
            </p>
          </div>
        )}

        <ManualBotoes equipe={equipe} />
      </div>
    </main>
  );
}
