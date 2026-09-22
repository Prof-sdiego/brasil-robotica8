import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ClipboardList, KeyRound, Lock, UserX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { nomeComPapel } from "@/lib/acessos";
import {
  acharAlunoPorRa,
  apagarAvaliacoesDoAvaliador,
  conferirNascimento,
  CRITERIOS,
  desmarcarFalta,
  liberarEquipe,
  marcarFalta,
  mesmoCodigo,
  mesmoNome,
  salvarAvaliacoes,
  sortearPergunta,
  useAlunos,
  useAvaliacoes,
  useFaltas,
  useLiberacoes,
  useRecarregarAvaliacoes,
  useRodadas,
  type NotaNova,
  type Pergunta,
  type Rodada,
} from "@/lib/avaliacao";
import type { Integrante } from "@/lib/tipos";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/avaliar")({
  head: () => ({
    meta: [
      { title: "Avaliar a equipe — Oficina de Robótica" },
      {
        name: "description",
        content:
          "Cada integrante da equipe se avalia e avalia os colegas em participação, organização e colaboração.",
      },
      { property: "og:title", content: "Avaliar a equipe — Oficina de Robótica" },
      {
        property: "og:description",
        content: "Avaliação feita pela própria equipe, uma pessoa por vez.",
      },
    ],
  }),
  component: TelaAvaliar,
});

type Etapa =
  | { tipo: "fila" }
  | { tipo: "confirmar"; pessoa: Integrante; pergunta: Pergunta }
  | { tipo: "notas"; pessoa: Integrante; ra: string };

