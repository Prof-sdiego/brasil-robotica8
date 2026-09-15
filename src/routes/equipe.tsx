import { createFileRoute } from "@tanstack/react-router";
import { Lock, PartyPopper, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import { MAXIMO_INTEGRANTES, PAPEIS } from "@/lib/catalogo";
import { listarFaltantes, papeisFaltantes } from "@/lib/equipeStatus";
import type { Integrante, Papel } from "@/lib/tipos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe — Oficina de Robótica" },
      {
        name: "description",
        content: "Cadastre os integrantes da equipe e o papel de cada um: piloto, copiloto e mais.",
      },
      { property: "og:title", content: "Equipe — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Quem faz o quê na equipe de robótica: piloto, copiloto, engenheiro, programador.",
      },
    ],
  }),
  component: TelaEquipe,
});

function TelaEquipe() {
  const { equipe, carregando, salvar, salvando } = useAluno();
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel | "">("");
  const [aberto, setAberto] = useState(false);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const integrantes = equipe.integrantes;

  function ocupantes(papelBuscado: Papel) {
    return integrantes.filter((i) => i.papel === papelBuscado);
  }

  function vagasLivres(papelBuscado: Papel) {
    const definicao = PAPEIS.find((p) => p.papel === papelBuscado);
    return (definicao?.vagas ?? 0) - ocupantes(papelBuscado).length;
  }

  function adicionar() {
    if (!nome.trim() || !papel) return;
    if (integrantes.length >= MAXIMO_INTEGRANTES) return;
    if (vagasLivres(papel) <= 0) return;
    const novo: Integrante = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      papel,
    };
    salvar({ integrantes: [...integrantes, novo] });
    setNome("");
    setPapel("");
    setAberto(false);
  }

  function remover(id: string) {
    salvar({ integrantes: integrantes.filter((i) => i.id !== id) });
  }

  function trocarPapel(id: string, novoPapel: Papel) {
    salvar({
      integrantes: integrantes.map((i) => (i.id === id ? { ...i, papel: novoPapel } : i)),
    });
  }

  return (
    <>
      <Cabecalho titulo="Equipe" icone={<Users className="size-6" />} salvando={salvando} />
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        <div className="cartao-toque mb-5 p-4">
          <p className="text-base font-bold">
            {integrantes.length} de {MAXIMO_INTEGRANTES} pessoas na equipe
          </p>
          <ul className="mt-3 space-y-1 text-sm font-semibold text-muted-foreground">
            {PAPEIS.map((p) => (
              <li key={p.papel}>
                {p.icone} <span className="text-foreground">{p.papel}</span> — {p.descricao}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          {integrantes.length === 0 && (
            <p className="rounded-2xl bg-muted p-5 text-center font-bold text-muted-foreground">
              Ninguém cadastrado ainda. Comecem pelo piloto!
            </p>
          )}
          {integrantes.map((integrante) => (
            <div key={integrante.id} className="cartao-toque flex items-center gap-3 p-4">
              <span className="text-3xl" aria-hidden>
                {PAPEIS.find((p) => p.papel === integrante.papel)?.icone}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">{integrante.nome}</p>
                <select
                  value={integrante.papel}
                  onChange={(e) => trocarPapel(integrante.id, e.target.value as Papel)}
                  className="mt-1 w-full rounded-lg border-2 border-input bg-background px-2 py-2 text-sm font-bold"
                  aria-label={`Papel de ${integrante.nome}`}
                >
                  {PAPEIS.map((p) => {
                    const proprio = p.papel === integrante.papel;
                    const cheio = vagasLivres(p.papel) <= 0 && !proprio;
                    return (
                      <option key={p.papel} value={p.papel} disabled={cheio}>
                        {p.papel}
                        {cheio ? ` (ocupado por ${ocupantes(p.papel)[0]?.nome ?? "alguém"})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button
                onClick={() => remover(integrante.id)}
                aria-label={`Remover ${integrante.nome}`}
                className="flex size-12 items-center justify-center rounded-xl bg-destructive text-destructive-foreground active:scale-95"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          ))}
        </div>

        {aberto ? (
          <div className="cartao-toque mt-5 space-y-4 p-5">
            <h2 className="text-xl">Nova pessoa</h2>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
              className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-lg font-bold outline-none focus:border-ring"
            />
            <div className="grid grid-cols-1 gap-2">
              {PAPEIS.map((p) => {
                const cheio = vagasLivres(p.papel) <= 0;
                const escolhido = papel === p.papel;
                return (
                  <button
                    key={p.papel}
                    disabled={cheio}
                    onClick={() => setPapel(p.papel)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left font-bold ${
                      escolhido
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background"
                    } disabled:opacity-40`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {p.icone}
                    </span>
                    <span className="flex-1">
                      {p.papel}
                      <span className="block text-xs font-semibold opacity-80">
                        {cheio
                          ? `Vaga ocupada: ${ocupantes(p.papel)
                              .map((o) => o.nome)
                              .join(", ")}`
                          : p.descricao}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={adicionar}
                disabled={!nome.trim() || !papel}
                className="flex-1 rounded-2xl bg-sucesso px-4 py-4 text-lg font-extrabold text-sucesso-foreground disabled:opacity-50"
              >
                Salvar pessoa
              </button>
              <button
                onClick={() => setAberto(false)}
                className="rounded-2xl bg-muted px-5 py-4 text-lg font-bold text-muted-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAberto(true)}
            disabled={integrantes.length >= MAXIMO_INTEGRANTES}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-5 text-xl font-extrabold text-secondary-foreground shadow-cartao active:cartao-toque-ativo disabled:opacity-50"
          >
            <UserPlus className="size-6" />
            {integrantes.length >= MAXIMO_INTEGRANTES ? "Equipe completa" : "Adicionar pessoa"}
            {integrantes.length < MAXIMO_INTEGRANTES && <Plus className="size-5" />}
          </button>
        )}
      </main>
    </>
  );
}
