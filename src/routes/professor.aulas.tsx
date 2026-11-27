import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareHeart } from "lucide-react";
import { useMemo, useState } from "react";

import { ABERTAS, EIXOS, ESCALA, mediaEixo, mediaPergunta, useRespostasAulas } from "@/lib/avaliacaoAulas";
import { ordenarTurmas } from "@/lib/registros";
import { senhaProfessorGuardada } from "@/lib/sessao";

export const Route = createFileRoute("/professor/aulas")({
  head: () => ({
    meta: [
      { title: "Avaliação das aulas — Oficina de Robótica" },
      { name: "description", content: "O que os grupos acharam das aulas e do professor: resumo e respostas por grupo." },
      { property: "og:title", content: "Avaliação das aulas — Oficina de Robótica" },
      { property: "og:description", content: "Resumo e respostas dos grupos sobre as aulas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AvaliacaoAulasProfessor,
});

const f = (n: number | null) => (n === null ? "—" : n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }));
const nomeNota = (v: number | undefined) => ESCALA.find((e) => e.valor === v);

function AvaliacaoAulasProfessor() {
  const { data: respostas } = useRespostasAulas(senhaProfessorGuardada());
  const turmas = useMemo(() => ordenarTurmas([...new Set((respostas ?? []).map((r) => r.turma))]), [respostas]);
  const [turma, setTurma] = useState("todas");
  const [visao, setVisao] = useState<"resumo" | "grupos">("resumo");
  const lista = (respostas ?? []).filter((r) => turma === "todas" || r.turma === turma);

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-5 pb-16">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex flex-1 items-center gap-2 text-2xl"><MessageSquareHeart className="size-6 text-primary" /> Avaliação das aulas</h1>
        {["todas", ...turmas].map((t) => (
          <button key={t} onClick={() => setTurma(t)} className={`rounded-full px-4 py-2 font-extrabold ${t === turma ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t === "todas" ? "Todas" : t}</button>
        ))}
      </div>
      <div className="flex gap-2">
        {(["resumo", "grupos"] as const).map((v) => (
          <button key={v} onClick={() => setVisao(v)} className={`rounded-full px-4 py-2 font-extrabold ${v === visao ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>{v === "resumo" ? "Resumo" : "Por grupo"}</button>
        ))}
        <span className="ml-auto self-center font-bold text-muted-foreground">{lista.length} grupo(s) responderam</span>
      </div>

      {lista.length === 0 && <p className="cartao-toque p-5 font-bold text-muted-foreground">Nenhum grupo respondeu ainda.</p>}

      {lista.length > 0 && visao === "resumo" && (
        <>
          {EIXOS.map((eixo) => (
            <section key={eixo.nome} className="cartao-toque p-5">
              <h2 className="text-xl">{eixo.nome} · média {f(mediaEixo(lista, eixo.perguntas.map((p) => p.id)))} de 5</h2>
              <ul className="mt-3 space-y-2">
                {eixo.perguntas.map((p) => {
                  const m = mediaPergunta(lista, p.id);
                  return (
                    <li key={p.id}>
                      <div className="flex justify-between gap-2 text-sm font-bold"><span>{p.texto}</span><span>{f(m)}</span></div>
                      <div className="mt-1 h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-primary" style={{ width: `${((m ?? 0) / 5) * 100}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {ABERTAS.map((a) => (
            <section key={a.id} className="cartao-toque p-5">
              <h2 className="text-xl">{a.texto}</h2>
              <ul className="mt-2 space-y-2">
                {lista.filter((r) => r.textos[a.id]?.trim()).map((r) => (
                  <li key={r.equipe_id} className="rounded-xl bg-muted/50 px-3 py-2 font-semibold">“{r.textos[a.id]}”</li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {lista.length > 0 && visao === "grupos" && lista.map((r) => (
        <section key={r.equipe_id} className="cartao-toque p-5">
          <h2 className="text-xl">{r.turma} · {r.nome_equipe}</h2>
          {EIXOS.map((eixo) => (
            <div key={eixo.nome} className="mt-3">
              <p className="font-extrabold">{eixo.nome}</p>
              <ul className="text-sm font-semibold">
                {eixo.perguntas.map((p) => {
                  const n = nomeNota(r.notas[p.id]);
                  return <li key={p.id} className="flex justify-between gap-2 border-b py-1"><span>{p.texto}</span><span className="shrink-0">{n ? `${n.emoji} ${n.nome}` : "—"}</span></li>;
                })}
              </ul>
            </div>
          ))}
          {ABERTAS.map((a) => (
            <div key={a.id} className="mt-3"><p className="font-extrabold">{a.texto}</p><p className="font-semibold text-muted-foreground">{r.textos[a.id]?.trim() || "—"}</p></div>
          ))}
        </section>
      ))}
    </main>
  );
}
