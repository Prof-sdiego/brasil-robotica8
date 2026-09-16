import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Check, Gamepad2 } from "lucide-react";

import { Cabecalho } from "@/components/Cabecalho";
import { MODOS } from "@/lib/modos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/pilotagem")({
  head: () => ({
    meta: [
      { title: "Como vocês vão pilotar — Oficina de Robótica" },
      {
        name: "description",
        content:
          "Escolham entre pilotar inclinando o micro:bit, pelo teclado do computador ou pelo celular.",
      },
      { property: "og:title", content: "Como vocês vão pilotar — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Três modos de pilotar o robô: inclinação, teclado do computador ou celular.",
      },
    ],
  }),
  component: TelaPilotagem,
});

function TelaPilotagem() {
  const { equipe, carregando, salvar, salvando } = useAluno({ exigirEquipeCompleta: true, area: "programa" });

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const escolhido = equipe.modoPilotagem || "inclinacao";

  function escolher(id: string) {
    if (id === escolhido) return;
    salvar({ modoPilotagem: id, ajustesAtualizadosEm: new Date().toISOString() });
  }

  return (
    <>
      <Cabecalho
        titulo="Como vocês vão pilotar"
        icone={<Gamepad2 className="size-6" />}
        salvando={salvando}
      />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-16">
        <p className="rounded-2xl bg-info px-4 py-3 font-bold text-info-foreground">
          Todas as melhorias funcionam nos três modos. Podem trocar depois — mas aí precisam
          instalar os programas de novo nos micro:bit.
        </p>

        {MODOS.map((modo) => {
          const ativo = escolhido === modo.id;
          return (
            <button
              key={modo.id}
              onClick={() => escolher(modo.id)}
              className={`cartao-toque block w-full p-5 text-left active:cartao-toque-ativo ${
                ativo ? "border-primary ring-4 ring-primary/30" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${modo.cor}`}
                  aria-hidden
                >
                  {modo.icone}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-2xl font-bold">
                    {modo.numero} · {modo.nome}
                  </span>
                  <span className="block text-sm font-semibold text-muted-foreground">
                    {modo.frase}
                  </span>
                </span>
                {ativo && (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sucesso text-sucesso-foreground">
                    <Check className="size-5" />
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-1">
                {modo.pontos.map((ponto) => (
                  <li key={ponto} className="flex gap-2 text-sm font-semibold">
                    <span aria-hidden>•</span> {ponto}
                  </li>
                ))}
              </ul>
              {ativo && (
                <p className="mt-3 rounded-xl bg-sucesso px-3 py-2 text-sm font-extrabold text-sucesso-foreground">
                  Este é o modo da sua equipe.
                </p>
              )}
            </button>
          );
        })}

        {escolhido === "celular" && (
          <section className="cartao-toque p-5">
            <h2 className="text-2xl">O nome do seu micro:bit</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              Ligue o micro:bit do robô. Ele mostra cinco letras na tela. Digite essas letras aqui
              para achar o robô certo na hora de conectar o celular.
            </p>
            <input
              value={equipe.nomeMicrobit}
              maxLength={5}
              placeholder="zuvit"
              onChange={(e) => salvar({ nomeMicrobit: e.target.value.toLowerCase() })}
              className="mt-3 w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-center font-mono text-2xl font-bold tracking-widest outline-none focus:border-ring"
            />
            <p className="mt-3 rounded-xl bg-muted px-3 py-2 font-bold">
              Senha do robô da equipe: <span className="font-mono">{equipe.senhaRobo || "—"}</span>
            </p>
          </section>
        )}

        <p className="flex items-start gap-2 rounded-2xl bg-alerta px-4 py-3 font-bold text-alerta-foreground">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          Trocar de modo muda o código: será preciso copiar e reinstalar os programas.
        </p>
      </main>
    </>
  );
}
