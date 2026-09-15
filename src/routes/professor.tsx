import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, ListPlus, LayoutGrid, LogOut, Lock, Gamepad2 } from "lucide-react";
import { useState } from "react";

import { conferirSenhaProfessor } from "@/lib/professor.functions";
import { entrarComoProfessor, sairDoProfessor, useProfessorLogado } from "@/lib/sessao";

export const Route = createFileRoute("/professor")({
  component: AreaProfessor,
});

function AreaProfessor() {
  const { pronto, logado, marcarLogado } = useProfessorLogado();
  const conferir = useServerFn(conferirSenhaProfessor);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [conferindo, setConferindo] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setConferindo(true);
    try {
      const resposta = await conferir({ data: { senha } });
      if (resposta.ok) {
        entrarComoProfessor();
        marcarLogado();
      } else {
        setErro("Senha incorreta.");
      }
    } catch {
      setErro("Não foi possível conferir a senha agora. Tente de novo.");
    } finally {
      setConferindo(false);
    }
  }

  if (!pronto) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  if (!logado) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <form onSubmit={entrar} className="cartao-toque w-full max-w-sm space-y-4 p-6">
          <h1 className="flex items-center gap-2 text-2xl">
            <GraduationCap className="size-7 text-secondary" /> Área do professor
          </h1>
          <label htmlFor="senha" className="flex items-center gap-2 font-bold">
            <Lock className="size-4" /> Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-lg font-bold outline-none focus:border-ring"
          />
          {erro && (
            <p className="rounded-xl bg-destructive px-4 py-3 font-bold text-destructive-foreground">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={conferindo || !senha}
            className="w-full rounded-2xl bg-secondary px-4 py-4 text-xl font-extrabold text-secondary-foreground shadow-cartao disabled:opacity-50"
          >
            {conferindo ? "Conferindo..." : "Entrar"}
          </button>
          <Link to="/" className="block text-center font-bold text-secondary underline">
            Voltar para a entrada das equipes
          </Link>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="faixa-topo sticky top-0 z-20 px-4 py-3 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <h1 className="flex flex-1 items-center gap-2 text-xl font-bold">
            <GraduationCap className="size-6" /> Área do professor
          </h1>
          <Link
            to="/professor"
            activeOptions={{ exact: true }}
            className="flex items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold"
            activeProps={{ className: "bg-card text-secondary" }}
          >
            <LayoutGrid className="size-4" /> Visão geral
          </Link>
          <Link
            to="/professor/cadastro"
            className="flex items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold"
            activeProps={{ className: "bg-card text-secondary" }}
          >
            <ListPlus className="size-4" /> Equipes
          </Link>
          <Link
            to="/professor/pilotar"
            className="flex items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold"
            activeProps={{ className: "bg-card text-secondary" }}
          >
            <Gamepad2 className="size-4" /> Pilotar
          </Link>
          <button
            onClick={() => {
              sairDoProfessor();
              window.location.href = "/";
            }}
            className="flex items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
