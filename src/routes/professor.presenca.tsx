import { createFileRoute } from "@tanstack/react-router";
import { UserCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { hoje, usePresencas } from "@/lib/banheiro";
import { useEquipes } from "@/lib/equipes";
import { ordenarTurmas } from "@/lib/registros";

export const Route = createFileRoute("/professor/presenca")({
  head: () => ({
    meta: [
      { title: "Lista de presença — Área do professor" },
      { name: "description", content: "Veja quem estava presente em cada equipe, por dia e turma." },
      { property: "og:title", content: "Lista de presença — Área do professor" },
      { property: "og:description", content: "Lista de presença marcada pelos programadores das equipes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListaPresenca,
});

function ListaPresenca() {
  const { data: equipes } = useEquipes();
  const [dia, setDia] = useState(hoje());
  const { data: presencas } = usePresencas(dia);
  const turmas = useMemo(
    () => ordenarTurmas(Array.from(new Set((equipes ?? []).map((e) => e.turma)))),
    [equipes],
  );
  const [turma, setTurma] = useState("");
  const t = turma || turmas[0] || "";
  const lista = presencas ?? [];
  const daTurma = (equipes ?? []).filter((e) => e.turma === t);
  let presentes = 0;
  let faltas = 0;

  const linhas = daTurma.map((e) => {
    const itens = e.integrantes.map((i) => {
      const p = lista.find((x) => x.equipe_id === e.id && x.integrante_id === i.id);
      if (p?.presente) presentes++;
      else if (p) faltas++;
      return { i, p };
    });
    return { e, itens };
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-16">
      <section className="cartao-toque p-5">
        <h2 className="flex items-center gap-2 text-2xl">
          <UserCheck className="size-6 text-secondary" /> Lista de presença
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {turmas.map((x) => (
            <button key={x} onClick={() => setTurma(x)} className={`rounded-2xl px-5 py-3 text-lg font-extrabold ${x === t ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>
              {x}
            </button>
          ))}
          <input
            type="date"
            value={dia}
            onChange={(e) => setDia(e.target.value || hoje())}
            className="ml-auto rounded-xl border-2 border-input bg-background px-3 py-2 font-bold"
          />
        </div>
        <p className="mt-3 font-bold">
          {presentes} presentes · {faltas} faltaram
        </p>
      </section>

      {linhas.map(({ e, itens }) => (
        <section key={e.id} className="cartao-toque p-5">
          <h3 className="text-xl">{e.nomeEquipe}</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {itens.map(({ i, p }) => (
              <li key={i.id} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <span className="flex-1 font-bold">{i.nome}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                    !p ? "bg-muted text-muted-foreground" : p.presente ? "bg-sucesso text-sucesso-foreground" : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {!p ? "não marcado" : p.presente ? "Presente" : "Faltou"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {linhas.length === 0 && <p className="text-center font-bold text-muted-foreground">Nenhuma equipe nesta turma.</p>}
    </main>
  );
}
