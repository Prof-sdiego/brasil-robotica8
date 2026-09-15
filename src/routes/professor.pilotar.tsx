import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Gamepad2, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/professor/pilotar")({
  head: () => ({
    meta: [
      { title: "Pilotar pelo celular (experimental) — Oficina de Robótica" },
      {
        name: "description",
        content:
          "Controle experimental de pilotagem pelo celular via Bluetooth para testes do professor.",
      },
      { property: "og:title", content: "Pilotar pelo celular — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Tela experimental de pilotagem do robô pelo celular.",
      },
    ],
  }),
  component: PilotarCelular,
});

function PilotarCelular() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-5">
      <h1 className="flex items-center gap-2 text-2xl">
        <Gamepad2 className="size-7 text-primary" /> Pilotar pelo celular
      </h1>

      <p className="mt-3 flex items-start gap-2 rounded-2xl bg-accent/30 px-4 py-3 font-bold">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-secondary" />
        Em teste. Só aparece aqui na área do professor. Funciona no Chrome do Android, com
        Bluetooth ligado.
      </p>

      <a
        href="/pilotar-celular.html"
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-xl font-extrabold text-primary-foreground shadow-cartao"
      >
        <ExternalLink className="size-5" /> Abrir em tela cheia
      </a>

      <div className="cartao-toque mt-4 overflow-hidden p-0">
        <iframe
          src="/pilotar-celular.html"
          title="Pilotar pelo celular"
          allow="bluetooth; fullscreen"
          className="h-[620px] w-full border-0"
        />
      </div>
    </main>
  );
}
