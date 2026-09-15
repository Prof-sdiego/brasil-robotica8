import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Laptop } from "lucide-react";
import { useEffect, useState } from "react";

import { temProgramador } from "@/lib/equipeStatus";
import type { Integrante } from "@/lib/tipos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/programador")({
  head: () => ({
    meta: [
      { title: "Quem é o programador? — Oficina de Robótica" },
      {
        name: "description",
        content: "Diga seu nome para entrar na lista da equipe como programador da oficina.",
      },
      { property: "og:title", content: "Quem é o programador? — Oficina de Robótica" },
      {
        property: "og:description",
        content: "O programador da equipe se apresenta antes de abrir o painel.",
      },
    ],
  }),
  component: TelaProgramador,
});

function TelaProgramador() {
  const navigate = useNavigate();
  const { equipe, carregando, salvar } = useAluno({ pularConferencias: true });
  const [nome, setNome] = useState("");

  const jaTem = equipe ? temProgramador(equipe.integrantes) : false;

  useEffect(() => {
    if (jaTem) navigate({ to: "/painel" });
  }, [jaTem, navigate]);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  function confirmar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!nome.trim()) return;
    const novo: Integrante = { id: crypto.randomUUID(), nome: nome.trim(), papel: "Programador" };
    salvar({ integrantes: [...(equipe?.integrantes ?? []), novo] });
    navigate({ to: "/painel" });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <form onSubmit={confirmar} className="cartao-toque w-full max-w-md space-y-4 p-6">
        <div className="faixa-topo mx-auto flex size-20 items-center justify-center rounded-3xl text-primary-foreground">
          <Laptop className="size-10" />
        </div>
        <h1 className="text-center text-3xl leading-tight">Qual é o seu nome?</h1>
        <p className="text-center text-base font-semibold text-muted-foreground">
          Você é o programador da equipe. Seu nome vai entrar na lista.
        </p>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          autoComplete="off"
          className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-center text-xl font-bold outline-none focus:border-ring"
        />
        <button
          type="submit"
          disabled={!nome.trim()}
          className="w-full rounded-2xl bg-primary px-4 py-5 text-2xl font-extrabold text-primary-foreground shadow-cartao active:cartao-toque-ativo disabled:opacity-50"
        >
          Confirmar
        </button>
      </form>
    </main>
  );
}
