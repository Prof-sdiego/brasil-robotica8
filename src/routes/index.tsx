import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bot, KeyRound, Laptop, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { telaInicial } from "@/lib/acessos";
import { acharPorCodigoPessoal } from "@/lib/codigosPessoais";
import { buscarEquipePorCodigo } from "@/lib/equipes";
import { temProgramador } from "@/lib/equipeStatus";
import { guardarCodigo, guardarIntegrante, useCodigoGuardado } from "@/lib/sessao";
import type { Equipe } from "@/lib/tipos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Oficina de Robótica 8º Ano" },
      {
        name: "description",
        content:
          "Digite o código da sua equipe e depois o seu código pessoal para abrir a sua parte da oficina.",
      },
      { property: "og:title", content: "Entrar — Oficina de Robótica 8º Ano" },
      {
        property: "og:description",
        content: "Cada integrante entra com o seu código e vê a tela do seu papel.",
      },
    ],
  }),
  component: Entrada,
});

function Entrada() {
  const navigate = useNavigate();
  const { codigo: guardado, integranteId } = useCodigoGuardado();
  const [codigo, setCodigo] = useState("");
  const [pessoal, setPessoal] = useState("");
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [erro, setErro] = useState("");
  const [conferindo, setConferindo] = useState(false);

  useEffect(() => {
    if (guardado && integranteId) navigate({ to: "/painel" });
  }, [guardado, integranteId, navigate]);

  async function conferirEquipe(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setConferindo(true);
    try {
      const encontrada = await buscarEquipePorCodigo(codigo);
      if (!encontrada) {
        setErro("Código não encontrado. Confira com o professor.");
        return;
      }
      setEquipe(encontrada);
    } catch {
      setErro("Não conseguimos conferir agora. Tente de novo em alguns segundos.");
    } finally {
      setConferindo(false);
    }
  }

  function entrarComoIntegrante(evento: React.FormEvent) {
    evento.preventDefault();
    if (!equipe) return;
    const integrante = acharPorCodigoPessoal(equipe.integrantes, pessoal);
    if (!integrante) {
      setErro("Esse código pessoal não é desta equipe. Peça ao programador.");
      return;
    }
    guardarCodigo(equipe.codigoAcesso);
    guardarIntegrante(integrante.id);
    navigate({ to: telaInicial(integrante) });
  }

  function entrarComoProgramadorNovo() {
    if (!equipe) return;
    guardarCodigo(equipe.codigoAcesso);
    navigate({ to: "/programador" });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="faixa-topo mx-auto mb-4 flex size-24 items-center justify-center rounded-4xl text-primary-foreground shadow-cartao-alto">
            <Bot className="size-14" />
          </div>
          <h1 className="text-4xl leading-tight">Oficina de Robótica</h1>
          <p className="mt-1 text-lg font-bold text-secondary">8º Ano</p>
        </div>

        {!equipe ? (
          <form onSubmit={conferirEquipe} className="cartao-toque space-y-4 p-5">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Passo 1 de 2
            </p>
            <label htmlFor="codigo" className="flex items-center gap-2 text-lg font-bold">
              <KeyRound className="size-5 text-primary" /> Código de acesso da equipe
            </label>
            <input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="EX: LIMA-7X4K"
              autoComplete="off"
              autoCapitalize="characters"
              className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-center font-mono text-2xl font-bold tracking-widest outline-none focus:border-ring"
            />
            {erro && (
              <p className="rounded-xl bg-destructive px-4 py-3 text-center font-bold text-destructive-foreground">
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={conferindo || codigo.trim().length < 3}
              className="w-full rounded-2xl bg-primary px-4 py-5 text-2xl font-extrabold text-primary-foreground shadow-cartao active:cartao-toque-ativo disabled:opacity-50"
            >
              {conferindo ? "Conferindo..." : "Continuar"}
            </button>
          </form>
        ) : (
          <form onSubmit={entrarComoIntegrante} className="cartao-toque space-y-4 p-5">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Passo 2 de 2
            </p>
            <div className="rounded-2xl bg-sucesso/15 p-4 text-center">
              <p className="font-display text-2xl font-extrabold">{equipe.nomeEquipe}</p>
              <p className="font-bold text-muted-foreground">Turma {equipe.turma}</p>
            </div>
            <label htmlFor="pessoal" className="flex items-center gap-2 text-lg font-bold">
              <UserRound className="size-5 text-primary" /> Seu código pessoal
            </label>
            <input
              id="pessoal"
              value={pessoal}
              onChange={(e) => setPessoal(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="4 letras"
              autoComplete="off"
              autoCapitalize="characters"
              className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-center font-mono text-3xl font-bold tracking-[0.4em] outline-none focus:border-ring"
            />
            {erro && (
              <p className="rounded-xl bg-destructive px-4 py-3 text-center font-bold text-destructive-foreground">
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={pessoal.trim().length < 4}
              className="w-full rounded-2xl bg-primary px-4 py-5 text-2xl font-extrabold text-primary-foreground shadow-cartao active:cartao-toque-ativo disabled:opacity-50"
            >
              Entrar
            </button>

            {!temProgramador(equipe.integrantes) && (
              <button
                type="button"
                onClick={entrarComoProgramadorNovo}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-4 text-lg font-extrabold text-secondary-foreground active:scale-[0.99]"
              >
                <Laptop className="size-5" /> Sou o programador (ainda não tenho código)
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setEquipe(null);
                setPessoal("");
                setErro("");
              }}
              className="flex w-full items-center justify-center gap-2 text-base font-bold text-secondary underline"
            >
              <ArrowLeft className="size-4" /> Não é a minha equipe
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/professor" className="text-base font-bold text-secondary underline">
            Sou o professor
          </Link>
        </div>
      </div>
    </main>
  );
}
