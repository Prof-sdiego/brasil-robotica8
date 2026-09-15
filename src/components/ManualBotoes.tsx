import { Printer } from "lucide-react";

import { acoesDosBotoes, NOME_BOTAO } from "@/lib/botoes";
import type { Equipe } from "@/lib/tipos";

/** Quadro do que cada botão faz nesta equipe. É o que a equipe consulta na competição. */
export function ManualBotoes({
  equipe,
  comImpressao = true,
}: {
  equipe: Equipe;
  comImpressao?: boolean;
}) {
  const acoes = acoesDosBotoes(equipe);

  function imprimir() {
    const linhas = acoes
      .map(
        (a) =>
          `<div class="item"><h2>${NOME_BOTAO[a.botao]} — ${a.titulo}</h2><p>${a.descricao}</p></div>`,
      )
      .join("");
    const janela = window.open("", "_blank", "width=720,height=900");
    if (!janela) return;
    janela.document.write(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Manual dos botões — ${equipe.nomeEquipe}</title>` +
        `<style>body{font-family:system-ui,sans-serif;padding:32px;color:#1b1b1b}h1{font-size:28px;margin:0 0 4px}` +
        `.turma{color:#555;margin:0 0 24px}.item{border:2px solid #ddd;border-radius:12px;padding:16px;margin-bottom:14px}` +
        `.item h2{font-size:21px;margin:0 0 6px}.item p{margin:0;font-size:16px}</style></head><body>` +
        `<h1>Manual dos botões — ${equipe.nomeEquipe}</h1><p class="turma">Turma ${equipe.turma}</p>${linhas}</body></html>`,
    );
    janela.document.close();
    janela.focus();
    janela.print();
  }

  return (
    <section className="cartao-toque p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl">O que cada botão faz</h2>
        {comImpressao && (
          <button
            onClick={imprimir}
            className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-extrabold text-secondary-foreground active:scale-95"
          >
            <Printer className="size-4" /> Imprimir o manual
          </button>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {acoes.map((acao) => (
          <div key={acao.botao} className="flex items-start gap-3 rounded-2xl bg-muted p-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">
              {acao.botao === "AB" ? "A+B" : acao.botao}
            </span>
            <div>
              <p className="font-display text-xl font-bold">
                <span aria-hidden>{acao.icone}</span> {acao.titulo}
              </p>
              <p className="text-sm font-semibold text-muted-foreground">{acao.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
