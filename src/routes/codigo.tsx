import { createFileRoute } from "@tanstack/react-router";
import { Check, Code2, Copy, Gamepad2, Bot } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { INSTRUCOES_INSTALACAO } from "@/lib/catalogo";
import { montarCodigo } from "@/lib/gerador-codigo";
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

function CaixaCodigo({
  titulo,
  aviso,
  codigo,
  icone,
  cor,
}: {
  titulo: string;
  aviso: string;
  codigo: string;
  icone: React.ReactNode;
  cor: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
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
  const { equipe, carregando, salvar, salvando } = useAluno();

  const codigos = useMemo(() => (equipe ? montarCodigo(equipe) : null), [equipe]);

  useEffect(() => {
    if (equipe && !equipe.codigoGerado) salvar({ codigoGerado: true });
  }, [equipe, salvar]);

  if (carregando || !equipe || !codigos) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  return (
    <>
      <Cabecalho titulo="Meu código" icone={<Code2 className="size-6" />} salvando={salvando} />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-16">
        <p className="rounded-2xl bg-alerta px-4 py-3 font-bold text-alerta-foreground">
          São dois micro:bit diferentes. Trocar os códigos não funciona: o controle precisa do código
          do CONTROLE e o robô precisa do código do ROBÔ.
        </p>

        <CaixaCodigo
          titulo="CONTROLE"
          aviso="Vai no micro:bit que fica na sua mão"
          codigo={codigos.controle}
          icone={<Gamepad2 className="size-8" />}
          cor="bg-secondary text-secondary-foreground"
        />

        <CaixaCodigo
          titulo="ROBÔ"
          aviso="Vai no micro:bit que está preso no robô"
          codigo={codigos.robo}
          icone={<Bot className="size-8" />}
          cor="bg-primary text-primary-foreground"
        />

        <section className="cartao-toque p-5">
          <h2 className="text-xl">Como instalar</h2>
          <ol className="mt-3 space-y-3">
            {INSTRUCOES_INSTALACAO.map((passo, indice) => (
              <li key={passo} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-black text-accent-foreground">
                  {indice + 1}
                </span>
                <span className="font-semibold">{passo}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
