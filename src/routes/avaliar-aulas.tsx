import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareHeart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Cabecalho } from "@/components/Cabecalho";
import {
  ABERTAS, EIXOS, ESCALA, TODAS_PERGUNTAS, enviarAvaliacaoAulas, useAvaliacaoAulasEnviada, useRecarregarAulasEnviada,
} from "@/lib/avaliacaoAulas";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/avaliar-aulas")({
  head: () => ({
    meta: [
      { title: "Avaliar as aulas — Oficina de Robótica" },
      { name: "description", content: "O grupo conta o que acha das aulas de Ciências, de Robótica e do professor." },
      { property: "og:title", content: "Avaliar as aulas — Oficina de Robótica" },
      { property: "og:description", content: "Avaliação das aulas e do professor feita pelos grupos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AvaliarAulas,
});

function AvaliarAulas() {
  const { equipe, carregando, codigo } = useAluno();
  const { data: enviada, isLoading } = useAvaliacaoAulasEnviada(codigo);
  const recarregar = useRecarregarAulasEnviada();
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  if (carregando || !equipe || isLoading) return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  const faltam = TODAS_PERGUNTAS.filter((p) => !notas[p.id]).length;

  async function enviar() {
    if (!codigo) return;
    setEnviando(true);
    try {
      await enviarAvaliacaoAulas(codigo, notas, textos);
      await recarregar();
      toast.success("Obrigado! A avaliação do grupo foi enviada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não deu.");
    } finally { setEnviando(false); }
  }

  return (
    <>
      <Cabecalho titulo="Avaliar as aulas" icone={<MessageSquareHeart className="size-6" />} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-16">
        {enviada ? (
          <section className="cartao-toque p-6 text-center">
            <p className="text-5xl">💌</p>
            <h2 className="mt-2 text-2xl">Avaliação enviada!</h2>
            <p className="mt-1 font-semibold text-muted-foreground">Obrigado pela sinceridade do grupo.</p>
            <Link to="/painel" className="mt-4 inline-block rounded-full bg-primary px-5 py-3 font-extrabold text-primary-foreground">Voltar ao painel</Link>
          </section>
        ) : (
          <>
            <p className="rounded-2xl bg-info px-4 py-3 font-bold text-info-foreground">
              Conversem e respondam juntos. É uma resposta por grupo e só dá para enviar uma vez.
            </p>
            {EIXOS.map((eixo) => (
              <section key={eixo.nome} className="cartao-toque space-y-4 p-5">
                <h2 className="text-2xl">{eixo.nome}</h2>
                {eixo.perguntas.map((p) => (
                  <div key={p.id}>
                    <p className="font-bold">{p.texto}</p>
                    <div className="mt-2 grid grid-cols-5 gap-1">
                      {ESCALA.map((e) => (
                        <button key={e.valor} type="button" onClick={() => setNotas({ ...notas, [p.id]: e.valor })}
                          className={`flex flex-col items-center rounded-xl px-1 py-2 text-xs font-bold ${notas[p.id] === e.valor ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <span className="text-2xl">{e.emoji}</span><span className="leading-tight">{e.nome}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
            <section className="cartao-toque space-y-4 p-5">
              <h2 className="text-2xl">Perguntas abertas</h2>
              {ABERTAS.map((a) => (
                <label key={a.id} className="block">
                  <span className="font-bold">{a.texto}</span>
                  <textarea value={textos[a.id] ?? ""} onChange={(e) => setTextos({ ...textos, [a.id]: e.target.value })} rows={3} maxLength={1000}
                    className="mt-1 w-full rounded-xl border-2 border-input bg-background px-3 py-2 font-semibold outline-none focus:border-ring" />
                </label>
              ))}
            </section>
            <button disabled={faltam > 0 || enviando} onClick={() => void enviar()}
              className="w-full rounded-2xl bg-primary px-4 py-4 text-xl font-extrabold text-primary-foreground shadow-cartao disabled:opacity-50">
              {faltam > 0 ? `Faltam ${faltam} perguntas` : enviando ? "Enviando..." : "Enviar avaliação"}
            </button>
          </>
        )}
      </main>
    </>
  );
}
