import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardPaste, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  atualizarCadastro,
  criarEquipes,
  gerarCodigoAcesso,
  gerarSenhaRobo,
  removerEquipe,
  useEquipes,
  type CadastroEquipe,
} from "@/lib/equipes";

export const Route = createFileRoute("/professor/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro de equipes — Oficina de Robótica" },
      {
        name: "description",
        content: "Crie, edite e importe as equipes da oficina com turma, nome e grupo de rádio.",
      },
      { property: "og:title", content: "Cadastro de equipes — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Gerencie as equipes da oficina de robótica e seus códigos de acesso.",
      },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const { data: equipes, isLoading } = useEquipes();
  const queryClient = useQueryClient();
  const [texto, setTexto] = useState("");
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["equipes"] });
  }

  async function importar() {
    const linhas = texto
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);
    if (linhas.length === 0) return;
    const usados = new Set((equipes ?? []).map((e) => e.grupoRadio));
    const novas = [];
    for (const linha of linhas) {
      const partes = linha.split(/[;,\t]/).map((p) => p.trim());
      const turma = partes[0] ?? "";
      const nomeEquipe = partes[1] ?? "";
      if (!turma || !nomeEquipe) continue;
      let grupoRadio = Number(partes[2]);
      if (!grupoRadio || grupoRadio < 11 || grupoRadio > 36) {
        grupoRadio = 11;
        while (usados.has(grupoRadio) && grupoRadio < 36) grupoRadio += 1;
      }
      usados.add(grupoRadio);
      novas.push({
        turma,
        nomeEquipe,
        grupoRadio,
        codigoAcesso: partes[3] || gerarCodigoAcesso(nomeEquipe),
        senhaRobo: (partes[4] || gerarSenhaRobo()).toUpperCase(),
        nomeMicrobit: partes[5] || "",
      });
    }
    if (novas.length === 0) {
      toast.error("Não encontrei nenhuma linha no formato turma; nome; rádio.");
      return;
    }
    try {
      await criarEquipes(novas);
      setTexto("");
      recarregar();
      toast.success(`${novas.length} equipes cadastradas.`);
    } catch {
      toast.error("Alguma equipe tem código de acesso repetido. Confira a lista.");
    }
  }

  async function adicionarUma() {
    const usados = new Set((equipes ?? []).map((e) => e.grupoRadio));
    let grupoRadio = 11;
    while (usados.has(grupoRadio) && grupoRadio < 36) grupoRadio += 1;
    const nomeEquipe = `Equipe ${(equipes?.length ?? 0) + 1}`;
    try {
      await criarEquipes([
        {
          turma: "8A",
          nomeEquipe,
          grupoRadio,
          codigoAcesso: gerarCodigoAcesso(nomeEquipe),
          senhaRobo: gerarSenhaRobo(),
          nomeMicrobit: "",
        },
      ]);
      recarregar();
    } catch {
      toast.error("Não foi possível criar a equipe.");
    }
  }

  if (isLoading) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 pb-16">
      <section className="cartao-toque p-5">
        <h2 className="flex items-center gap-2 text-xl">
          <ClipboardPaste className="size-5 text-secondary" /> Importar lista colada
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Uma equipe por linha, no formato: turma; nome da equipe; grupo de rádio; código de acesso;
          senha do robô; nome do micro:bit. Só os dois primeiros são obrigatórios — o resto o app
          preenche sozinho.
        </p>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
          placeholder={"8A; Os Invencíveis; 11\n8A; Robô Feroz\n8B; Time Trovão; 17; TROV-4K2M"}
          className="mt-3 w-full rounded-xl border-2 border-input bg-background p-4 font-mono text-sm outline-none focus:border-ring"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={importar}
            className="rounded-2xl bg-sucesso px-5 py-3 font-extrabold text-sucesso-foreground"
          >
            Cadastrar equipes da lista
          </button>
          <button
            onClick={adicionarUma}
            className="flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 font-extrabold text-secondary-foreground"
          >
            <Plus className="size-5" /> Criar uma equipe
          </button>
        </div>
      </section>

      <h2 className="mt-6 mb-3 text-xl">Equipes cadastradas ({equipes?.length ?? 0})</h2>
      <div className="space-y-3">
        {(equipes ?? []).map((equipe) => (
          <LinhaCadastro
            key={equipe.id}
            id={equipe.id}
            turma={equipe.turma}
            nomeEquipe={equipe.nomeEquipe}
            grupoRadio={equipe.grupoRadio}
  codigoAcesso={equipe.codigoAcesso}
            senhaRobo={equipe.senhaRobo}
            nomeMicrobit={equipe.nomeMicrobit}
            salvando={salvandoId === equipe.id}
            aoSalvar={async (dados) => {
              setSalvandoId(equipe.id);
              try {
                await atualizarCadastro(equipe.id, dados);
                recarregar();
                toast.success("Equipe atualizada.");
              } catch {
                toast.error("Código de acesso já usado por outra equipe.");
              } finally {
                setSalvandoId(null);
              }
            }}
            aoRemover={async () => {
              if (!confirm(`Remover ${equipe.nomeEquipe}? Todo o trabalho dela será apagado.`))
                return;
              await removerEquipe(equipe.id);
              recarregar();
            }}
          />
        ))}
      </div>
    </main>
  );
}

