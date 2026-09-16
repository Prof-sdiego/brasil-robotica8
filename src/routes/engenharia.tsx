import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckSquare, Wrench } from "lucide-react";
import { useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { MANUAL_ENGENHARIA } from "@/lib/manuais";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/engenharia")({
  head: () => ({
    meta: [
      { title: "Manual de Engenharia — Oficina de Robótica" },
      {
        name: "description",
        content: "Perguntas e respostas sobre tração, motores, peso e bateria do carrinho.",
      },
      { property: "og:title", content: "Manual de Engenharia — Oficina de Robótica" },
      {
        property: "og:description",
        content: "O que fazer quando o robô não anda reto, perde tração ou fica lento.",
      },
    ],
  }),
  component: TelaEngenharia,
});

function TelaEngenharia() {
  const { equipe, carregando } = useAluno({ area: "engenharia" });
  const [aberta, setAberta] = useState<string | null>(null);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  return (
    <>
      <Cabecalho titulo="Manual de Engenharia" icone={<Wrench className="size-6" />} />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        <p className="mb-4 rounded-2xl bg-muted px-4 py-4 font-bold">
          Toque na pergunta parecida com o seu problema para ver a resposta.
        </p>
        <div className="space-y-3">
          {MANUAL_ENGENHARIA.map((item) => {
            const abertaAgora = aberta === item.pergunta;
            return (
              <div key={item.pergunta} className="cartao-toque overflow-hidden">
                <button
                  onClick={() => setAberta(abertaAgora ? null : item.pergunta)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="text-3xl" aria-hidden>
                    {item.icone}
                  </span>
                  <span className="flex-1 text-lg font-bold leading-tight">{item.pergunta}</span>
                  <span className="text-2xl font-black text-primary" aria-hidden>
                    {abertaAgora ? "−" : "+"}
                  </span>
                </button>
                {abertaAgora && (
                  <p className="border-t-2 border-muted bg-muted/50 p-4 font-semibold">
                    {item.resposta}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Link
          to="/checklist"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-sucesso px-4 py-5 text-xl font-extrabold text-sucesso-foreground active:scale-[0.99]"
        >
          <CheckSquare className="size-6" /> Ir para o checklist
        </Link>
      </main>
    </>
  );
}
