import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Bot } from "lucide-react";
import { useEffect, useState } from "react";

import { buscarEquipePorCodigo } from "@/lib/equipes";
import { guardarCodigo, useCodigoGuardado } from "@/lib/sessao";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Oficina de Robótica 8º Ano" },
      {
        name: "description",
        content:
          "Digite o código de acesso da sua equipe para montar o código dos micro:bit do seu robô.",
      },
      { property: "og:title", content: "Entrar — Oficina de Robótica 8º Ano" },
      {
        property: "og:description",
        content: "Digite o código de acesso da sua equipe para começar a oficina de robótica.",
      },
    ],
  }),
  component: Entrada,
});

function Entrada() {
  const navigate = useNavigate();
  const { codigo: guardado } = useCodigoGuardado();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [conferindo, setConferindo] = useState(false);

  useEffect(() => {
    if (guardado) navigate({ to: "/painel" });
  }, [guardado, navigate]);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setConferindo(true);
    try {
      const equipe = await buscarEquipePorCodigo(codigo);
      if (!equipe) {
        setErro("Código não encontrado. Confira com o professor.");
        return;
      }
      guardarCodigo(equipe.codigoAcesso);
      navigate({ to: "/painel" });
    } catch {
      setErro("Não conseguimos conferir agora. Tente de novo em alguns segundos.");
    } finally {
      setConferindo(false);
    }
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

        <form onSubmit={entrar} className="cartao-toque space-y-4 p-5">
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
            {conferindo ? "Conferindo..." : "Entrar"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/professor" className="text-base font-bold text-secondary underline">
            Sou o professor
          </Link>
        </div>
      </div>
    </main>
  );
}
