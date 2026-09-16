import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";

import { Cabecalho } from "@/components/Cabecalho";
import { ManualBotoes } from "@/components/ManualBotoes";
import {
  atribuicaoEfetiva,
  BOTOES,
  MELHORIAS_DE_BOTAO,
  NOME_BOTAO,
  VALOR_COREOGRAFIA,
} from "@/lib/botoes";
import { MELHORIAS } from "@/lib/catalogo";
import type { Botao } from "@/lib/tipos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/botoes")({
  head: () => ({
    meta: [
      { title: "Os três botões — Oficina de Robótica" },
      {
        name: "description",
        content: "Escolham o que cada botão do controle faz: A, B e A+B.",
      },
      { property: "og:title", content: "Os três botões — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Coloquem cada melhoria e cada coreografia no botão que a equipe quiser.",
      },
    ],
  }),
  component: TelaBotoes,
});

function TelaBotoes() {
  const { equipe, carregando, salvar, salvando } = useAluno({ exigirEquipeCompleta: true, area: "programa" });

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const atual = atribuicaoEfetiva(equipe);
  const escolhidasDeBotao = MELHORIAS_DE_BOTAO.filter((id) => equipe.melhorias.includes(id));
  const opcoes = [...escolhidasDeBotao, VALOR_COREOGRAFIA];

  function colocar(botao: Botao, valor: string) {
    if (atual[botao] === valor) return;
    const novo = { ...atual };
    if (valor !== VALOR_COREOGRAFIA) {
      const antigo = BOTOES.find((b) => novo[b] === valor);
      if (antigo) novo[antigo] = atual[botao];
    }
    novo[botao] = valor;
    salvar({ atribuicaoBotoes: novo, ajustesAtualizadosEm: new Date().toISOString() });
  }

  let contador = 0;

  return (
    <>
      <Cabecalho
        titulo="Os três botões"
        icone={<LayoutGrid className="size-6" />}
        salvando={salvando}
      />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-16">
        <p className="rounded-2xl bg-info px-4 py-3 font-bold text-info-foreground">
          O controle só avisa qual botão foi apertado. Quem decide o que acontece é o robô — por
          isso funciona igual nos três modos de pilotagem.
        </p>

        {escolhidasDeBotao.length === 0 && (
          <p className="rounded-2xl bg-muted px-4 py-3 font-bold text-muted-foreground">
            Nenhuma melhoria de botão escolhida: os três botões ficam com coreografias. Para trocar,
            escolham Turbo, Marcha Lenta ou Empinada em{" "}
            <Link to="/melhorias" className="underline">
              Melhorias
            </Link>
            .
          </p>
        )}

        {BOTOES.map((botao) => {
          const valor = atual[botao];
          if (valor === VALOR_COREOGRAFIA) contador += 1;
          const numero = valor === VALOR_COREOGRAFIA ? contador : null;
          return (
            <section key={botao} className="cartao-toque p-5">
              <h2 className="flex items-center gap-3 text-2xl">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">
                  {botao === "AB" ? "A+B" : botao}
                </span>
                {NOME_BOTAO[botao]}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {opcoes.map((opcao) => {
                  const melhoria = MELHORIAS.find((m) => m.id === opcao);
                  const ativa = valor === opcao;
                  const titulo =
                    opcao === VALOR_COREOGRAFIA
                      ? `Coreografia${numero ? ` ${numero}` : ""}`
                      : (melhoria?.nome ?? opcao);
                  return (
                    <button
                      key={opcao}
                      onClick={() => colocar(botao, opcao)}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left font-bold active:scale-[0.99] ${
                        ativa
                          ? "border-sucesso bg-sucesso text-sucesso-foreground"
                          : "border-input bg-background"
                      }`}
                    >
                      <span className="text-2xl" aria-hidden>
                        {opcao === VALOR_COREOGRAFIA ? "🪄" : (melhoria?.icone ?? "⬜")}
                      </span>
                      <span className="flex-1">
                        {titulo}
                        {opcao !== VALOR_COREOGRAFIA && melhoria && (
                          <span className="block text-xs font-semibold opacity-80">
                            {melhoria.frase}
                          </span>
                        )}
                      </span>
                      {ativa && <span aria-hidden>✓</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <ManualBotoes equipe={equipe} />

        <Link
          to="/coreografias"
          className="block rounded-2xl bg-primary px-4 py-5 text-center text-xl font-extrabold text-primary-foreground active:scale-[0.99]"
        >
          Montar as coreografias
        </Link>
      </main>
    </>
  );
}
