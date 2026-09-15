import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bot, Check, Code2, Copy, ExternalLink, Gamepad2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { ManualBotoes } from "@/components/ManualBotoes";
import { rotulosDosBotoes } from "@/lib/botoes";
import { INSTRUCOES_INSTALACAO } from "@/lib/catalogo";
import { montarCodigo } from "@/lib/gerador-codigo";
import { AVISO_TECLADO, modoDe, PASSOS_CELULAR } from "@/lib/modos";
import type { Equipe } from "@/lib/tipos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/codigo")({
  head: () => ({
    meta: [
      { title: "Meu código — Oficina de Robótica" },
      {
        name: "description",
        content: "Copie o código do controle e o código do robô e instale em cada micro:bit.",
      },
      { property: "og:title", content: "Meu código — Oficina de Robótica" },
      {
        property: "og:description",
        content: "O código pronto do controle e do robô da sua equipe, com o passo a passo.",
      },
    ],
  }),
  component: TelaCodigo,
});

function enderecoDoPainel(equipe: Equipe): string | null {
  const modo = equipe.modoPilotagem || "inclinacao";
  const { ba, bb, bab } = rotulosDosBotoes(equipe);
  const partes = [
    `ba=${encodeURIComponent(ba)}`,
    `bb=${encodeURIComponent(bb)}`,
    `bab=${encodeURIComponent(bab)}`,
  ];
  if (modo === "teclado") return `/pilotar-teclado.html?${partes.join("&")}`;
  if (modo === "celular") {
    return `/pilotar-celular.html?senha=${encodeURIComponent(
      equipe.senhaRobo,
    )}&nome=${encodeURIComponent(equipe.nomeMicrobit)}&${partes.join("&")}`;
  }
  return null;
}

function CaixaCodigo({
  titulo,
  aviso,
  codigo,
  icone,
  cor,
  aoCopiar,
}: {
  titulo: string;
  aviso: string;
  codigo: string;
  icone: React.ReactNode;
  cor: string;
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
      <div className={`flex items-center gap-3 px-4 py-3 ${cor}`}>
        {icone}
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
        {copiado ? "Copiado!" : `Copiar código do ${titulo.toLowerCase()}`}
      </button>
    </section>
  );
}

function TelaCodigo() {
  const { equipe, carregando, salvar, salvando } = useAluno({ exigirEquipeCompleta: true });

  const codigos = useMemo(() => (equipe ? montarCodigo(equipe) : null), [equipe]);

  useEffect(() => {
    if (equipe && !equipe.codigoGerado) salvar({ codigoGerado: true });
  }, [equipe, salvar]);

  if (carregando || !equipe || !codigos) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const modo = modoDe(equipe.modoPilotagem);
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

        <p className="rounded-2xl bg-muted px-4 py-3 font-bold">
          <span aria-hidden>{modo.icone}</span> Modo de pilotagem: {modo.nome}
        </p>

        {modo.id === "celular" ? (
          <section className="cartao-toque p-5">
            <h2 className="text-2xl">Antes de instalar, três passos</h2>
            <ol className="mt-3 space-y-3">
              {PASSOS_CELULAR.map((passo, indice) => (
                <li
                  key={passo.texto}
                  className={`flex gap-3 rounded-xl p-3 font-bold ${
                    passo.destaque
                      ? "bg-alerta text-alerta-foreground"
                      : "bg-background text-foreground"
                  }`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-black text-primary-foreground">
                    {indice + 1}
                  </span>
                  <span>
                    {passo.texto}
                    {passo.destaque && (
                      <span className="mt-1 block text-sm font-extrabold">
                        Este é o passo mais esquecido. Sem ele o celular não conecta.
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-xl bg-muted p-3 font-bold">
              Senha do robô: <span className="font-mono">{equipe.senhaRobo || "—"}</span> · Nome do
              micro:bit: <span className="font-mono">{equipe.nomeMicrobit || "—"}</span>
            </p>
          </section>
        ) : (
          <p className="rounded-2xl bg-alerta px-4 py-3 font-bold text-alerta-foreground">
            São dois micro:bit diferentes. Trocar os códigos não funciona: o controle precisa do
            código do CONTROLE e o robô precisa do código do ROBÔ.
          </p>
        )}

        {modo.id === "teclado" && (
          <p className="flex items-start gap-3 rounded-2xl bg-alerta px-4 py-3 font-bold text-alerta-foreground">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            {AVISO_TECLADO}
          </p>
        )}

        {painel && (
          <a
            href={painel}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-5 text-xl font-extrabold text-secondary-foreground active:scale-[0.99]"
          >
            <ExternalLink className="size-5" /> Abrir o painel de pilotagem
          </a>
        )}

        {codigos.controle && (
          <CaixaCodigo
            titulo={codigos.tituloControle}
            aviso={
              modo.id === "teclado"
                ? "Vai no micro:bit ligado ao computador pelo cabo"
                : "Vai no micro:bit que fica na sua mão"
            }
            codigo={codigos.controle}
            icone={<Gamepad2 className="size-8" />}
            cor="bg-secondary text-secondary-foreground"
            aoCopiar={marcarCopiado}
          />
        )}

        <CaixaCodigo
          titulo={codigos.tituloRobo}
          aviso="Vai no micro:bit que está preso no robô"
          codigo={codigos.robo}
          icone={<Bot className="size-8" />}
          cor="bg-primary text-primary-foreground"
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
