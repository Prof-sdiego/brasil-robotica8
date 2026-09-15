import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckSquare,
  Code2,
  HelpCircle,
  Lock,
  LogOut,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { useEffect } from "react";

import { BarraProgresso } from "@/components/BarraProgresso";
import { listarFaltantes, papeisFaltantes } from "@/lib/equipeStatus";
import { sairDaEquipe, useTutorialVisto } from "@/lib/sessao";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel da equipe — Oficina de Robótica" },
      {
        name: "description",
        content: "Progresso da equipe, grupo de rádio e atalhos para equipe, melhorias e código.",
      },
      { property: "og:title", content: "Painel da equipe — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Veja o progresso da sua equipe na oficina de robótica.",
      },
    ],
  }),
  component: Painel,
});

const CARTOES = [
  {
    para: "/equipe" as const,
    titulo: "Equipe",
    descricao: "Quem faz o quê",
    icone: Users,
    cor: "bg-secondary text-secondary-foreground",
  },
  {
    para: "/melhorias" as const,
    titulo: "Melhorias",
    descricao: "Escolham até 3",
    icone: Sparkles,
    cor: "bg-primary text-primary-foreground",
  },
  {
    para: "/coreografias" as const,
    titulo: "Coreografias",
    descricao: "Montem as sequências",
    icone: Wand2,
    cor: "bg-accent text-accent-foreground",
  },
  {
    para: "/ajustes" as const,
    titulo: "Ajustes",
    descricao: "Todos os números do robô",
    icone: SlidersHorizontal,
    cor: "bg-alerta text-alerta-foreground",
  },
  {
    para: "/codigo" as const,
    titulo: "Meu código",
    descricao: "Controle e robô",
    icone: Code2,
    cor: "bg-info text-info-foreground",
  },
];

function Painel() {
  const navigate = useNavigate();
  const { equipe, carregando, codigo } = useAluno();
  const { pronto: tutorialPronto, visto: tutorialVisto } = useTutorialVisto(codigo);

  useEffect(() => {
    if (tutorialPronto && !tutorialVisto) navigate({ to: "/tutorial" });
  }, [tutorialPronto, tutorialVisto, navigate]);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const faltantes = papeisFaltantes(equipe.integrantes);
  const travado = faltantes.length > 0;
  const avisoTrava = `Faltam: ${listarFaltantes(faltantes)}. Cadastre a equipe completa para liberar o resto do site.`;
  const feitos = equipe.checklist.filter((item) => item.marcado).length;
  const atualizado = new Date(equipe.atualizadoEm).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-4xl px-4 pb-12">
      <div className="faixa-topo -mx-4 px-5 pt-8 pb-10 text-primary-foreground">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-90">
              Turma {equipe.turma}
            </p>
            <h1 className="text-3xl sm:text-4xl">{equipe.nomeEquipe}</h1>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link
              to="/tutorial"
              className="flex items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold active:scale-95"
            >
              <HelpCircle className="size-4" /> Como funciona
            </Link>
            <button
              onClick={() => {
                sairDaEquipe();
                window.location.href = "/";
              }}
              className="flex items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold active:scale-95"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-card/20 p-4 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-2xl font-extrabold">
            <Radio className="size-7" /> Grupo de rádio {equipe.grupoRadio}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug">
            Ele já está no código. Não mude esse número, ou seu robô vai obedecer ao controle de
            outra equipe.
          </p>
        </div>
      </div>

      <div className="cartao-toque -mt-6 p-5">
        <h2 className="mb-2 text-xl">Nosso progresso</h2>
        <BarraProgresso feitos={feitos} total={equipe.checklist.length} />
      </div>

      {travado && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-alerta px-4 py-4 font-bold text-alerta-foreground">
          <Lock className="mt-0.5 size-5 shrink-0" /> {avisoTrava}
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARTOES.map((cartao) => {
          const bloqueado = travado && cartao.para !== "/equipe";
          if (bloqueado) {
            return (
              <div
                key={cartao.para}
                aria-disabled
                className="cartao-toque flex items-center gap-4 p-5 opacity-50 grayscale"
              >
                <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Lock className="size-8" />
                </span>
                <span>
                  <span className="block font-display text-2xl font-bold">{cartao.titulo}</span>
                  <span className="block text-sm font-semibold text-muted-foreground">
                    Bloqueado até a equipe estar completa
                  </span>
                </span>
              </div>
            );
          }
          return (
            <Link
              key={cartao.para}
              to={cartao.para}
              className="cartao-toque flex items-center gap-4 p-5 active:cartao-toque-ativo"
            >
              <span className={`flex size-16 items-center justify-center rounded-2xl ${cartao.cor}`}>
                <cartao.icone className="size-8" />
              </span>
              <span>
                <span className="block font-display text-2xl font-bold">{cartao.titulo}</span>
                <span className="block text-sm font-semibold text-muted-foreground">
                  {cartao.descricao}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {travado ? (
        <div
          aria-disabled
          className="cartao-toque mt-4 flex items-center gap-4 p-5 opacity-50 grayscale"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Lock className="size-8" />
          </span>
          <span>
            <span className="block font-display text-2xl font-bold">Checklist</span>
            <span className="block text-sm font-semibold text-muted-foreground">
              Bloqueado até a equipe estar completa
            </span>
          </span>
        </div>
      ) : (
        <Link
          to="/checklist"
          className="cartao-toque mt-4 flex items-center gap-4 p-5 active:cartao-toque-ativo"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-sucesso text-sucesso-foreground">
            <CheckSquare className="size-8" />
          </span>
          <span>
            <span className="block font-display text-2xl font-bold">Checklist</span>
            <span className="block text-sm font-semibold text-muted-foreground">
              {feitos} de {equipe.checklist.length} itens prontos
            </span>
          </span>
        </Link>
      )}


      <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
        Última atualização: {atualizado}
      </p>
    </main>
  );
}
