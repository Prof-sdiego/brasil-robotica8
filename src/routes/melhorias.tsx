import { createFileRoute } from "@tanstack/react-router";
import { Music, Sparkles } from "lucide-react";
import { useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { EtiquetaIntensidade } from "@/components/Etiqueta";
import { MAXIMO_MELHORIAS, MELHORIAS, MELODIAS } from "@/lib/catalogo";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/melhorias")({
  head: () => ({
    meta: [
      { title: "Melhorias — Oficina de Robótica" },
      {
        name: "description",
        content: "Escolham até três melhorias para o robô e expliquem o motivo da escolha.",
      },
      { property: "og:title", content: "Melhorias — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Turbo, marcha lenta, som de abertura: escolham as três melhorias do robô.",
      },
    ],
  }),
  component: TelaMelhorias,
});

function TelaMelhorias() {
  const { equipe, carregando, salvar, salvando } = useAluno({ exigirEquipeCompleta: true });
  const [aviso, setAviso] = useState("");

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const escolhidas = equipe.melhorias;

  function alternar(id: string) {
    setAviso("");
    if (escolhidas.includes(id)) {
      const novas = escolhidas.filter((m) => m !== id);
      salvar({
        melhorias: novas,
        ...(id === "som_abertura" ? { melodiaAbertura: null } : {}),
      });
      return;
    }
    let novas = [...escolhidas];
    if (id === "turbo" && novas.includes("marcha_lenta")) {
      novas = novas.filter((m) => m !== "marcha_lenta");
      setAviso("Turbo e Marcha Lenta disputam o mesmo botão. Escolham uma.");
    }
    if (id === "marcha_lenta" && novas.includes("turbo")) {
      novas = novas.filter((m) => m !== "turbo");
      setAviso("Turbo e Marcha Lenta disputam o mesmo botão. Escolham uma.");
    }
    if (novas.length >= MAXIMO_MELHORIAS) {
      setAviso("Vocês já escolheram 3. Desmarquem uma antes de escolher outra.");
      return;
    }
    salvar({ melhorias: [...novas, id] });
  }

  const comSom = escolhidas.includes("som_abertura");

  return (
    <>
      <Cabecalho titulo="Melhorias" icone={<Sparkles className="size-6" />} salvando={salvando} />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        <div className="sticky top-[68px] z-10 mb-4 rounded-2xl bg-primary px-4 py-3 text-center text-xl font-extrabold text-primary-foreground shadow-cartao">
          Escolhidas: {escolhidas.length} de {MAXIMO_MELHORIAS}
        </div>

        {aviso && (
          <p className="mb-4 rounded-2xl bg-alerta px-4 py-3 font-bold text-alerta-foreground">
            {aviso}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MELHORIAS.map((melhoria) => {
            const ativa = escolhidas.includes(melhoria.id);
            return (
              <button
                key={melhoria.id}
                onClick={() => alternar(melhoria.id)}
                className={`cartao-toque p-4 text-left active:cartao-toque-ativo ${
                  ativa ? "border-primary ring-4 ring-primary/30" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl" aria-hidden>
                    {melhoria.icone}
                  </span>
                  <span className="flex-1 font-display text-2xl font-bold">{melhoria.nome}</span>
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-lg font-black ${
                      ativa ? "bg-sucesso text-sucesso-foreground" : "bg-muted text-muted-foreground"
                    }`}
                    aria-hidden
                  >
                    {ativa ? "✓" : "+"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{melhoria.frase}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <EtiquetaIntensidade rotulo="Batalha" nivel={melhoria.batalha} />
                  <EtiquetaIntensidade rotulo="Demonstração" nivel={melhoria.demonstracao} />
                </div>
              </button>
            );
          })}
        </div>

        {comSom && (
          <section className="cartao-toque mt-6 p-5">
            <h2 className="flex items-center gap-2 text-xl">
              <Music className="size-5 text-primary" /> Qual melodia de abertura?
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {MELODIAS.map((melodia) => {
                const ativa = equipe.melodiaAbertura === melodia.id;
                return (
                  <button
                    key={melodia.id}
                    onClick={() => salvar({ melodiaAbertura: melodia.id })}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left text-lg font-bold ${
                      ativa
                        ? "border-secondary bg-secondary text-secondary-foreground"
                        : "border-input bg-background"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {melodia.icone}
                    </span>
                    {melodia.nome}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="cartao-toque mt-6 p-5">
          <label htmlFor="justificativa" className="text-lg font-bold">
            Em poucas linhas: por que vocês escolheram essas três?
          </label>
          <textarea
            id="justificativa"
            value={equipe.justificativa}
            onChange={(e) => salvar({ justificativa: e.target.value })}
            rows={5}
            placeholder="Escrevam aqui o motivo da escolha da equipe..."
            className="mt-3 w-full rounded-xl border-2 border-input bg-background p-4 text-base font-semibold outline-none focus:border-ring"
          />
          {equipe.justificativa.trim().length === 0 && (
            <p className="mt-2 text-sm font-bold text-destructive">
              Este campo é obrigatório: o professor precisa ler a explicação da equipe.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
