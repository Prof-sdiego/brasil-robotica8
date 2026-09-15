import { createFileRoute } from "@tanstack/react-router";
import { Music, Play, Sparkles } from "lucide-react";
import { useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { Deslizante } from "@/components/Deslizante";
import { EtiquetaIntensidade } from "@/components/Etiqueta";
import { AJUSTES_MELHORIAS, valorDe, type CampoAjuste } from "@/lib/ajustes";
import { MAXIMO_MELHORIAS, MELHORIAS, MELODIAS } from "@/lib/catalogo";
import { tocarNotas } from "@/lib/tocar";
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
  const ajustesMelhorias = equipe.ajustesMelhorias;

  function mudarAjuste(melhoriaId: string, campo: CampoAjuste, novo: number | boolean) {
    salvar({
      ajustesMelhorias: {
        ...ajustesMelhorias,
        [melhoriaId]: { ...(ajustesMelhorias[melhoriaId] ?? {}), [campo.id]: novo },
      },
      ajustesAtualizadosEm: new Date().toISOString(),
    });
  }

  function alternar(id: string) {
    setAviso("");
    if (escolhidas.includes(id)) {
      const novas = escolhidas.filter((m) => m !== id);
      salvar({
        melhorias: novas,
        ajustesAtualizadosEm: new Date().toISOString(),
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
    salvar({
      melhorias: [...novas, id],
      ajustesAtualizadosEm: new Date().toISOString(),
      ...(equipe?.avisoCatalogo ? { avisoCatalogo: false } : {}),
    });
  }

  const comSom = escolhidas.includes("som_abertura");

  return (
    <>
      <Cabecalho titulo="Melhorias" icone={<Sparkles className="size-6" />} salvando={salvando} />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        <div className="sticky top-[68px] z-10 mb-4 rounded-2xl bg-primary px-4 py-3 text-center text-xl font-extrabold text-primary-foreground shadow-cartao">
          Escolhidas: {escolhidas.length} de {MAXIMO_MELHORIAS}
        </div>

        {equipe.avisoCatalogo && (
          <div className="mb-4 rounded-2xl bg-info px-4 py-4 text-info-foreground">
            <p className="font-extrabold">O catálogo de melhorias mudou. Escolham de novo.</p>
            <button
              onClick={() => salvar({ avisoCatalogo: false })}
              className="mt-2 rounded-full bg-card/30 px-4 py-2 text-sm font-bold"
            >
              Entendi
            </button>
          </div>
        )}

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
                  <div
                    key={melodia.id}
                    className={`flex items-center gap-2 rounded-2xl border-2 p-2 ${
                      ativa
                        ? "border-secondary bg-secondary text-secondary-foreground"
                        : "border-input bg-background"
                    }`}
                  >
                    <button
                      onClick={() => salvar({ melodiaAbertura: melodia.id })}
                      className="flex flex-1 items-center gap-3 p-2 text-left text-lg font-bold"
                    >
                      <span className="text-2xl" aria-hidden>
                        {melodia.icone}
                      </span>
                      {melodia.nome}
                    </button>
                    <button
                      onClick={() => void tocarNotas(melodia.notas)}
                      aria-label={`Ouvir ${melodia.nome}`}
                      className="flex items-center gap-1 rounded-xl bg-primary px-3 py-3 text-sm font-extrabold text-primary-foreground active:scale-95"
                    >
                      <Play className="size-5" /> Ouvir
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {escolhidas
          .map((id) => MELHORIAS.find((m) => m.id === id))
          .filter((m): m is (typeof MELHORIAS)[number] => Boolean(m))
          .filter((m) => (AJUSTES_MELHORIAS[m.id] ?? []).length > 0)
          .map((melhoria) => (
            <section key={melhoria.id} className="cartao-toque mt-6 p-5">
              <h2 className="flex items-center gap-2 text-2xl">
                <span aria-hidden>{melhoria.icone}</span> Ajustes do {melhoria.nome}
              </h2>
              <div className="mt-4 space-y-4">
                {(AJUSTES_MELHORIAS[melhoria.id] ?? []).map((campo) => (
                  <Deslizante
                    key={campo.id}
                    campo={campo}
                    valor={valorDe(campo, ajustesMelhorias[melhoria.id])}
                    aoMudar={(novo) => mudarAjuste(melhoria.id, campo, novo)}
                  />
                ))}
              </div>
            </section>
          ))}

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
