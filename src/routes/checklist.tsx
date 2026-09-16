import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";

import { BarraProgresso } from "@/components/BarraProgresso";
import { Cabecalho } from "@/components/Cabecalho";
import { itensChecklist } from "@/lib/catalogo";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist — Oficina de Robótica" },
      {
        name: "description",
        content: "Marque cada etapa da montagem do robô e anote os problemas da equipe.",
      },
      { property: "og:title", content: "Checklist — Oficina de Robótica" },
      {
        property: "og:description",
        content: "As dez etapas da montagem do robô, com observações da equipe.",
      },
    ],
  }),
  component: TelaChecklist,
});

function TelaChecklist() {
  const { equipe, integrante, carregando, salvar, salvando } = useAluno({
    exigirEquipeCompleta: true,
    area: "checklist",
  });
  const [quem, setQuem] = useState("");

  useEffect(() => {
    if (integrante && !quem) setQuem(integrante.nome);
  }, [integrante, quem]);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const feitos = equipe.checklist.filter((item) => item.marcado).length;

  function alternar(id: string) {
    salvar({
      checklist: equipe!.checklist.map((item) =>
        item.id === id
          ? {
              ...item,
              marcado: !item.marcado,
              marcadoPor: !item.marcado ? quem || "não informou o nome" : "",
              marcadoEm: !item.marcado ? new Date().toISOString() : null,
            }
          : item,
      ),
    });
  }

  function anotar(id: string, observacao: string) {
    salvar({
      checklist: equipe!.checklist.map((item) => (item.id === id ? { ...item, observacao } : item)),
    });
  }

  return (
    <>
      <Cabecalho
        titulo="Checklist"
        icone={<CheckSquare className="size-6" />}
        salvando={salvando}
      />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        <div className="cartao-toque mb-5 p-5">
          <BarraProgresso feitos={feitos} total={equipe.checklist.length} />
          <label className="mt-4 block text-sm font-bold">
            Quem está marcando agora?
            <select
              value={quem}
              onChange={(e) => setQuem(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-input bg-background px-3 py-3 text-base font-bold"
            >
              <option value="">Escolha o seu nome</option>
              {equipe.integrantes.map((integrante) => (
                <option key={integrante.id} value={integrante.nome}>
                  {integrante.nome} — {integrante.papel}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          {equipe.checklist.map((item) => {
            const texto =
              itensChecklist(equipe.modoPilotagem).find((i) => i.id === item.id)?.texto ?? item.id;
            const quando = item.marcadoEm
              ? new Date(item.marcadoEm).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : null;
            return (
              <div
                key={item.id}
                className={`cartao-toque p-4 ${item.marcado ? "border-sucesso bg-sucesso/10" : ""}`}
              >
                <button
                  onClick={() => alternar(item.id)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl font-black ${
                      item.marcado
                        ? "bg-sucesso text-sucesso-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    aria-hidden
                  >
                    {item.marcado ? "✓" : ""}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold leading-tight">{texto}</span>
                    {item.marcado && (
                      <span className="block text-xs font-semibold text-muted-foreground">
                        Marcado por {item.marcadoPor} em {quando}
                      </span>
                    )}
                  </span>
                </button>
                <input
                  value={item.observacao}
                  onChange={(e) => anotar(item.id, e.target.value)}
                  placeholder="Observação (opcional): o que faltou ou deu problema"
                  className="mt-3 w-full rounded-xl border-2 border-input bg-background px-3 py-3 text-sm font-semibold outline-none focus:border-ring"
                />
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
