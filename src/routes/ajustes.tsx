import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Code2, Compass, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { Deslizante } from "@/components/Deslizante";
import { SECOES_AJUSTES, valorDe, type CampoAjuste } from "@/lib/ajustes";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — Oficina de Robótica" },
      {
        name: "description",
        content:
          "Todos os números do programa do robô em um só lugar: sensibilidade, velocidade, tempo de volta e ajustes avançados.",
      },
      { property: "og:title", content: "Ajustes — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Mudem os números aqui e gerem o código de novo. Ninguém edita o código à mão.",
      },
    ],
  }),
  component: TelaAjustes,
});

const PASSOS_CALIBRACAO = [
  "Ponham o robô no chão e marquem para onde a frente dele aponta.",
  "Apertem o botão B do próprio robô. Ele vai dar uma volta.",
  "Parou apontando para o mesmo lugar? Então está certo.",
  "Girou demais? Diminuam. Girou de menos? Aumentem.",
  "Gerem o código de novo e repitam até fechar.",
];

const DICAS_PROBLEMAS = [
  {
    problema: "Uma roda gira mais rápido que a outra quando vou reto",
    solucao:
      "Aumente a zona morta para os lados. Se continuar, baixe a força do motor mais rápido.",
  },
  {
    problema: "As rodas giram em sentidos opostos quando deveriam ir juntas",
    solucao:
      "Mesma coisa: zona morta para os lados. Sua mão está inclinando de lado sem perceber.",
  },
  {
    problema: "O robô gira no lugar em vez de andar reto",
    solucao: 'Marque "inverter motor esquerdo". Se piorar, desmarque e marque o direito.',
  },
  {
    problema: "O robô anda sozinho sem ninguém mexer",
    solucao:
      "Desligue e ligue o controle, segurando ele parado enquanto aparece o bonequinho dormindo. Se continuar, aumente a zona morta de frente e trás.",
  },
  {
    problema: "O robô anda ao contrário do que eu inclino",
    solucao: 'Marque os dois "inverter motor".',
  },
];

function TelaAjustes() {
  const { equipe, carregando, salvar, salvando } = useAluno({ exigirEquipeCompleta: true });
  const [avancadosAbertos, setAvancadosAbertos] = useState(false);
  const [calibrando, setCalibrando] = useState(false);
  const [dicasAbertas, setDicasAbertas] = useState(false);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const ajustes = equipe.ajustes;

  function mudar(campo: CampoAjuste, novo: number | boolean) {
    salvar({
      ajustes: { ...ajustes, [campo.id]: novo },
      ajustesAtualizadosEm: new Date().toISOString(),
    });
  }

  const campoGiro = SECOES_AJUSTES.find((s) => s.id === "robo")!.campos.find(
    (c) => c.id === "giro360",
  )!;
  const giro = valorDe(campoGiro, ajustes);
  const giroNumero = typeof giro === "number" ? giro : 1100;

  function mudarGiro(delta: number) {
    if (campoGiro.tipo !== "deslizante") return;
    const novo = Math.min(campoGiro.max, Math.max(campoGiro.min, giroNumero + delta));
    mudar(campoGiro, novo);
  }

  return (
    <>
      <Cabecalho
        titulo="Ajustes"
        icone={<SlidersHorizontal className="size-6" />}
        salvando={salvando}
      />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        <p className="mb-5 rounded-2xl bg-info px-4 py-4 font-bold text-info-foreground">
          Ninguém escreve no código. Todo número que o programa usa está aqui. Mudem o que quiserem
          e depois gerem o código de novo.
        </p>

        {SECOES_AJUSTES.filter((s) => !s.avancada).map((secao) => (
          <section key={secao.id} className="cartao-toque mb-5 p-5">
            <h2 className="flex items-center gap-2 text-2xl">
              <span aria-hidden>{secao.icone}</span> {secao.titulo}
            </h2>
            <div className="mt-4 space-y-4">
              {secao.campos.map((campo) => (
                <Deslizante
                  key={campo.id}
                  campo={campo}
                  valor={valorDe(campo, ajustes)}
                  aoMudar={(novo) => mudar(campo, novo)}
                />
              ))}
            </div>
          </section>
        ))}

        <section className="cartao-toque mb-5 p-5">
          <h2 className="flex items-center gap-2 text-2xl">
            <Compass className="size-6 text-primary" /> Calibrar a volta completa
          </h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            O robô precisa saber quanto tempo leva para dar uma volta inteira. A estrela e o
            quadrado dependem disso.
          </p>
          {!calibrando ? (
            <button
              onClick={() => setCalibrando(true)}
              className="mt-4 w-full rounded-2xl bg-secondary px-4 py-4 text-xl font-extrabold text-secondary-foreground active:cartao-toque-ativo"
            >
              Calibrar a volta completa
            </button>
          ) : (
            <div className="mt-4">
              <ol className="space-y-2">
                {PASSOS_CALIBRACAO.map((passo, indice) => (
                  <li key={passo} className="flex gap-3 text-base font-semibold">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-black text-primary-foreground">
                      {indice + 1}
                    </span>
                    {passo}
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => mudarGiro(-50)}
                  className="flex size-16 items-center justify-center rounded-2xl bg-muted text-2xl font-black active:scale-95"
                  aria-label="Diminuir 50"
                >
                  <Minus className="size-8" />
                  <span className="text-lg">50</span>
                </button>
                <span className="rounded-2xl bg-primary px-5 py-4 font-mono text-3xl font-extrabold text-primary-foreground">
                  {giroNumero}
                  <span className="text-base"> ms</span>
                </span>
                <button
                  onClick={() => mudarGiro(50)}
                  className="flex size-16 items-center justify-center rounded-2xl bg-sucesso text-sucesso-foreground active:scale-95"
                  aria-label="Aumentar 50"
                >
                  <Plus className="size-8" />
                  <span className="text-lg">50</span>
                </button>
              </div>

              <Link
                to="/codigo"
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-info px-4 py-4 text-xl font-extrabold text-info-foreground active:cartao-toque-ativo"
              >
                <Code2 className="size-6" /> Ir para o código
              </Link>
              <button
                onClick={() => setCalibrando(false)}
                className="mt-3 w-full text-base font-bold text-secondary underline"
              >
                Fechar o passo a passo
              </button>
            </div>
          )}
        </section>

        {SECOES_AJUSTES.filter((s) => s.avancada).map((secao) => (
          <section key={secao.id} className="cartao-toque mb-5 p-5">
            <button
              onClick={() => setAvancadosAbertos(!avancadosAbertos)}
              aria-expanded={avancadosAbertos}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="flex items-center gap-2 font-display text-2xl font-bold">
                <span aria-hidden>{secao.icone}</span> {secao.titulo}
              </span>
              <ChevronDown
                className={`size-7 shrink-0 transition-transform ${
                  avancadosAbertos ? "rotate-180" : ""
                }`}
              />
            </button>
            {avancadosAbertos && (
              <div className="mt-4">
                {secao.aviso && (
                  <p className="mb-4 rounded-2xl bg-alerta px-4 py-3 font-bold text-alerta-foreground">
                    {secao.aviso}
                  </p>
                )}
                <div className="space-y-4">
                  {secao.campos.map((campo) => (
                    <Deslizante
                      key={campo.id}
                      campo={campo}
                      valor={valorDe(campo, ajustes)}
                      aoMudar={(novo) => mudar(campo, novo)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </main>
    </>
  );
}