type DadosCadastro = CadastroEquipe;

function LinhaCadastro({
  turma,
  nomeEquipe,
  grupoRadio,
  codigoAcesso,
  senhaRobo,
  nomeMicrobit,
  salvando,
  aoSalvar,
  aoRemover,
}: DadosCadastro & {
  id: string;
  salvando: boolean;
  aoSalvar: (dados: DadosCadastro) => void;
  aoRemover: () => void;
}) {
  const [dados, setDados] = useState<DadosCadastro>({
    turma,
    nomeEquipe,
    grupoRadio,
    codigoAcesso,
    senhaRobo,
    nomeMicrobit,
  });

  return (
    <div className="cartao-toque grid grid-cols-2 gap-3 p-4 sm:grid-cols-7">
      <label className="text-xs font-bold">
        Turma
        <input
          value={dados.turma}
          onChange={(e) => setDados({ ...dados, turma: e.target.value })}
          className="mt-1 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-base font-bold"
        />
      </label>
      <label className="text-xs font-bold">
        Nome da equipe
        <input
          value={dados.nomeEquipe}
          onChange={(e) => setDados({ ...dados, nomeEquipe: e.target.value })}
          className="mt-1 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-base font-bold"
        />
      </label>
      <label className="text-xs font-bold">
        Grupo de rádio (11 a 36)
        <input
          type="number"
          min={11}
          max={36}
          value={dados.grupoRadio}
          onChange={(e) => setDados({ ...dados, grupoRadio: Number(e.target.value) })}
          className="mt-1 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-base font-bold"
        />
      </label>
      <label className="text-xs font-bold">
        Código de acesso
        <input
          value={dados.codigoAcesso}
          onChange={(e) => setDados({ ...dados, codigoAcesso: e.target.value.toUpperCase() })}
          className="mt-1 w-full rounded-lg border-2 border-input bg-background px-3 py-2 font-mono text-base font-bold"
        />
      </label>
      <label className="text-xs font-bold">
        Senha do robô (4 a 8)
        <input
          value={dados.senhaRobo}
          maxLength={8}
          onChange={(e) =>
            setDados({ ...dados, senhaRobo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })
          }
          className="mt-1 w-full rounded-lg border-2 border-input bg-background px-3 py-2 font-mono text-base font-bold"
        />
      </label>
      <label className="text-xs font-bold">
        Nome do micro:bit (5 letras)
        <input
          value={dados.nomeMicrobit}
          maxLength={5}
          placeholder="zuvit"
          onChange={(e) => setDados({ ...dados, nomeMicrobit: e.target.value.toLowerCase() })}
          className="mt-1 w-full rounded-lg border-2 border-input bg-background px-3 py-2 font-mono text-base font-bold"
        />
      </label>
      <div className="flex items-end gap-2">
        <button
          onClick={() => aoSalvar(dados)}
          disabled={salvando}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-sucesso px-3 py-3 font-bold text-sucesso-foreground disabled:opacity-50"
        >
          <Save className="size-4" /> Salvar
        </button>
        <button
          onClick={aoRemover}
          aria-label="Remover equipe"
          className="flex size-11 items-center justify-center rounded-xl bg-destructive text-destructive-foreground"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
