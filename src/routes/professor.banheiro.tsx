import { createFileRoute } from "@tanstack/react-router";
import { DoorOpen } from "lucide-react";
import { useMemo, useState } from "react";

import {
  mandarAgora,
  marcarVoltou,
  ordemDaFila,
  quemEstaFora,
  tirarDaFila,
  useFila,
  usePresencas,
  useRecarregarFila,
} from "@/lib/banheiro";
import { useEquipes } from "@/lib/equipes";
import { ordenarTurmas } from "@/lib/registros";

export const Route = createFileRoute("/professor/banheiro")({
  head: () => ({
    meta: [
      { title: "Banheiro e presença — Área do professor" },
      { name: "description", content: "Fila do banheiro e presença das equipes de hoje." },
      { property: "og:title", content: "Banheiro e presença — Área do professor" },
      { property: "og:description", content: "Veja e edite a fila do banheiro da turma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfessorBanheiro,
});

function ProfessorBanheiro() {
  const { data: equipes } = useEquipes();
  const { data: fila } = useFila();
  const { data: presencas } = usePresencas();
  const recarregar = useRecarregarFila();
  const turmas = useMemo(
    () => ordenarTurmas(Array.from(new Set((equipes ?? []).map((e) => e.turma)))),
    [equipes],
  );
  const [turma, setTurma] = useState("");
  const t = turma || turmas[0] || "";
  const itens = fila ?? [];
  const ordem = ordemDaFila(itens, t);
  const fora = quemEstaFora(itens, t);
  const jaForam = itens.filter((i) => i.turma === t && i.status === "voltou");

  async function feito(p: Promise<unknown>) {
    await p;
    await recarregar();
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-16">
      <section className="cartao-toque p-5">
        <h2 className="flex items-center gap-2 text-2xl">
          <DoorOpen className="size-6 text-secondary" /> Banheiro de hoje
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {turmas.map((x) => (
            <button key={x} onClick={() => setTurma(x)} className={`rounded-2xl px-5 py-3 text-lg font-extrabold ${x === t ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>
              {x}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-alerta px-4 py-3 text-alerta-foreground">
          {fora ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex-1 text-lg font-extrabold">Fora: {fora.nome} ({fora.nome_equipe})</span>
              <button onClick={() => void feito(marcarVoltou(fora))} className="rounded-full bg-card px-4 py-2 font-extrabold text-foreground">Voltou</button>
              <button onClick={() => void feito(tirarDaFila(fora))} className="rounded-full bg-card/40 px-3 py-2 text-sm font-bold">Cancelar</button>
            </div>
          ) : (
            <span className="font-extrabold">Ninguém está fora.</span>
          )}
        </div>
        <h3 className="mt-4 text-lg">Fila</h3>
        <ol className="mt-2 space-y-2">
          {ordem.map((o, n) => (
            <li key={o.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <span className="flex-1 font-bold">{n + 1}. {o.nome} <span className="text-sm text-muted-foreground">({o.nome_equipe})</span></span>
              <button onClick={() => void feito(mandarAgora(o, itens))} className="rounded-full bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground">Mandar agora</button>
              <button onClick={() => void feito(tirarDaFila(o))} className="rounded-full bg-muted px-3 py-2 text-sm font-bold">Tirar</button>
            </li>
          ))}
          {ordem.length === 0 && <li className="font-bold text-muted-foreground">Ninguém esperando.</li>}
        </ol>
        {jaForam.length > 0 && (
          <p className="mt-3 text-sm font-semibold text-muted-foreground">Já foram hoje: {jaForam.map((j) => j.nome).join(", ")}</p>
        )}
      </section>

      <section className="cartao-toque p-5">
        <h2 className="text-xl">Presença de hoje · {t}</h2>
        <ul className="mt-3 space-y-2">
          {(equipes ?? []).filter((e) => e.turma === t).map((e) => {
            const ps = (presencas ?? []).filter((p) => p.equipe_id === e.id);
            const presentes = ps.filter((p) => p.presente).map((p) => p.nome);
            const faltas = ps.filter((p) => !p.presente).map((p) => p.nome);
            return (
              <li key={e.id} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
                <b>{e.nomeEquipe}</b> —{" "}
                {ps.length === 0 ? "presença ainda não marcada" : `${presentes.length} presentes${faltas.length ? ` · faltaram: ${faltas.join(", ")}` : ""}`}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
