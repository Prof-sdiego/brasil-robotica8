import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bot, Check, Code2, Copy, ExternalLink, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { ManualBotoes } from "@/components/ManualBotoes";
import { INSTRUCOES_INSTALACAO } from "@/lib/catalogo";
import { montarCodigo } from "@/lib/gerador-codigo";
import { AVISO_ANDROID, AVISO_PASSO_DOIS, enderecoDoPainel, PASSOS_CELULAR } from "@/lib/modos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/codigo")({
  head: () => ({
    meta: [
      { title: "Meu código — Oficina de Robótica" },
      {
        name: "description",
        content: "Copie o código do robô e instale no micro:bit do carrinho da sua equipe.",
      },
      { property: "og:title", content: "Meu código — Oficina de Robótica" },
      {
        property: "og:description",
        content: "O código pronto do robô da sua equipe, com o passo a passo da instalação.",
      },
    ],
  }),
  component: TelaCodigo,
});

function CaixaCodigo({
  titulo,
  aviso,
  codigo,
  aoCopiar,
}: {
  titulo: string;
  aviso: string;
  codigo: string;
  aoCopiar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      aoCopiar();
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <section className="cartao-toque overflow-hidden">
      <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <Bot className="size-8" />
        <div className="flex-1">
          <h2 className="text-2xl">{titulo}</h2>
          <p className="text-sm font-bold opacity-90">{aviso}</p>
        </div>
      </div>
      <pre className="max-h-72 overflow-auto bg-muted p-4 font-mono text-xs leading-relaxed">
        {codigo}
      </pre>
      <button
        onClick={copiar}
        className="flex w-full items-center justify-center gap-2 bg-sucesso px-4 py-4 text-lg font-extrabold text-sucesso-foreground active:scale-[0.99]"
      >
        {copiado ? <Check className="size-5" /> : <Copy className="size-5" />}
        {copiado ? "Copiado!" : "Copiar o código do robô"}
      </button>
    </section>
  );
}

function TelaCodigo() {
  const { equipe, carregando, salvar, salvando } = useAluno({
    exigirEquipeCompleta: true,
    area: "codigo",
  });

  const codigos = useMemo(() => (equipe ? montarCodigo(equipe) : null), [equipe]);

  useEffect(() => {
    if (equipe && !equipe.codigoGerado) salvar({ codigoGerado: true });
  }, [equipe, salvar]);

  if (carregando || !equipe || !codigos) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const painel = enderecoDoPainel(equipe);

  const desatualizado =
    Boolean(equipe.ajustesAtualizadosEm) &&
    (!equipe.codigoCopiadoEm ||
      new Date(equipe.ajustesAtualizadosEm!) > new Date(equipe.codigoCopiadoEm));

  function marcarCopiado() {
    salvar({ codigoCopiadoEm: new Date().toISOString() });
  }

  return (
    <>
      <Cabecalho titulo="Meu código" icone={<Code2 className="size-6" />} salvando={salvando} />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-16">
        {desatualizado && (
          <p className="flex items-start gap-3 rounded-2xl bg-info px-4 py-4 text-lg font-extrabold text-info-foreground">
            <AlertTriangle className="mt-0.5 size-6 shrink-0" />
            Vocês mudaram os ajustes. Copiem o código de novo e reinstalem.
          </p>
        )}

        <section className="cartao-toque p-5">
          <h2 className="flex items-center gap-2 text-2xl">
            <Smartphone className="size-6" /> Os três passos da instalação
          </h2>
          <ol className="mt-4 space-y-3">
            {PASSOS_CELULAR.map((passo, indice) => (
              <li
                key={passo.texto}
                className={`flex gap-3 rounded-xl p-4 text-lg font-bold ${
                  passo.destaque
                    ? "bg-alerta text-alerta-foreground ring-4 ring-alerta/40"
                    : "bg-muted text-foreground"
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground">
                  {indice + 1}
                </span>
                <span>
                  {passo.texto}
                  {passo.destaque && (
                    <span className="mt-2 flex items-start gap-2 text-base font-extrabold">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0" /> {AVISO_PASSO_DOIS}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-4 rounded-xl bg-info px-4 py-3 font-bold text-info-foreground">
            {AVISO_ANDROID}
          </p>

          <div className="mt-4 rounded-xl bg-muted p-4">
            <p className="font-bold">
              Senha do robô: <span className="font-mono">{equipe.senhaRobo || "—"}</span>
            </p>
            <label className="mt-3 block text-sm font-bold">
              Nome do micro:bit (as cinco letras que ele mostra ao ligar)
              <input
                value={equipe.nomeMicrobit}
                maxLength={5}
                placeholder="zuvit"
                onChange={(e) => salvar({ nomeMicrobit: e.target.value.toLowerCase() })}
                className="mt-1 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest outline-none focus:border-ring"
              />
            </label>
          </div>
        </section>

        <a
          href={painel}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-5 text-xl font-extrabold text-secondary-foreground active:scale-[0.99]"
        >
          <ExternalLink className="size-5" /> Abrir o painel de pilotagem
        </a>

        <CaixaCodigo
          titulo={codigos.tituloRobo}
          aviso="Vai no micro:bit que está preso no robô"
          codigo={codigos.robo}
          aoCopiar={marcarCopiado}
        />

        <ManualBotoes equipe={equipe} />

        <section className="space-y-4">
          <h2 className="text-2xl">Como colocar o código no seu robô</h2>
          {INSTRUCOES_INSTALACAO.map((parte) => (
            <div key={parte.titulo} className="cartao-toque p-5">
              <h3 className="flex items-center gap-2 text-lg">
                <span aria-hidden="true">{parte.icone}</span>
                {parte.titulo}
              </h3>
              <ol className="mt-3 space-y-3">
                {parte.passos.map((passo, indice) => (
                  <li key={passo} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-black text-accent-foreground">
                      {indice + 1}
                    </span>
                    <span className="font-semibold">{passo}</span>
                  </li>
                ))}
              </ol>
              {parte.nota ? (
                <p className="mt-4 rounded-xl border-l-4 border-info bg-info/10 p-3 text-sm font-semibold">
                  {parte.nota}
                </p>
              ) : null}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
