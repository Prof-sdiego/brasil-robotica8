import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { BarraProgresso } from "@/components/BarraProgresso";
import { ManualBotoes } from "@/components/ManualBotoes";
import { Etiqueta } from "@/components/Etiqueta";
import { ITENS_CHECKLIST, MELHORIAS, MELODIAS, MOVIMENTOS } from "@/lib/catalogo";
import { useEquipes } from "@/lib/equipes";
import { modoDe } from "@/lib/modos";
import { duracaoEstimada, montarCodigo } from "@/lib/gerador-codigo";

export const Route = createFileRoute("/professor/equipe/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da equipe — Oficina de Robótica" },
      {
        name: "description",
        content: "Integrantes, checklist, melhorias, coreografias e código gerado de uma equipe.",
      },
      { property: "og:title", content: "Detalhe da equipe — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Tudo o que a equipe registrou na oficina de robótica, em uma página.",
      },
    ],
  }),
  component: DetalheEquipe,
});

const ROTULOS_GATILHO: Record<string, string> = {
  A: "Botão A",
  B: "Botão B",
  AB: "Botões A + B",
};

function DetalheEquipe() {
  const { id } = Route.useParams();
  const { data: equipes, isLoading } = useEquipes();
  const equipe = equipes?.find((e) => e.id === id);

  if (isLoading) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  if (!equipe) {
    return (
      <main className="p-8 text-center">
        <p className="text-lg font-bold">Equipe não encontrada.</p>
        <Link to="/professor" className="mt-4 inline-block font-bold text-secondary underline">
          Voltar para a visão geral
        </Link>
      </main>
    );
  }

  const codigos = montarCodigo(equipe);
  const feitos = equipe.checklist.filter((i) => i.marcado).length;

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-5 pb-16">
      <Link to="/professor" className="inline-flex items-center gap-2 font-bold text-secondary">
        <ArrowLeft className="size-5" /> Visão geral
      </Link>

      <header className="cartao-toque p-5">
        <h2 className="text-3xl">
          {equipe.turma} · {equipe.nomeEquipe}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Etiqueta tom="info">rádio {equipe.grupoRadio}</Etiqueta>
          <Etiqueta tom="neutra">código {equipe.codigoAcesso}</Etiqueta>
          <Etiqueta tom="neutra">sensibilidade {equipe.sensibilidade}</Etiqueta>
          <Etiqueta tom={equipe.codigoGerado ? "sucesso" : "alerta"}>
            {equipe.codigoGerado ? "código gerado" : "sem código ainda"}
          </Etiqueta>
        </div>
        <div className="mt-4">
          <BarraProgresso feitos={feitos} total={equipe.checklist.length} />
        </div>
      </header>

      <section className="cartao-toque p-5">
        <h3 className="text-xl">Integrantes ({equipe.integrantes.length} de 8)</h3>
        {equipe.integrantes.length === 0 ? (
          <p className="mt-2 font-semibold text-muted-foreground">Ninguém cadastrado.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {equipe.integrantes.map((integrante) => (
              <li key={integrante.id} className="flex flex-wrap items-center gap-2 font-bold">
                <Etiqueta tom="primaria">{integrante.papel}</Etiqueta> {integrante.nome}
                <span className="font-mono text-sm text-muted-foreground">
                  código {codigos[integrante.id]}
                </span>
                {integrante.papel === "Ajudante" && (
                  <Etiqueta tom={integrante.podeEditar ? "sucesso" : "neutra"}>
                    {integrante.podeEditar ? "pode editar o programa" : "só checklist e código"}
                  </Etiqueta>
                )}
              </li>
            ))}
          </ul>
        )}
        {faltando.length > 0 && (
          <p className="mt-3 rounded-xl bg-alerta px-3 py-2 font-bold text-alerta-foreground">
            Falta cadastrar: {faltando.join(", ")}
          </p>
        )}
      </section>

      <div className="mb-4">
        <ManualBotoes equipe={equipe} />
      </div>

      <section className="cartao-toque p-5">
        <h3 className="text-xl">Melhorias e justificativa</h3>
        <p className="mt-1 font-bold">
          <span aria-hidden>{modoDe(equipe.modoPilotagem).icone}</span> Modo de pilotagem:{" "}
          {modoDe(equipe.modoPilotagem).nome}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {equipe.melhorias.length === 0 && (
            <p className="font-semibold text-muted-foreground">Nada escolhido.</p>
          )}
          {equipe.melhorias.map((idMelhoria) => (
            <Etiqueta key={idMelhoria} tom="primaria">
              {MELHORIAS.find((m) => m.id === idMelhoria)?.nome ?? idMelhoria}
            </Etiqueta>
          ))}
          {equipe.melodiaAbertura && (
            <Etiqueta tom="info">
              melodia: {MELODIAS.find((m) => m.id === equipe.melodiaAbertura)?.nome}
            </Etiqueta>
          )}
        </div>
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted p-4 font-semibold">
          {equipe.justificativa.trim() || "A equipe ainda não escreveu a justificativa."}
        </p>
      </section>

      <section className="cartao-toque p-5">
        <h3 className="text-xl">Checklist</h3>
        <ul className="mt-3 space-y-2">
          {equipe.checklist.map((item) => (
            <li key={item.id} className="rounded-xl bg-muted p-3">
              <p className="font-bold">
                {item.marcado ? "✅" : "⬜"}{" "}
                {ITENS_CHECKLIST.find((i) => i.id === item.id)?.texto ?? item.id}
              </p>
              {item.marcado && (
                <p className="text-xs font-semibold text-muted-foreground">
                  {item.marcadoPor} ·{" "}
                  {item.marcadoEm
                    ? new Date(item.marcadoEm).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : ""}
                </p>
              )}
              {item.observacao && (
                <p className="mt-1 text-sm font-semibold">Observação: {item.observacao}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="cartao-toque p-5">
        <h3 className="text-xl">Coreografias</h3>
        {equipe.coreografias.length === 0 && (
          <p className="mt-2 font-semibold text-muted-foreground">Nenhuma coreografia montada.</p>
        )}
        {equipe.coreografias.map((coreografia) => (
          <div key={coreografia.gatilho} className="mt-3 rounded-xl bg-muted p-4">
            <p className="font-bold">
              {ROTULOS_GATILHO[coreografia.gatilho] ?? coreografia.gatilho} ·{" "}
              {duracaoEstimada(coreografia.movimentos).toFixed(1)}s
            </p>
            <ol className="mt-2 list-decimal pl-5 text-sm font-semibold">
              {coreografia.movimentos.map((movimento) => (
                <li key={movimento.id}>
                  {MOVIMENTOS.find((m) => m.id === movimento.movimentoId)?.nome ??
                    movimento.movimentoId}{" "}
                  ({movimento.params.join(", ")})
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section className="cartao-toque p-5">
        <h3 className="text-xl">Código gerado</h3>
        <p className="mt-3 font-bold">Controle</p>
        <pre className="mt-1 max-h-60 overflow-auto rounded-xl bg-muted p-3 font-mono text-xs">
          {codigos.controle}
        </pre>
        <p className="mt-3 font-bold">Robô</p>
        <pre className="mt-1 max-h-60 overflow-auto rounded-xl bg-muted p-3 font-mono text-xs">
          {codigos.robo}
        </pre>
      </section>
    </main>
  );
}
