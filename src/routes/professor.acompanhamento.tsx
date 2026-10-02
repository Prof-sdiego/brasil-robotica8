import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Download, NotebookPen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { baixarCsv } from "@/lib/avaliacao";
import { useEquipes } from "@/lib/equipes";
import {
  apagarRegistro,
  ciclosPendentes,
  cicloAtual,
  CRITERIOS_GRUPO,
  datasDoCiclo,
  DESCONTO_POR_OCORRENCIA,
  notaDoGrupo,
  OCORRENCIAS,
  ordenarTurmas,
  salvarRegistros,
  useRecarregarRegistros,
  useRegistros,
  type Registro,
  type RegistroNovo,
} from "@/lib/registros";
import { senhaProfessorGuardada } from "@/lib/sessao";
import type { Equipe } from "@/lib/tipos";

export const Route = createFileRoute("/professor/acompanhamento")({
  head: () => ({
    meta: [
      { title: "Avaliação do professor — Oficina de Robótica" },
      { name: "description", content: "Observações, ocorrências e avaliação quinzenal dos grupos." },
      { property: "og:title", content: "Avaliação do professor — Oficina de Robótica" },
      { property: "og:description", content: "Acompanhe os grupos a cada duas semanas e registre ocorrências." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Acompanhamento,
});

function virgula(v: number) {
  return v.toFixed(1).replace(".", ",");
}

function Acompanhamento() {
  const senha = senhaProfessorGuardada();
  const { data: equipes } = useEquipes();
  const { data: registros } = useRegistros(senha);
  const recarregar = useRecarregarRegistros();
  const atual = cicloAtual();

  const turmas = useMemo(
    () => ordenarTurmas(Array.from(new Set((equipes ?? []).map((e) => e.turma)))),
    [equipes],
  );
  const [turma, setTurma] = useState("");
  const turmaEscolhida = turma || turmas[0] || "";
  const daTurma = (equipes ?? []).filter((e) => e.turma === turmaEscolhida);
  const regs = registros ?? [];

  const [aberta, setAberta] = useState<string | null>(null);
  const [pulados, setPulados] = useState<string[]>([]);
  const [aulaAcabou, setAulaAcabou] = useState(false);

  async function guardar(linhas: RegistroNovo[]) {
    if (!senha) return false;
    try {
      await salvarRegistros(senha, linhas);
      await recarregar();
      return true;
    } catch {
      toast.error("Não foi possível guardar. Tente de novo.");
      return false;
    }
  }

  const pendentes = daTurma.filter((e) => ciclosPendentes(e.id, regs, atual).length > 0);
  const restantesHoje = pendentes.filter((e) => !pulados.includes(e.id));

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-16">
      <section className="cartao-toque p-5">
        <h2 className="flex items-center gap-2 text-2xl">
          <NotebookPen className="size-6 text-secondary" /> Avaliação do professor
        </h2>
        <p className="mt-1 font-semibold text-muted-foreground">
          Quinzena atual: {datasDoCiclo(atual)}. Ordem das aulas: 8A, 8C, 8B.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {turmas.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTurma(t);
                setAberta(null);
                setPulados([]);
                setAulaAcabou(false);
              }}
              className={`rounded-2xl px-5 py-3 text-lg font-extrabold ${
                t === turmaEscolhida ? "bg-secondary text-secondary-foreground" : "bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="cartao-toque p-5">
        <h2 className="text-xl">Avaliação dos grupos · {turmaEscolhida}</h2>
        <p className="text-sm font-semibold text-muted-foreground">
          Faltam {pendentes.length} de {daTurma.length} grupos. Quem não for avaliado hoje continua na
          lista na próxima aula.
        </p>

        {aulaAcabou ? (
          <div className="mt-4 rounded-2xl bg-info px-4 py-4 font-bold text-info-foreground">
            Aula encerrada.{" "}
            {pendentes.length === 0
              ? "Todos os grupos desta turma foram avaliados."
              : `${pendentes.length} grupo(s) ficam para a próxima aula: ${pendentes.map((e) => e.nomeEquipe).join(", ")}.`}
            <button
              onClick={() => {
                setAulaAcabou(false);
                setPulados([]);
              }}
              className="ml-3 rounded-full bg-card/30 px-3 py-1 text-sm"
            >
              Reabrir
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {daTurma.map((equipe) => {
                const ciclos = ciclosPendentes(equipe.id, regs, atual);
                const pulado = pulados.includes(equipe.id);
                const ultima = regs.find((r) => r.tipo === "avaliacao" && r.equipe_id === equipe.id);
                const nota = ultima ? notaDoGrupo(ultima) : null;
                return (
                  <div key={equipe.id} className="rounded-2xl border-2 border-input p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="flex-1 text-lg font-extrabold">{equipe.nomeEquipe}</p>
                      {ciclos.length === 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-sucesso px-3 py-1 text-sm font-bold text-sucesso-foreground">
                          <CheckCircle2 className="size-4" /> avaliado{nota !== null && ` · ${virgula(nota)}`}
                        </span>
                      ) : (
                        <>
                          {ciclos.length > 1 && (
                            <span className="rounded-full bg-alerta px-3 py-1 text-xs font-bold text-alerta-foreground">
                              {ciclos.length - 1} quinzena(s) atrasada(s)
                            </span>
                          )}
                          {pulado ? (
                            <button
                              onClick={() => setPulados(pulados.filter((id) => id !== equipe.id))}
                              className="rounded-full bg-muted px-3 py-2 text-sm font-bold"
                            >
                              Não avaliado hoje (desfazer)
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setAberta(aberta === equipe.id ? null : equipe.id)}
                                className="rounded-full bg-secondary px-4 py-2 text-sm font-extrabold text-secondary-foreground"
                              >
                                Avaliar
                              </button>
                              <button
                                onClick={() => {
                                  setPulados([...pulados, equipe.id]);
                                  if (aberta === equipe.id) setAberta(null);
                                }}
                                className="rounded-full bg-muted px-4 py-2 text-sm font-bold"
                              >
                                Não avaliar
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {aberta === equipe.id && ciclos.length > 0 && (
                      <FormularioGrupo
                        equipe={equipe}
                        ciclo={ciclos[0]!}
                        aoGuardar={async (linhas) => {
                          if (await guardar(linhas)) {
                            toast.success(`${equipe.nomeEquipe} avaliado.`);
                            const proxima = restantesHoje.find((e) => e.id !== equipe.id);
                            setAberta(proxima?.id ?? null);
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                setAulaAcabou(true);
                setAberta(null);
              }}
              className="mt-4 w-full rounded-2xl bg-primary px-4 py-4 text-lg font-extrabold text-primary-foreground"
            >
              A aula acabou
            </button>
          </>
        )}
      </section>

      <RegistroAvulso equipes={daTurma} aoGuardar={guardar} />

      <Planilhas turma={turmaEscolhida} equipes={daTurma} registros={regs} senha={senha} aoApagar={recarregar} />
    </main>
  );
}

function Notas({ valor, aoMudar }: { valor: number | undefined; aoMudar: (n: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: 11 }, (_, n) => (
        <button
          key={n}
          type="button"
          onClick={() => aoMudar(n)}
          className={`size-10 rounded-lg text-base font-extrabold ${
            valor === n ? "bg-secondary text-secondary-foreground" : "bg-muted"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function FormularioGrupo({
  equipe,
  ciclo,
  aoGuardar,
}: {
  equipe: Equipe;
  ciclo: number;
  aoGuardar: (linhas: RegistroNovo[]) => Promise<void>;
}) {
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [apontados, setApontados] = useState<Record<string, string[]>>({});
  const [obs, setObs] = useState("");
  const [guardando, setGuardando] = useState(false);
  const completo = CRITERIOS_GRUPO.every((c) => typeof notas[c.id] === "number");

  function alternar(integranteId: string, item: string) {
    const atuais = apontados[integranteId] ?? [];
    setApontados({
      ...apontados,
      [integranteId]: atuais.includes(item) ? atuais.filter((i) => i !== item) : [...atuais, item],
    });
  }

  async function enviar() {
    setGuardando(true);
    const base = { equipe_id: equipe.id, turma: equipe.turma, ciclo };
    const linhas: RegistroNovo[] = [
      { ...base, tipo: "avaliacao", integrante_id: null, integrante_nome: "", dados: notas, texto: obs },
    ];
    for (const integrante of equipe.integrantes) {
      for (const item of apontados[integrante.id] ?? []) {
        linhas.push({
          ...base,
          tipo: "ocorrencia",
          integrante_id: integrante.id,
          integrante_nome: integrante.nome,
          dados: { item },
          texto: "",
        });
      }
    }
    await aoGuardar(linhas);
    setGuardando(false);
  }

  return (
    <div className="mt-4 space-y-4">
      {ciclo !== cicloAtual() && (
        <p className="flex items-center gap-2 rounded-xl bg-alerta px-3 py-2 text-sm font-bold text-alerta-foreground">
          <AlertTriangle className="size-4" /> Esta é a avaliação atrasada da quinzena {datasDoCiclo(ciclo)}.
        </p>
      )}
      {CRITERIOS_GRUPO.map((c) => (
        <div key={c.id}>
          <p className="mb-1 font-bold">{c.nome}</p>
          <Notas valor={notas[c.id]} aoMudar={(n) => setNotas({ ...notas, [c.id]: n })} />
        </div>
      ))}
      <div>
        <p className="font-bold">Quer apontar algo de algum aluno?</p>
        <div className="mt-2 space-y-3">
          {equipe.integrantes.map((integrante) => (
            <div key={integrante.id} className="rounded-xl bg-muted/50 p-3">
              <p className="font-extrabold">
                {integrante.nome} <span className="text-sm text-muted-foreground">· {integrante.papel}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {OCORRENCIAS.map((item) => {
                  const ativo = (apontados[integrante.id] ?? []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => alternar(integrante.id, item)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        ativo ? "bg-destructive text-destructive-foreground" : "bg-card"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <textarea
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        rows={2}
        placeholder="Observação sobre o grupo (opcional)"
        className="w-full rounded-xl border-2 border-input bg-background p-3 font-semibold"
      />
      <button
        disabled={!completo || guardando}
        onClick={() => void enviar()}
        className="w-full rounded-2xl bg-secondary px-4 py-3 text-lg font-extrabold text-secondary-foreground disabled:opacity-50"
      >
        {guardando ? "Guardando..." : completo ? "Guardar e ir para o próximo" : "Dê nota nos quatro itens"}
      </button>
    </div>
  );
}

function RegistroAvulso({
  equipes,
  aoGuardar,
}: {
  equipes: Equipe[];
  aoGuardar: (linhas: RegistroNovo[]) => Promise<boolean>;
}) {
  const [equipeId, setEquipeId] = useState("");
  const [integranteId, setIntegranteId] = useState("");
  const [tipo, setTipo] = useState<"ocorrencia" | "observacao">("ocorrencia");
  const [item, setItem] = useState(OCORRENCIAS[0]!);
  const [texto, setTexto] = useState("");
  const equipe = equipes.find((e) => e.id === equipeId);
  const integrante = equipe?.integrantes.find((i) => i.id === integranteId);
  const pode = equipe && (tipo === "ocorrencia" ? !!integrante : texto.trim().length > 0);

  async function enviar() {
    if (!equipe) return;
    const ok = await aoGuardar([
      {
        tipo,
        equipe_id: equipe.id,
        turma: equipe.turma,
        integrante_id: integrante?.id ?? null,
        integrante_nome: integrante?.nome ?? "",
        ciclo: cicloAtual(),
        dados: tipo === "ocorrencia" ? { item } : {},
        texto,
      },
    ]);
    if (ok) {
      toast.success(tipo === "ocorrencia" ? "Ocorrência registrada." : "Observação guardada.");
      setTexto("");
    }
  }

  const campo = "w-full rounded-xl border-2 border-input bg-background px-3 py-3 font-bold";
  return (
    <section className="cartao-toque space-y-3 p-5">
      <h2 className="text-xl">Registrar ocorrência ou observação</h2>
      <div className="flex gap-2">
        {(["ocorrencia", "observacao"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className={`rounded-full px-4 py-2 font-bold ${tipo === t ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}
          >
            {t === "ocorrencia" ? "Ocorrência" : "Observação"}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <select value={equipeId} onChange={(e) => { setEquipeId(e.target.value); setIntegranteId(""); }} className={campo}>
          <option value="">Escolha o grupo</option>
          {equipes.map((e) => (
            <option key={e.id} value={e.id}>{e.nomeEquipe}</option>
          ))}
        </select>
        <select value={integranteId} onChange={(e) => setIntegranteId(e.target.value)} className={campo}>
          <option value="">{tipo === "ocorrencia" ? "Escolha o aluno" : "O grupo todo"}</option>
          {(equipe?.integrantes ?? []).map((i) => (
            <option key={i.id} value={i.id}>{i.nome}</option>
          ))}
        </select>
      </div>
      {tipo === "ocorrencia" && (
        <select value={item} onChange={(e) => setItem(e.target.value)} className={campo}>
          {OCORRENCIAS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )}
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={2}
        placeholder={tipo === "ocorrencia" ? "Detalhe (opcional)" : "Escreva a observação"}
        className="w-full rounded-xl border-2 border-input bg-background p-3 font-semibold"
      />
      <button
        disabled={!pode}
        onClick={() => void enviar()}
        className="w-full rounded-2xl bg-secondary px-4 py-3 font-extrabold text-secondary-foreground disabled:opacity-50"
      >
        Guardar
      </button>
    </section>
  );
}

function Planilhas({
  turma,
  equipes,
  registros,
  senha,
  aoApagar,
}: {
  turma: string;
  equipes: Equipe[];
  registros: Registro[];
  senha: string | null;
  aoApagar: () => Promise<void>;
}) {
  const ids = new Set(equipes.map((e) => e.id));
  const daTurma = registros.filter((r) => ids.has(r.equipe_id));
  const nomeEquipe = (id: string) => equipes.find((e) => e.id === id)?.nomeEquipe ?? "";
  const data = (r: Registro) => new Date(r.created_at).toLocaleDateString("pt-BR");

  const porAluno = new Map<string, { nome: string; equipe: string; itens: string[] }>();
  for (const r of daTurma.filter((r) => r.tipo === "ocorrencia")) {
    const chave = `${r.equipe_id}:${r.integrante_id}`;
    const atual = porAluno.get(chave) ?? { nome: r.integrante_nome, equipe: nomeEquipe(r.equipe_id), itens: [] };
    atual.itens.push(String(r.dados["item"] ?? ""));
    porAluno.set(chave, atual);
  }
  const linhasOcorrencias = Array.from(porAluno.values()).sort((a, b) => b.itens.length - a.itens.length);
  const avaliacoesGrupo = daTurma.filter((r) => r.tipo === "avaliacao");

  function csvGrupos() {
    const cab = ["Grupo", "Quinzena", ...CRITERIOS_GRUPO.map((c) => c.nome), "Nota", "Observação"];
    const linhas = avaliacoesGrupo.map((r) => [
      nomeEquipe(r.equipe_id),
      datasDoCiclo(r.ciclo ?? 0),
      ...CRITERIOS_GRUPO.map((c) => String(r.dados[c.id] ?? "")),
      virgula(notaDoGrupo(r) ?? 0),
      r.texto,
    ]);
    baixarCsv(`notas-grupos-${turma}.csv`, [cab, ...linhas].map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n"));
  }
  function csvOcorrencias() {
    const cab = ["Aluno", "Grupo", "Ocorrências", "Desconto", "Itens"];
    const linhas = linhasOcorrencias.map((l) => [
      l.nome, l.equipe, String(l.itens.length), virgula(l.itens.length * DESCONTO_POR_OCORRENCIA), l.itens.join(", "),
    ]);
    baixarCsv(`ocorrencias-${turma}.csv`, [cab, ...linhas].map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n"));
  }

  async function apagar(id: string) {
    if (!senha || !confirm("Apagar este registro?")) return;
    try {
      await apagarRegistro(senha, id);
      await aoApagar();
    } catch {
      toast.error("Não foi possível apagar.");
    }
  }

  return (
    <>
      <section className="cartao-toque p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex-1 text-xl">Planilha de ocorrências · {turma}</h2>
          <button onClick={csvOcorrencias} className="flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-sm font-bold">
            <Download className="size-4" /> Baixar
          </button>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          Cada ocorrência desconta {virgula(DESCONTO_POR_OCORRENCIA)} ponto, separado da nota do grupo.
        </p>
        {linhasOcorrencias.length === 0 ? (
          <p className="mt-3 font-bold text-muted-foreground">Nenhuma ocorrência nesta turma.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b-2"><th className="py-2">Aluno</th><th>Grupo</th><th>Qtd.</th><th>Desconto</th><th>Itens</th></tr>
            </thead>
            <tbody>
              {linhasOcorrencias.map((l) => (
                <tr key={`${l.equipe}${l.nome}`} className="border-b">
                  <td className="py-2 font-bold">{l.nome}</td>
                  <td>{l.equipe}</td>
                  <td>{l.itens.length}</td>
                  <td className="font-bold text-destructive">−{virgula(l.itens.length * DESCONTO_POR_OCORRENCIA)}</td>
                  <td className="text-xs">{l.itens.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="cartao-toque p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex-1 text-xl">Notas dos grupos · {turma}</h2>
          <button onClick={csvGrupos} className="flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-sm font-bold">
            <Download className="size-4" /> Baixar
          </button>
        </div>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b-2"><th className="py-2">Grupo</th><th>Média</th><th>Avaliações</th></tr>
          </thead>
          <tbody>
            {equipes.map((e) => {
              const notas = avaliacoesGrupo.filter((r) => r.equipe_id === e.id).map(notaDoGrupo).filter((n): n is number => n !== null);
              return (
                <tr key={e.id} className="border-b">
                  <td className="py-2 font-bold">{e.nomeEquipe}</td>
                  <td>{notas.length ? virgula(notas.reduce((a, b) => a + b, 0) / notas.length) : "—"}</td>
                  <td>{notas.map(virgula).join(" · ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="cartao-toque p-5">
        <h2 className="text-xl">Histórico · {turma}</h2>
        <ul className="mt-3 space-y-2">
          {daTurma.slice(0, 60).map((r) => (
            <li key={r.id} className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
              <span className="flex-1">
                <b>{data(r)}</b> · {nomeEquipe(r.equipe_id)}
                {r.integrante_nome && ` · ${r.integrante_nome}`} ·{" "}
                {r.tipo === "avaliacao"
                  ? `Avaliação do grupo: ${virgula(notaDoGrupo(r) ?? 0)}`
                  : r.tipo === "ocorrencia"
                    ? `Ocorrência: ${String(r.dados["item"] ?? "")}`
                    : "Observação"}
                {r.texto && ` — ${r.texto}`}
              </span>
              <button onClick={() => void apagar(r.id)} aria-label="Apagar registro" className="text-destructive">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {daTurma.length === 0 && <li className="font-bold text-muted-foreground">Nada registrado ainda.</li>}
        </ul>
      </section>
    </>
  );
}
