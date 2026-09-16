import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckSquare, Palette } from "lucide-react";

import { Cabecalho } from "@/components/Cabecalho";
import { MANUAL_DESIGN } from "@/lib/manuais";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/design")({
  head: () => ({
    meta: [
      { title: "Manual de Design — Oficina de Robótica" },
      {
        name: "description",
        content: "Regras de medida e peso que a decoração do robô precisa respeitar.",
      },
      { property: "og:title", content: "Manual de Design — Oficina de Robótica" },
      {
        property: "og:description",
        content: "O que pode e o que não pode na decoração do carrinho de robótica.",
      },
    ],
  }),
  component: TelaDesign,
});

function TelaDesign() {
  const { equipe, carregando } = useAluno({ area: "design" });

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  return (
    <>
      <Cabecalho titulo="Manual de Design" icone={<Palette className="size-6" />} />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        <p className="mb-4 rounded-2xl bg-muted px-4 py-4 font-bold">
          A decoração conta pontos, mas não pode atrapalhar o robô. Estas são as regras.
        </p>
        <div className="space-y-3">
          {MANUAL_DESIGN.map((regra) => (
            <div key={regra.titulo} className="cartao-toque flex items-start gap-3 p-5">
              <span className="text-3xl" aria-hidden>
                {regra.icone}
              </span>
              <div>
                <h2 className="text-xl">{regra.titulo}</h2>
                <p className="mt-1 font-semibold text-muted-foreground">{regra.texto}</p>
              </div>
            </div>
          ))}
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