function TelaAvaliar() {
  const { equipe, carregando } = useAluno({ area: "equipe" });
  const { data: alunos } = useAlunos();
  const { data: rodadas } = useRodadas();
  const { data: avaliacoes } = useAvaliacoes(equipe?.id);
  const { data: faltas } = useFaltas(equipe?.id);
  const { data: liberacoes } = useLiberacoes();
  const recarregar = useRecarregarAvaliacoes(equipe?.id);

  const abertas = useMemo(() => (rodadas ?? []).filter((r) => r.aberta), [rodadas]);
  const [rodadaId, setRodadaId] = useState("");
  const rodada: Rodada | null = abertas.find((r) => r.id === rodadaId) ?? abertas[0] ?? null;

  const [etapa, setEtapa] = useState<Etapa>({ tipo: "fila" });
  const [ra, setRa] = useState("");
  const [resposta, setResposta] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [notas, setNotas] = useState<Record<string, Record<string, number>>>({});
  const [gravando, setGravando] = useState(false);
  const [recado, setRecado] = useState("");
  const [travadas, setTravadas] = useState<Record<string, boolean>>({});
  const temporizadores = useRef(new Map<string, number>());

  useEffect(() => {
    const todos = temporizadores.current;
    return () => todos.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    setEtapa({ tipo: "fila" });
    setNotas({});
    setRecado("");
  }, [rodada?.id]);

  const daRodada = useMemo(
    () => (avaliacoes ?? []).filter((a) => a.rodadaId === rodada?.id),
    [avaliacoes, rodada?.id],
  );
  const jaAvaliaram = useMemo(() => new Set(daRodada.map((a) => a.avaliadorId)), [daRodada]);
  const faltaram = useMemo(
    () =>
      new Set(
        (faltas ?? []).filter((f) => f.rodadaId === rodada?.id).map((f) => f.integranteId),
      ),
    [faltas, rodada?.id],
  );
  const liberada = (liberacoes ?? []).some(
    (l) => l.rodadaId === rodada?.id && l.equipeId === equipe?.id,
  );

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }

  const equipeAtual = equipe;

  if (!rodada) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8">
        <Link to="/painel" className="flex items-center gap-1 font-bold text-primary">
          <ArrowLeft className="size-4" /> Voltar ao painel
        </Link>
        <h1 className="mt-3 text-3xl">Avaliar a equipe</h1>
        <p className="mt-4 rounded-2xl bg-muted px-4 py-5 text-lg font-bold text-muted-foreground">
          Nenhuma avaliação está aberta agora. O professor abre quando for a hora.
        </p>
      </main>
    );
  }

  const rodadaAtual = rodada;
  const programador = equipe.integrantes.find((i) => i.papel === "Programador") ?? null;
  const pendentes = equipe.integrantes.filter(
    (i) => !jaAvaliaram.has(i.id) && !faltaram.has(i.id),
  );
  const soOProgramador = !liberada;
  const fila = soOProgramador
    ? pendentes.filter((i) => i.papel === "Programador")
    : pendentes;
  const proxima = fila[0] ?? null;

  function comecar(pessoa: Integrante) {
    setRa("");
    setResposta("");
    setCodigo("");
    setErro("");
    setEtapa({ tipo: "confirmar", pessoa, pergunta: sortearPergunta() });
  }

  async function confirmar(evento: React.FormEvent) {
    evento.preventDefault();
    if (etapa.tipo !== "confirmar") return;
    if (!liberada && !mesmoCodigo(codigo, rodadaAtual.codigo)) {
      setErro("Esse código não é o desta avaliação. Peça ao professor.");
      return;
    }
    const aluno = acharAlunoPorRa(alunos ?? [], ra);
    if (!aluno) {
      setErro("Não achei esse RA na lista da escola. Confira os números.");
      return;
    }
    if (!mesmoNome(aluno.nome, etapa.pessoa.nome)) {
      setErro(`Esse RA é de outra pessoa (${aluno.nome}). Digite o seu.`);
      return;
    }
    if (!conferirNascimento(aluno, etapa.pergunta, resposta)) {
      setErro("A data de nascimento não bate. Tente de novo.");
      return;
    }
    if (!liberada) {
      await liberarEquipe({
        rodadaId: rodadaAtual.id,
        equipeId: equipeAtual.id,
        integranteId: etapa.pessoa.id,
        nome: etapa.pessoa.nome,
      });
      recarregar();
    }
    setErro("");
    setNotas({});
    setEtapa({ tipo: "notas", pessoa: etapa.pessoa, ra: aluno.ra });
  }

  function nota(avaliadoId: string, criterio: string): number | null {
    const valor = notas[avaliadoId]?.[criterio];
    return typeof valor === "number" ? valor : null;
  }

  function mudarNota(avaliadoId: string, criterio: string, valor: number) {
    setNotas((atual) => ({
      ...atual,
      [avaliadoId]: { ...(atual[avaliadoId] ?? {}), [criterio]: valor },
    }));
  }

  const completo =
    etapa.tipo === "notas" &&
    equipe.integrantes.every((alvo) =>
      CRITERIOS.every((c) => nota(alvo.id, c.id) !== null),
    );

  async function gravar() {
    if (etapa.tipo !== "notas" || !completo) return;
    setGravando(true);
    try {
      const linhas: NotaNova[] = equipeAtual.integrantes.map((alvo) => ({
        avaliadoId: alvo.id,
        avaliadoNome: alvo.nome,
        participacao: nota(alvo.id, "participacao") ?? 0,
        organizacao: nota(alvo.id, "organizacao") ?? 0,
        colaboracao: nota(alvo.id, "colaboracao") ?? 0,
      }));
      await salvarAvaliacoes({
        rodadaId: rodadaAtual.id,
        bimestre: rodadaAtual.bimestre,
        equipeId: equipeAtual.id,
        turma: equipeAtual.turma,
        avaliadorId: etapa.pessoa.id,
        avaliadorNome: etapa.pessoa.nome,
        avaliadorRa: etapa.ra,
        notas: linhas,
      });
      recarregar();
      setRecado(`Notas de ${etapa.pessoa.nome} guardadas. Ninguém mais consegue vê-las.`);
      setNotas({});
      setEtapa({ tipo: "fila" });
    } catch {
      setErro("Não deu para guardar agora. Tente de novo.");
    } finally {
      setGravando(false);
    }
  }

  async function faltou(pessoa: Integrante) {
    await marcarFalta(rodadaAtual.id, rodadaAtual.bimestre, equipeAtual.id, pessoa.id, pessoa.nome);
    recarregar();
    setRecado(`${pessoa.nome} ficou marcado como faltou. Dá para desfazer aqui embaixo.`);
  }

  async function reabrir(pessoa: Integrante) {
    await apagarAvaliacoesDoAvaliador(rodadaAtual.id, equipeAtual.id, pessoa.id);
    recarregar();
    setNotas({});
    setRecado(`As notas de ${pessoa.nome} foram apagadas. Ele precisa avaliar tudo de novo.`);
  }

  if (etapa.tipo === "notas") {
    const pessoa = etapa.pessoa;
    return (
      <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
        <h1 className="text-3xl">Oi, {pessoa.nome.split(" ")[0]}!</h1>
        <p className="mt-2 font-semibold text-muted-foreground">
          Dê uma nota de 0 a 10 em cada critério, para você e para cada colega. Ninguém vai ver
          essas notas depois — nem você.
        </p>

        {equipe.integrantes.map((alvo) => (
          <section key={alvo.id} className="cartao-toque mt-4 p-5">
            <h2 className="text-xl">
              {alvo.id === pessoa.id ? `${alvo.nome} (você)` : alvo.nome}
            </h2>
            <p className="text-sm font-bold text-muted-foreground">{nomeComPapel(alvo)}</p>
            {CRITERIOS.map((criterio) => (
              <div key={criterio.id} className="mt-4">
                <p className="font-bold">{criterio.nome}</p>
                <p className="text-sm font-semibold text-muted-foreground">{criterio.ajuda}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from({ length: 11 }, (_, valor) => {
                    const escolhida = nota(alvo.id, criterio.id) === valor;
                    return (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => mudarNota(alvo.id, criterio.id, valor)}
                        className={`size-11 rounded-xl text-lg font-extrabold ${
                          escolhida
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {valor}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}

        {erro && (
          <p className="mt-4 rounded-xl bg-destructive px-4 py-3 font-bold text-destructive-foreground">
            {erro}
          </p>
        )}

        <button
          onClick={gravar}
          disabled={!completo || gravando}
          className="mt-5 w-full rounded-2xl bg-sucesso px-4 py-5 text-2xl font-extrabold text-sucesso-foreground shadow-cartao disabled:opacity-50"
        >
          {gravando ? "Guardando..." : "Terminei, guardar minhas notas"}
        </button>
        {!completo && (
          <p className="mt-2 text-center text-sm font-bold text-muted-foreground">
            Falta dar nota em todos os critérios de cada pessoa.
          </p>
        )}
        <button
          onClick={() => setEtapa({ tipo: "fila" })}
          className="mt-3 w-full rounded-2xl bg-muted px-4 py-4 font-bold text-muted-foreground"
        >
          Cancelar e voltar para a fila
        </button>
      </main>
    );
  }

  if (etapa.tipo === "confirmar") {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={confirmar} className="cartao-toque space-y-4 p-6">
          <h1 className="text-2xl">É você, {etapa.pessoa.nome}?</h1>
          <p className="font-semibold text-muted-foreground">
            Confirme com o seu RA e responda a pergunta. Isso evita alguém avaliar no seu lugar.
          </p>
          {!liberada && (
            <>
              <label className="flex items-center gap-2 font-bold" htmlFor="codigo">
                <KeyRound className="size-5 text-primary" /> Código desta avaliação
              </label>
              <p className="text-sm font-semibold text-muted-foreground">
                O professor dita o código. Ele é pedido só uma vez por equipe, para o programador.
              </p>
              <input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                autoComplete="off"
                className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-center text-2xl font-extrabold uppercase tracking-widest outline-none focus:border-ring"
              />
            </>
          )}
          <label className="block font-bold" htmlFor="ra">
            Seu RA
          </label>
          <input
            id="ra"
            value={ra}
            onChange={(e) => setRa(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-center text-xl font-bold outline-none focus:border-ring"
          />
          <label className="block font-bold" htmlFor="resposta">
            {etapa.pergunta.texto}
          </label>
          <input
            id="resposta"
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            autoComplete="off"
            className="w-full rounded-xl border-2 border-input bg-background px-4 py-4 text-center text-xl font-bold outline-none focus:border-ring"
          />
          {erro && (
            <p className="rounded-xl bg-destructive px-4 py-3 font-bold text-destructive-foreground">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={!ra.trim() || !resposta.trim() || (!liberada && !codigo.trim())}
            className="w-full rounded-2xl bg-primary px-4 py-5 text-xl font-extrabold text-primary-foreground shadow-cartao disabled:opacity-50"
          >
            Sou eu, começar
          </button>
          <button
            type="button"
            onClick={() => setEtapa({ tipo: "fila" })}
            className="w-full rounded-2xl bg-muted px-4 py-4 font-bold text-muted-foreground"
          >
            Voltar
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <Link to="/painel" className="flex items-center gap-1 font-bold text-primary">
        <ArrowLeft className="size-4" /> Voltar ao painel
      </Link>
      <h1 className="mt-3 flex items-center gap-2 text-3xl">
        <ClipboardList className="size-8 text-primary" /> Avaliar a equipe
      </h1>
      <p className="mt-2 font-semibold text-muted-foreground">
        Passem o celular de mão em mão: o site chama uma pessoa por vez.
      </p>

      {abertas.length > 1 && (
        <label className="mt-4 block font-bold">
          Qual avaliação?
          <select
            value={rodadaAtual.id}
            onChange={(e) => setRodadaId(e.target.value)}
            className="mt-2 w-full rounded-xl border-2 border-input bg-card px-4 py-4 text-lg font-bold"
          >
            {abertas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </label>
      )}

      <p className="mt-4 rounded-2xl bg-info px-4 py-4 font-extrabold text-info-foreground">
        {rodadaAtual.nome}
        <span className="block text-sm font-bold">
          {rodadaAtual.tipo === "checkpoint" ? "Checkpoint" : "Avaliação do bimestre"} ·{" "}
          {rodadaAtual.bimestre}º bimestre
        </span>
      </p>

      {recado && (
        <p className="mt-4 rounded-2xl bg-info px-4 py-4 font-bold text-info-foreground">{recado}</p>
      )}

      {soOProgramador && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-alerta px-4 py-4 font-bold text-alerta-foreground">
          <KeyRound className="mt-1 size-5 shrink-0" />
          {programador
            ? `${programador.nome} começa: o programador digita o código desta avaliação uma vez e libera a equipe.`
            : "A equipe ainda não tem programador cadastrado. Ele precisa começar."}
        </p>
      )}

      {proxima ? (
        <section className="cartao-toque mt-5 p-5">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Agora é a vez de
          </p>
          <h2 className="font-display text-3xl font-bold">{proxima.nome}</h2>
          <p className="font-bold text-muted-foreground">{nomeComPapel(proxima)}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => comecar(proxima)}
              className="flex-1 rounded-2xl bg-primary px-4 py-5 text-xl font-extrabold text-primary-foreground shadow-cartao"
            >
              Eu sou {proxima.nome.split(" ")[0]}
            </button>
            <button
              onClick={() => faltou(proxima)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-alerta px-4 py-5 text-lg font-extrabold text-alerta-foreground"
            >
              <UserX className="size-5" /> Faltou
            </button>
          </div>
        </section>
      ) : soOProgramador ? null : (
        <p className="mt-5 flex items-center gap-2 rounded-2xl bg-sucesso px-4 py-5 text-lg font-extrabold text-sucesso-foreground">
          <CheckCircle2 className="size-6" /> Todo mundo da equipe já passou por aqui.
        </p>
      )}

      <h2 className="mt-7 text-xl">Como está a equipe</h2>
      <div className="mt-3 space-y-2">
        {equipe.integrantes.map((pessoa) => {
          const respondeu = jaAvaliaram.has(pessoa.id);
          const faltouAgora = faltaram.has(pessoa.id);
          return (
            <div
              key={pessoa.id}
              className="cartao-toque flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <span className="font-bold">{pessoa.nome}</span>
              <span className="text-sm font-bold text-muted-foreground">
                {nomeComPapel(pessoa)}
              </span>
              <span className="ml-auto text-sm font-extrabold">
                {respondeu ? (
                  <span className="flex items-center gap-1 text-sucesso">
                    <Lock className="size-4" /> já avaliou
                  </span>
                ) : faltouAgora ? (
                  "faltou"
                ) : (
                  "ainda não avaliou"
                )}
              </span>
              {respondeu && (
                <button
                  onClick={() => reabrir(pessoa)}
                  className="rounded-xl bg-muted px-3 py-2 text-sm font-bold text-muted-foreground"
                >
                  Editar (apaga as notas)
                </button>
              )}
              {faltouAgora && (
                <button
                  onClick={async () => {
                    await desmarcarFalta(rodadaAtual.id, equipe.id, pessoa.id);
                    recarregar();
                  }}
                  className="rounded-xl bg-muted px-3 py-2 text-sm font-bold text-muted-foreground"
                >
                  Voltou, quero chamar
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 rounded-2xl bg-muted px-4 py-4 text-sm font-bold text-muted-foreground">
        As notas ficam escondidas assim que são guardadas. Se alguém pedir para editar, as notas
        antigas são apagadas e ele preenche tudo de novo.
      </p>
    </main>
  );
}
