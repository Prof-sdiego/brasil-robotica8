import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Lock,
  PartyPopper,
  Plus,
  Printer,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Cabecalho } from "@/components/Cabecalho";
import {
  ESPECIALIDADES,
  descricaoAcesso,
  especialidadeDe,
  papelCompleto,
} from "@/lib/acessos";
import { MAXIMO_INTEGRANTES, PAPEIS } from "@/lib/catalogo";
import { codigosDaEquipe, novoCodigoPessoal } from "@/lib/codigosPessoais";
import {
  AVISO_ULTIMO_PROGRAMACAO,
  ajudantesDeProgramacao,
  listarFaltantes,
  papeisFaltantes,
} from "@/lib/equipeStatus";
import type { Especialidade, Integrante, Papel } from "@/lib/tipos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe — Oficina de Robótica" },
      {
        name: "description",
        content:
          "Cadastre os integrantes, veja o código pessoal de cada um e libere os ajudantes.",
      },
      { property: "og:title", content: "Equipe — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Quem faz o quê na equipe de robótica e o código de entrada de cada pessoa.",
      },
    ],
  }),
  component: TelaEquipe,
});

function TelaEquipe() {
  const { equipe, carregando, salvar, salvando } = useAluno({ area: "equipe" });
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel | "">("");
  const [aberto, setAberto] = useState(false);
  const [festa, setFesta] = useState(false);
  const [recado, setRecado] = useState("");
  const eraCompleta = useRef<boolean | null>(null);

  const faltantes = equipe ? papeisFaltantes(equipe.integrantes) : [];
  const completa = Boolean(equipe) && faltantes.length === 0;

  useEffect(() => {
    if (!equipe) return undefined;
    const virouCompleta = eraCompleta.current === false && completa;
    eraCompleta.current = completa;
    if (!virouCompleta) return undefined;
    setFesta(true);
    const t = setTimeout(() => setFesta(false), 2600);
    return () => clearTimeout(t);
  }, [completa, equipe]);

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const integrantes = equipe.integrantes;
  const codigos = codigosDaEquipe(integrantes);

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
    const primeiroAjudante = papel === "Ajudante" && ajudantesComChave(integrantes).length === 0;
    const novo: Integrante = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      papel,
      ...(primeiroAjudante ? { podeEditar: true } : {}),
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

  function trocarCodigo(id: string) {
    const codigo = novoCodigoPessoal(integrantes);
    salvar({ integrantes: integrantes.map((i) => (i.id === id ? { ...i, codigo } : i)) });
    setRecado("Código novo gerado. Avise a pessoa.");
    setTimeout(() => setRecado(""), 3000);
  }

  function alternarChave(id: string) {
    const alvo = integrantes.find((i) => i.id === id);
    if (!alvo) return;
    if (alvo.podeEditar && ajudantesComChave(integrantes).length <= 1) {
      setRecado(AVISO_ULTIMA_CHAVE);
      setTimeout(() => setRecado(""), 6000);
      return;
    }
    salvar({
      integrantes: integrantes.map((i) => (i.id === id ? { ...i, podeEditar: !i.podeEditar } : i)),
    });
  }

  async function copiarLista() {
    const texto = integrantes
      .map((i) => `${i.nome} — ${i.papel} — código ${codigos[i.id]}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(
        `Equipe ${equipe!.nomeEquipe} (turma ${equipe!.turma})\nCódigo da equipe: ${equipe!.codigoAcesso}\n\n${texto}`,
      );
      setRecado("Lista copiada.");
      setTimeout(() => setRecado(""), 2500);
    } catch {
      setRecado("Não conseguimos copiar neste aparelho.");
      setTimeout(() => setRecado(""), 2500);
    }
  }

  function imprimirTiras() {
    const tiras = integrantes
      .map(
        (i) =>
          `<div class="tira"><p class="papel">${i.papel}</p><p class="nome">${i.nome}</p>` +
          `<p class="linha">Equipe: <b>${equipe!.codigoAcesso}</b></p>` +
          `<p class="linha">Seu código: <b class="cod">${codigos[i.id]}</b></p></div>`,
      )
      .join("");
    const janela = window.open("", "_blank", "width=760,height=900");
    if (!janela) return;
    janela.document.write(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Códigos da equipe ${equipe!.nomeEquipe}</title>` +
        `<style>body{font-family:system-ui,sans-serif;padding:24px;color:#1b1b1b}h1{font-size:24px;margin:0 0 16px}` +
        `.tira{border:2px dashed #999;border-radius:10px;padding:14px 16px;margin-bottom:10px}` +
        `.papel{margin:0;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#666}` +
        `.nome{margin:2px 0 8px;font-size:22px;font-weight:800}.linha{margin:2px 0;font-size:15px}` +
        `.cod{font-family:monospace;font-size:22px;letter-spacing:4px}</style></head><body>` +
        `<h1>Códigos de entrada — ${equipe!.nomeEquipe} (turma ${equipe!.turma})</h1>${tiras}</body></html>`,
    );
    janela.document.close();
    janela.focus();
    janela.print();
  }

  return (
    <>
      <Cabecalho titulo="Equipe" icone={<Users className="size-6" />} salvando={salvando} />
      {festa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-6 animate-in fade-in">
          <div className="cartao-toque flex animate-in flex-col items-center gap-3 p-8 text-center zoom-in-50 duration-500">
            <PartyPopper className="size-16 animate-bounce text-primary" />
            <p className="font-display text-3xl font-extrabold">Equipe completa!</p>
            <p className="text-xl font-bold text-sucesso">Tudo liberado.</p>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        {!completa && (
          <p className="mb-4 flex items-start gap-2 rounded-2xl bg-alerta px-4 py-4 font-bold text-alerta-foreground">
            <Lock className="mt-0.5 size-5 shrink-0" /> Faltam: {listarFaltantes(faltantes)}.
            Cadastre a equipe completa para liberar o resto do site.
          </p>
        )}

        {recado && (
          <p className="mb-4 rounded-2xl bg-info px-4 py-4 font-bold text-info-foreground">
            {recado}
          </p>
        )}

        <div className="cartao-toque mb-5 p-4">
          <p className="text-base font-bold">
            {integrantes.length} de {MAXIMO_INTEGRANTES} cadastrados
          </p>
          <ul className="mt-3 space-y-1 text-sm font-semibold text-muted-foreground">
            {PAPEIS.map((p) => (
              <li key={p.papel}>
                {p.icone} <span className="text-foreground">{p.papel}</span> — {p.descricao}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={imprimirTiras}
              className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-extrabold text-secondary-foreground active:scale-95"
            >
              <Printer className="size-4" /> Imprimir os códigos
            </button>
            <button
              onClick={copiarLista}
              className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-extrabold text-muted-foreground active:scale-95"
            >
              <Copy className="size-4" /> Copiar a lista
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {integrantes.length === 0 && (
            <p className="rounded-2xl bg-muted p-5 text-center font-bold text-muted-foreground">
              Ninguém cadastrado ainda. Comecem pelo piloto!
            </p>
          )}
          {integrantes.map((integrante) => (
            <div key={integrante.id} className="cartao-toque p-4">
              <div className="flex items-center gap-3">
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

              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-muted p-3">
                <span className="text-sm font-bold text-muted-foreground">Código pessoal</span>
                <span className="font-mono text-2xl font-black tracking-[0.3em]">
                  {codigos[integrante.id]}
                </span>
                <button
                  onClick={() => trocarCodigo(integrante.id)}
                  className="ml-auto flex items-center gap-1 rounded-lg bg-card px-3 py-2 text-sm font-bold active:scale-95"
                >
                  <RefreshCw className="size-4" /> Gerar outro
                </button>
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                {DESCRICAO_ACESSO[integrante.papel]}
              </p>

              {integrante.papel === "Ajudante" && (
                <button
                  onClick={() => alternarChave(integrante.id)}
                  className={`mt-3 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left font-bold ${
                    integrante.podeEditar
                      ? "bg-sucesso text-sucesso-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span>
                    Pode editar o programa
                    <span className="block text-xs font-semibold opacity-90">
                      {integrante.podeEditar
                        ? "Mexe em melhorias, coreografias, botões e ajustes."
                        : "Só vê o checklist e a tela do código."}
                    </span>
                  </span>
                  <span
                    className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 ${
                      integrante.podeEditar ? "bg-card/40" : "bg-card"
                    }`}
                    aria-hidden
                  >
                    <span
                      className={`size-6 rounded-full bg-primary transition-transform ${
                        integrante.podeEditar ? "translate-x-6" : ""
                      }`}
                    />
                  </span>
                </button>
              )}
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
