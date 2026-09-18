import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BarraProgresso } from "@/components/BarraProgresso";
import { ManualBotoes } from "@/components/ManualBotoes";
import { Etiqueta } from "@/components/Etiqueta";
import { ESPECIALIDADES, especialidadeDe, papelCompleto } from "@/lib/acessos";
import {
  ITENS_CHECKLIST,
  MAXIMO_INTEGRANTES,
  MELHORIAS,
  MELODIAS,
  MOVIMENTOS,
  PAPEIS,
} from "@/lib/catalogo";
import { codigosDaEquipe } from "@/lib/codigosPessoais";
import { papeisFaltantes } from "@/lib/equipeStatus";
import { salvarIntegrantesPorId, useEquipes } from "@/lib/equipes";
import { duracaoEstimada, montarCodigo } from "@/lib/gerador-codigo";
import type { Equipe, Especialidade, Integrante, Papel } from "@/lib/tipos";

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
  const codigosPessoais = codigosDaEquipe(equipe.integrantes);
  const faltando = papeisFaltantes(equipe.integrantes);

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

      <CadastroIntegrantes equipe={equipe} />

      <section className="cartao-toque p-5">
        <h3 className="text-xl">Integrantes ({equipe.integrantes.length} de 8)</h3>
        {equipe.integrantes.length === 0 ? (
          <p className="mt-2 font-semibold text-muted-foreground">Ninguém cadastrado.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {equipe.integrantes.map((integrante) => (
              <li key={integrante.id} className="flex flex-wrap items-center gap-2 font-bold">
                <Etiqueta tom="primaria">{papelCompleto(integrante)}</Etiqueta> {integrante.nome}
                <span className="font-mono text-sm text-muted-foreground">
                  código {codigosPessoais[integrante.id]}
                </span>
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
        <p className="mt-3 font-bold">Robô por Bluetooth</p>
        <pre className="mt-1 max-h-60 overflow-auto rounded-xl bg-muted p-3 font-mono text-xs">
          {codigos.robo}
        </pre>
      </section>
    </main>
  );
}

function CadastroIntegrantes({ equipe }: { equipe: Equipe }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel>("Programador");
  const [especialidade, setEspecialidade] = useState<Especialidade>("programacao");
  const [salvando, setSalvando] = useState(false);

  const integrantes = equipe.integrantes;
  const codigosPessoais = codigosDaEquipe(integrantes);

  async function gravar(novos: Integrante[]) {
    setSalvando(true);
    try {
      await salvarIntegrantesPorId(equipe.id, novos);
      await queryClient.invalidateQueries({ queryKey: ["equipes"] });
    } catch {
      toast.error("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  function vagasLivres(alvo: Papel) {
    const definicao = PAPEIS.find((p) => p.papel === alvo);
    return (definicao?.vagas ?? 0) - integrantes.filter((i) => i.papel === alvo).length;
  }

  async function adicionar() {
    if (!nome.trim()) return;
    if (integrantes.length >= MAXIMO_INTEGRANTES) {
      toast.error("A equipe já tem 8 pessoas.");
      return;
    }
    if (vagasLivres(papel) <= 0) {
      toast.error(`Não há mais vaga de ${papel} nesta equipe.`);
      return;
    }
    const novo: Integrante = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      papel,
      ...(papel === "Ajudante" ? { especialidade } : {}),
    };
    const novaLista = [...integrantes, novo];
    await gravar(novaLista);
    setNome("");
    toast.success(
      `${novo.nome} cadastrado como ${papelCompleto(novo)}. Código pessoal: ${codigosDaEquipe(novaLista)[novo.id]}`,
    );
  }

  async function trocarEspecialidade(id: string, nova: Especialidade) {
    const alvo = integrantes.find((i) => i.id === id);
    if (!alvo) return;
    await gravar(integrantes.map((i) => (i.id === id ? { ...i, especialidade: nova } : i)));
  }

  return (
    <section className="cartao-toque p-5">
      <h3 className="text-xl">Cadastrar pessoas nesta equipe</h3>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">
        Útil para já deixar o programador cadastrado antes da aula. O código pessoal de cada um
        aparece do lado do nome, pronto para copiar.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da pessoa"
          className="rounded-xl border-2 border-input bg-background px-3 py-3 text-base font-bold outline-none focus:border-ring"
        />
        <select
          value={papel}
          onChange={(e) => setPapel(e.target.value as Papel)}
          aria-label="Papel"
          className="rounded-xl border-2 border-input bg-background px-3 py-3 text-base font-bold"
        >
          {PAPEIS.map((p) => (
            <option key={p.papel} value={p.papel} disabled={vagasLivres(p.papel) <= 0}>
              {p.papel}
              {vagasLivres(p.papel) <= 0 ? " (sem vaga)" : ""}
            </option>
          ))}
        </select>
        {papel === "Ajudante" ? (
          <select
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value as Especialidade)}
            aria-label="Especialidade do ajudante"
            className="rounded-xl border-2 border-input bg-background px-3 py-3 text-base font-bold"
          >
            {ESPECIALIDADES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        ) : (
          <span />
        )}
      </div>

      <button
        onClick={adicionar}
        disabled={salvando || !nome.trim()}
        className="mt-3 flex items-center gap-2 rounded-2xl bg-sucesso px-5 py-3 font-extrabold text-sucesso-foreground disabled:opacity-50"
      >
        <UserPlus className="size-5" /> Cadastrar pessoa
      </button>

      {integrantes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {integrantes.map((integrante) => (
            <li
              key={integrante.id}
              className="flex flex-wrap items-center gap-2 rounded-xl bg-muted p-3 font-bold"
            >
              <span>{integrante.nome}</span>
              <Etiqueta tom="neutra">{papelCompleto(integrante)}</Etiqueta>
              <span className="rounded-lg bg-background px-2 py-1 font-mono text-sm">
                {codigosPessoais[integrante.id]}
              </span>
              {integrante.papel === "Ajudante" && (
                <select
                  value={especialidadeDe(integrante)}
                  onChange={(e) =>
                    trocarEspecialidade(integrante.id, e.target.value as Especialidade)
                  }
                  aria-label={`Especialidade de ${integrante.nome}`}
                  className="rounded-lg border-2 border-input bg-background px-2 py-2 text-sm font-bold"
                >
                  {ESPECIALIDADES.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() =>
                  gravar(integrantes.filter((outro) => outro.id !== integrante.id))
                }
                aria-label={`Remover ${integrante.nome}`}
                className="ml-auto flex size-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
